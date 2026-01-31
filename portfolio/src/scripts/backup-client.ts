/**
 * Backup Client: Collects creative content from IndexedDB and
 * sends it to the cloud backup server.
 *
 * Features:
 * - createBackup(): Gather all data and upload to server
 * - listBackups(): Get available backups from server
 * - restoreFromBackup(): Download backup and write to IndexedDB
 * - Auto-retry: 3 attempts with exponential backoff
 * - Auto-backup: triggered on app close (visibilitychange)
 *
 * Backup scope: atoms, compositions, snapshots, voice notes (metadata),
 * config overrides. Voice note audio blobs are NOT backed up (too large).
 */

import { getDB, getAllAtomsSorted } from './db';
import type { AtomMetadata, VoiceNote, ConfigOverride } from './db';
import { getAllCompositions } from './composition-store';

const API_BASE = '/api';
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000; // 1s, 2s, 4s exponential backoff

// ---- Types ----

export interface BackupSummary {
  id: string;
  timestamp: string;
  clientTimestamp: string;
  size: number;
  counts: {
    atoms: number;
    compositions: number;
    snapshots: number;
    voiceNotes: number;
  };
}

export interface BackupData {
  atoms: AtomMetadata[];
  compositions: unknown[];
  snapshots: unknown[];
  voiceNotes: VoiceNoteMetadata[];
  configOverrides: ConfigOverride[];
}

interface VoiceNoteMetadata {
  id: number;
  atomSlug: string;
  mimeType: string;
  transcript: string;
  createdAt: string;
  // audioBlob is NOT included (too large for cloud backup)
}

export type BackupStatus = 'idle' | 'backing-up' | 'success' | 'error';

// ---- State ----

let currentStatus: BackupStatus = 'idle';
let lastBackupTime: string | null = null;
let lastError: string | null = null;

// ---- Core Functions ----

/**
 * Create a full backup of all creative content.
 * Collects from IndexedDB and uploads to server.
 *
 * @returns Backup summary on success, null on failure
 */
export async function createBackup(): Promise<BackupSummary | null> {
  if (currentStatus === 'backing-up') {
    console.log('[backup] Backup already in progress');
    return null;
  }

  currentStatus = 'backing-up';
  dispatchStatusEvent();

  try {
    // Collect all data from IndexedDB
    const data = await collectBackupData();

    // Upload to server with retry
    const result = await fetchWithRetry(`${API_BASE}/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        clientTimestamp: new Date().toISOString(),
      }),
    });

    if (!result.ok) {
      throw new Error(`Server returned ${result.status}`);
    }

    const summary = await result.json();

    // Mark items as synced in IndexedDB
    await markAsSynced();

    currentStatus = 'success';
    lastBackupTime = new Date().toISOString();
    lastError = null;
    dispatchStatusEvent();

    console.log(`[backup] Complete: ${summary.id} (${Math.round(summary.size / 1024)}KB)`);
    return summary;
  } catch (err) {
    currentStatus = 'error';
    lastError = err instanceof Error ? err.message : 'Unknown error';
    dispatchStatusEvent();

    console.error('[backup] Failed:', err);
    return null;
  }
}

/**
 * List all available backups from the server.
 */
export async function listBackups(): Promise<BackupSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/backup/list`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const data = await res.json();
    return data.backups || [];
  } catch (err) {
    console.error('[backup] Failed to list backups:', err);
    return [];
  }
}

/**
 * Restore from a specific backup.
 * Downloads backup data and writes selected items to IndexedDB.
 *
 * @param backupId - ID of the backup to restore from
 * @param items - Which categories to restore (all if omitted)
 * @returns Object describing what was restored, or null on failure
 */
export async function restoreFromBackup(
  backupId: string,
  items?: {
    atoms?: boolean;
    compositions?: boolean;
    snapshots?: boolean;
    voiceNotes?: boolean;
    configOverrides?: boolean;
  },
): Promise<{
  atomsRestored: number;
  compositionsRestored: number;
  snapshotsRestored: number;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId, items }),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const backup = await res.json();
    const data = backup.data;
    const db = await getDB();

    let atomsRestored = 0;
    let compositionsRestored = 0;
    let snapshotsRestored = 0;

    // Restore atoms
    if (data.atoms && data.atoms.length > 0) {
      const tx = db.transaction('atoms', 'readwrite');
      for (const atom of data.atoms) {
        await tx.store.put(atom);
        atomsRestored++;
      }
      await tx.done;
    }

    // Restore compositions
    if (data.compositions && data.compositions.length > 0) {
      const tx = db.transaction('compositions', 'readwrite');
      for (const comp of data.compositions) {
        await tx.store.put(comp);
        compositionsRestored++;
      }
      await tx.done;
    }

    // Restore snapshots
    if (data.snapshots && data.snapshots.length > 0) {
      const tx = db.transaction('snapshots', 'readwrite');
      for (const snap of data.snapshots) {
        await tx.store.put(snap);
        snapshotsRestored++;
      }
      await tx.done;
    }

    // Restore config overrides
    if (data.configOverrides && data.configOverrides.length > 0) {
      const tx = db.transaction('configOverrides', 'readwrite');
      for (const override of data.configOverrides) {
        await tx.store.put(override);
      }
      await tx.done;
    }

    console.log(`[backup] Restored: ${atomsRestored} atoms, ${compositionsRestored} compositions, ${snapshotsRestored} snapshots`);

    return { atomsRestored, compositionsRestored, snapshotsRestored };
  } catch (err) {
    console.error('[backup] Restore failed:', err);
    return null;
  }
}

