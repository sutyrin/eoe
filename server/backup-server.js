/**
 * EOE Backup Server
 *
 * Simple HTTP server for cloud backup/restore of creative content.
 *
 * Endpoints:
 * - POST /api/backup          Upload a full backup (atoms, notes, compositions, snapshots)
 * - GET  /api/backup/latest   Get the most recent backup
 * - GET  /api/backup/list     List all available backups with timestamps and sizes
 * - POST /api/restore         Restore a specific backup by ID (returns full data)
 * - GET  /api/backup/:id      Get a specific backup by ID
 * - DELETE /api/backup/:id    Delete a specific backup
 * - GET  /api/health          Health check
 *
 * Storage: JSON files in /data/backups/ directory
 * Retention: All backups kept indefinitely
 * Limits: None enforced (user manages storage)
 */

import express from 'express';
import cors from 'cors';
import { readdir, readFile, writeFile, mkdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3081;
const DATA_DIR = process.env.DATA_DIR || '/data/backups';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large backups with atom code

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
    console.log(`[backup] Created data directory: ${DATA_DIR}`);
  }
}

// Generate backup filename
function backupFilename(id) {
  return `backup-${id}.json`;
}

// Generate backup ID (timestamp-based for sorting)
function generateBackupId() {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-');
  const rand = Math.random().toString(36).substring(2, 6);
  return `${ts}-${rand}`;
}

// ---- Endpoints ----

/**
 * POST /api/backup
 * Upload a full backup.
 *
 * Body: {
 *   atoms: AtomMetadata[],
 *   compositions: Composition[],
 *   snapshots: CompositionSnapshot[],
 *   voiceNotes: VoiceNoteMetadata[],  (metadata only, no blobs)
 *   configOverrides: ConfigOverride[],
 *   clientTimestamp: string  (ISO timestamp from client)
 * }
 *
 * Returns: { id, timestamp, size }
 */
