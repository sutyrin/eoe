/**
 * Composition snapshot creation and loading.
 *
 * A snapshot is an immutable, self-contained copy of a composition.
 * Unlike drafts, snapshots capture ALL atom code inline, ensuring
 * "lock in a moment" behavior even if original atoms change later.
 *
 * Design decisions:
 * - Hybrid structure: slug for reference + inline code for immutability
 * - Snapshots stored in separate IndexedDB store from draft compositions
 * - Loading a snapshot does NOT modify the source composition
 * - Snapshots suitable for shareable URLs (/c/[id])
 */
import { getDB } from './db';
import type { AtomMetadata } from './db';
import type {
  Composition,
  CompositionSnapshot,
  SnapshotAtom,
  ParameterRoute,
  AtomNodeData,
} from './composition-types';
import { generateId, parseAtomParameters } from './composition-types';
import type { Node } from 'reactflow';

// ---- Snapshot CRUD ----

/**
 * Create an immutable snapshot from a draft composition.
 * Loads atom code from IndexedDB and embeds it inline.
 */
export async function createSnapshotFromComposition(
  composition: Composition,
  atomsMap: Map<string, AtomMetadata>,
): Promise<CompositionSnapshot> {
  const snapshotAtoms: SnapshotAtom[] = [];

  for (const compAtom of composition.atoms) {
    const metadata = atomsMap.get(compAtom.atomSlug);

    if (!metadata) {
      throw new Error(`Cannot create snapshot: atom ${compAtom.atomSlug} not found in IndexedDB`);
    }

    snapshotAtoms.push({
      nodeId: compAtom.nodeId,
      atomSlug: compAtom.atomSlug,
      position: compAtom.position,
      title: metadata.title,
      type: metadata.type,
      code: metadata.code,
      configJson: metadata.configJson,
      paramOverrides: compAtom.paramOverrides,
    });
  }

  const snapshot: CompositionSnapshot = {
    id: generateId(),
    compositionId: composition.id,
    name: composition.name,
    createdAt: new Date().toISOString(),
    playbackMode: composition.playbackMode,
    viewport: composition.viewport,
    atoms: snapshotAtoms,
    routes: composition.routes,
    synced: false,
  };

  return snapshot;
}

/**
 * Save a snapshot to IndexedDB.
 */
export async function saveSnapshot(snapshot: CompositionSnapshot): Promise<void> {
  const db = await getDB();
  await db.put('snapshots', snapshot);
}

/**
 * Load a snapshot by ID.
 */
export async function getSnapshot(id: string): Promise<CompositionSnapshot | undefined> {
  const db = await getDB();
  return db.get('snapshots', id);
}

/**
 * Get all snapshots, sorted by creation date (most recent first).
 */
export async function getAllSnapshots(): Promise<CompositionSnapshot[]> {
  const db = await getDB();
  const snapshots = await db.getAllFromIndex('snapshots', 'createdAt');
  return snapshots.reverse();
}

/**
 * Get all snapshots for a specific composition.
 */
export async function getSnapshotsForComposition(compositionId: string): Promise<CompositionSnapshot[]> {
  const db = await getDB();
  const snapshots = await db.getAllFromIndex('snapshots', 'compositionId', compositionId);
  return snapshots.reverse(); // Most recent first
}

/**
 * Delete a snapshot.
 */
export async function deleteSnapshot(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('snapshots', id);
}

// ---- Snapshot Loading for Preview ----

/**
 * Build a React Flow nodes array from a snapshot.
 * Unlike buildNodes for drafts, this uses inline code from the snapshot.
 */
export function buildNodesFromSnapshot(snapshot: CompositionSnapshot): Node<AtomNodeData>[] {
  return snapshot.atoms.map(snapAtom => {
    const parameters = parseAtomParameters(snapAtom.configJson);

    return {
      id: snapAtom.nodeId,
      type: 'atomNode',
      position: snapAtom.position,
      data: {
        atomSlug: snapAtom.atomSlug,
        atomTitle: snapAtom.title,
        atomType: snapAtom.type,
        parameters,
        paramOverrides: snapAtom.paramOverrides,
        missing: false,
      },
    };
  });
}

/**
 * Build an atoms lookup map from a snapshot for preview playback.
 * Returns a map of nodeId -> atom metadata that the preview engine can use.
 *
 * IMPORTANT: This creates synthetic AtomMetadata from inline snapshot code,
 * NOT from IndexedDB. This is how snapshots achieve immutability.
 */
export function buildAtomsMapFromSnapshot(snapshot: CompositionSnapshot): Map<string, AtomMetadata> {
  const map = new Map<string, AtomMetadata>();

  for (const snapAtom of snapshot.atoms) {
    // Create synthetic metadata from snapshot data
    const metadata: AtomMetadata = {
      slug: snapAtom.atomSlug,
      title: snapAtom.title,
      date: snapshot.createdAt.split('T')[0],  // Extract YYYY-MM-DD
      type: snapAtom.type,
      stage: 'done',  // Snapshots are always "done"
      thumbnailUrl: '',  // Snapshots don't need thumbnails
      code: snapAtom.code,  // INLINE CODE - this is the key immutability guarantee
      notes: '',
      configJson: snapAtom.configJson,
    };

    map.set(snapAtom.atomSlug, metadata);
  }

  return map;
}

// ---- Snapshot Export/Import (for cloud backup in 06-03) ----

/**
 * Export a snapshot as JSON string.
 * For local download or cloud backup.
 */
export function exportSnapshotJSON(snapshot: CompositionSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Import a snapshot from JSON string.
 * For cloud restore or local file import.
 */
export function importSnapshotJSON(jsonString: string): CompositionSnapshot {
  const snapshot = JSON.parse(jsonString) as CompositionSnapshot;

  // Validate required fields
  if (!snapshot.id || !snapshot.compositionId || !snapshot.atoms || !snapshot.routes) {
    throw new Error('Invalid snapshot JSON: missing required fields');
  }

  return snapshot;
}

// ---- Snapshot Metadata Helpers ----

/**
 * Calculate snapshot size in bytes (for display in UI).
 */
export function getSnapshotSize(snapshot: CompositionSnapshot): number {
  return new Blob([JSON.stringify(snapshot)]).size;
}

/**
 * Format snapshot size for display (KB, MB).
 */
export function formatSnapshotSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