/**
 * Get current backup status for UI display.
 */
export function getBackupStatus(): {
  status: BackupStatus;
  lastBackupTime: string | null;
  lastError: string | null;
} {
  return {
    status: currentStatus,
    lastBackupTime,
    lastError,
  };
}

// ---- Auto-backup on app close ----

let autoBackupEnabled = true;

/**
 * Enable auto-backup on app close.
 * Uses visibilitychange (more reliable than beforeunload on mobile).
 */
export function enableAutoBackup(): void {
  autoBackupEnabled = true;

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
}

/**
 * Disable auto-backup.
 */
export function disableAutoBackup(): void {
  autoBackupEnabled = false;

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('beforeunload', handleBeforeUnload);
}

function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden' && autoBackupEnabled) {
    // Use sendBeacon for reliability (survives page close)
    triggerBackupBeacon();
  }
}

function handleBeforeUnload(): void {
  if (autoBackupEnabled) {
    triggerBackupBeacon();
  }
}

/**
 * Trigger backup using sendBeacon (reliable on page close).
 * sendBeacon is fire-and-forget: it survives page navigation/close.
 */
async function triggerBackupBeacon(): Promise<void> {
  try {
    const data = await collectBackupData();
    const payload = JSON.stringify({
      ...data,
      clientTimestamp: new Date().toISOString(),
    });

    // Try sendBeacon first (more reliable on close)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(`${API_BASE}/backup`, blob);
      if (sent) {
        console.log('[backup] Beacon sent');
        return;
      }
    }

    // Fallback: regular fetch with keepalive
    fetch(`${API_BASE}/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Best-effort on page close
    });
  } catch {
    // Best-effort on page close
  }
}

// ---- Helpers ----

/**
 * Collect all backup-worthy data from IndexedDB.
 */
async function collectBackupData(): Promise<BackupData> {
  const db = await getDB();

  // Atoms
  const atoms = await getAllAtomsSorted();

  // Compositions
  const compositions = await getAllCompositions();

  // Snapshots
  let snapshots: unknown[] = [];
  try {
    snapshots = await db.getAll('snapshots');
  } catch {
    // Snapshots store may not exist yet
  }

  // Voice notes (metadata only, no audio blobs)
  let voiceNotes: VoiceNoteMetadata[] = [];
  try {
    const allVoiceNotes = await db.getAll('voiceNotes') as VoiceNote[];
    voiceNotes = allVoiceNotes.map(vn => ({
      id: vn.id!,
      atomSlug: vn.atomSlug,
      mimeType: vn.mimeType,
      transcript: vn.transcript,
      createdAt: vn.createdAt,
    }));
  } catch {
    // Voice notes store may not be populated
  }

  // Config overrides
  let configOverrides: ConfigOverride[] = [];
  try {
    configOverrides = await db.getAll('configOverrides');
  } catch {
    // Config overrides store may not be populated
  }

  return { atoms, compositions, snapshots, voiceNotes, configOverrides };
}

/**
 * Mark all items as synced in IndexedDB after successful backup.
 */
async function markAsSynced(): Promise<void> {
  const db = await getDB();

  // Mark compositions as synced
  try {
    const tx = db.transaction('compositions', 'readwrite');
    const compositions = await tx.store.getAll();
    for (const comp of compositions) {
      if (!comp.synced) {
        comp.synced = true;
        await tx.store.put(comp);
      }
    }
    await tx.done;
  } catch { /* ignore */ }

  // Mark snapshots as synced
  try {
    const tx = db.transaction('snapshots', 'readwrite');
    const snapshots = await tx.store.getAll();
    for (const snap of snapshots) {
      if (!snap.synced) {
        snap.synced = true;
        await tx.store.put(snap);
      }
    }
    await tx.done;
  } catch { /* ignore */ }
}

/**
 * Fetch with exponential backoff retry.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempt = 1,
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (res.ok) return res;

    // Server error (5xx): retry
    if (res.status >= 500 && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      console.log(`[backup] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, attempt + 1);
    }

    return res; // Client error or max retries reached
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      console.log(`[backup] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms (network error)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw err;
  }
}

/**
 * Dispatch backup status event for UI binding.
 */
function dispatchStatusEvent(): void {
  window.dispatchEvent(new CustomEvent('eoe:backup-status', {
    detail: {
      status: currentStatus,
      lastBackupTime,
      lastError,
    },
  }));
}