app.post('/api/backup', async (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ error: 'Invalid backup data' });
    }

    const id = generateBackupId();
    const timestamp = new Date().toISOString();

    const backup = {
      id,
      timestamp,
      clientTimestamp: backupData.clientTimestamp || timestamp,
      version: 1,  // Backup format version
      data: {
        atoms: backupData.atoms || [],
        compositions: backupData.compositions || [],
        snapshots: backupData.snapshots || [],
        voiceNotes: backupData.voiceNotes || [],
        configOverrides: backupData.configOverrides || [],
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const filepath = join(DATA_DIR, backupFilename(id));
    await writeFile(filepath, json, 'utf-8');

    const size = Buffer.byteLength(json, 'utf-8');
    console.log(`[backup] Created: ${id} (${Math.round(size / 1024)}KB)`);

    res.json({ id, timestamp, size });
  } catch (err) {
    console.error('[backup] Error creating backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

/**
 * GET /api/backup/latest
 * Get the most recent backup.
 */
app.get('/api/backup/latest', async (req, res) => {
  try {
    const files = await readdir(DATA_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      return res.status(404).json({ error: 'No backups found' });
    }

    const filepath = join(DATA_DIR, backupFiles[0]);
    const content = await readFile(filepath, 'utf-8');
    const backup = JSON.parse(content);

    res.json(backup);
  } catch (err) {
    console.error('[backup] Error fetching latest:', err);
    res.status(500).json({ error: 'Failed to fetch latest backup' });
  }
});

/**
 * GET /api/backup/list
 * List all available backups with metadata.
 */
app.get('/api/backup/list', async (req, res) => {
  try {
    const files = await readdir(DATA_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    const backups = [];
    for (const file of backupFiles) {
      const filepath = join(DATA_DIR, file);
      const stats = await stat(filepath);

      // Read just enough to get metadata (not full data)
      const content = await readFile(filepath, 'utf-8');
      const backup = JSON.parse(content);

      backups.push({
        id: backup.id,
        timestamp: backup.timestamp,
        clientTimestamp: backup.clientTimestamp,
        size: stats.size,
        counts: {
          atoms: backup.data?.atoms?.length || 0,
          compositions: backup.data?.compositions?.length || 0,
          snapshots: backup.data?.snapshots?.length || 0,
          voiceNotes: backup.data?.voiceNotes?.length || 0,
        },
      });
    }

    res.json({ backups });
  } catch (err) {
    console.error('[backup] Error listing backups:', err);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

/**
 * GET /api/backup/:id
 * Get a specific backup by ID.
 */
app.get('/api/backup/:id', async (req, res) => {
  try {
    const filepath = join(DATA_DIR, backupFilename(req.params.id));
    if (!existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const content = await readFile(filepath, 'utf-8');
    const backup = JSON.parse(content);
    res.json(backup);
  } catch (err) {
    console.error('[backup] Error fetching backup:', err);
    res.status(500).json({ error: 'Failed to fetch backup' });
  }
});

/**
 * POST /api/restore
 * Restore from a specific backup.
 * Body: { backupId: string, items?: { atoms?: boolean, compositions?: boolean, snapshots?: boolean } }
 *
 * If items is omitted, returns full backup data.
 * If items is specified, returns only selected categories (selective restore).
 */
app.post('/api/restore', async (req, res) => {
  try {
    const { backupId, items } = req.body;
    if (!backupId) {
      return res.status(400).json({ error: 'backupId required' });
    }

    const filepath = join(DATA_DIR, backupFilename(backupId));
    if (!existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const content = await readFile(filepath, 'utf-8');
    const backup = JSON.parse(content);

    // Selective restore: filter data based on items parameter
    if (items && typeof items === 'object') {
      const filtered = {};
      if (items.atoms) filtered.atoms = backup.data.atoms;
      if (items.compositions) filtered.compositions = backup.data.compositions;
      if (items.snapshots) filtered.snapshots = backup.data.snapshots;
      if (items.voiceNotes) filtered.voiceNotes = backup.data.voiceNotes;
      if (items.configOverrides) filtered.configOverrides = backup.data.configOverrides;

      return res.json({
        id: backup.id,
        timestamp: backup.timestamp,
        data: filtered,
      });
    }

    // Full restore
    res.json(backup);
  } catch (err) {
    console.error('[backup] Error restoring:', err);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

/**
 * DELETE /api/backup/:id
 * Delete a specific backup.
 */
app.delete('/api/backup/:id', async (req, res) => {
  try {
    const filepath = join(DATA_DIR, backupFilename(req.params.id));
    if (!existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    await unlink(filepath);
    console.log(`[backup] Deleted: ${req.params.id}`);
    res.json({ deleted: true });
  } catch (err) {
    console.error('[backup] Error deleting backup:', err);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

/**
 * GET /api/snapshot/:id
 * Get a specific snapshot by ID from any backup.
 * Searches through all backups to find the snapshot.
 * Used by the shareable /c/[id] page.
 */
app.get('/api/snapshot/:id', async (req, res) => {
  try {
    const snapshotId = req.params.id;
    const files = await readdir(DATA_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    // Search through backups
    for (const file of backupFiles) {
      const filepath = join(DATA_DIR, file);
      const content = await readFile(filepath, 'utf-8');
      const backup = JSON.parse(content);

      if (backup.data && backup.data.snapshots) {
        const snapshot = backup.data.snapshots.find(s => s.id === snapshotId);
        if (snapshot) {
          return res.json(snapshot);
        }
      }
    }

    // Also check standalone snapshot files
    const standaloneFile = join(DATA_DIR, `snapshot-${snapshotId}.json`);
    if (existsSync(standaloneFile)) {
      const content = await readFile(standaloneFile, 'utf-8');
      return res.json(JSON.parse(content));
    }

    return res.status(404).json({ error: 'Snapshot not found' });
  } catch (err) {
    console.error('[backup] Error fetching snapshot:', err);
    res.status(500).json({ error: 'Failed to fetch snapshot' });
  }
});

/**
 * POST /api/snapshot
 * Upload a single snapshot for sharing.
 * This allows sharing without requiring a full backup.
 *
 * Body: CompositionSnapshot JSON
 * Returns: { id, url }
 */
app.post('/api/snapshot', async (req, res) => {
  try {
    const snapshot = req.body;
    if (!snapshot || !snapshot.id || !snapshot.atoms) {
      return res.status(400).json({ error: 'Invalid snapshot data' });
    }

    // Store as a standalone snapshot file
    const filepath = join(DATA_DIR, `snapshot-${snapshot.id}.json`);
    await writeFile(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`[backup] Shared snapshot: ${snapshot.id}`);
    res.json({
      id: snapshot.id,
      url: `/c/${snapshot.id}`,
    });
  } catch (err) {
    console.error('[backup] Error sharing snapshot:', err);
    res.status(500).json({ error: 'Failed to share snapshot' });
  }
});

/**
 * GET /api/health
 * Health check endpoint.
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Start ----

await ensureDataDir();

app.listen(PORT, () => {
  console.log(`[backup] EOE Backup Server running on port ${PORT}`);
  console.log(`[backup] Data directory: ${DATA_DIR}`);
});
