/**
 * IndexedDB schema and CRUD helpers for offline atom data.
 * Uses Jake Archibald's idb wrapper for Promise-based IndexedDB access.
 *
 * Stores:
 * - atoms: Atom metadata (slug, title, date, type, thumbnailUrl)
 * - voiceNotes: Audio recordings with transcripts (Plan 4.4)
 * - screenshots: Annotated screenshot images (Plan 4.5)
 * - configOverrides: Local parameter tweaks (Plan 4.3)
 */
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'eoe-atoms';
const DB_VERSION = 2;

// ---- Types ----

export interface AtomMetadata {
  slug: string;        // Folder name: "2026-01-30-my-first-sketch"
  title: string;       // Short name: "my-first-sketch"
  date: string;        // "2026-01-30"
  type: string;        // "visual" | "audio" | "audio-visual" | "composition"
  stage: string;       // From NOTES.md: "idea" | "wip" | "done"
  thumbnailUrl: string; // "/thumbnails/2026-01-30-my-first-sketch.webp"
  code: string;        // sketch.js content (for offline code viewing)
  notes: string;       // NOTES.md content (for offline notes viewing)
  configJson: string;  // config.json content (for parameter tweaking)
}

export interface VoiceNote {
  id?: number;
  atomSlug: string;
  audioBlob: Blob;
  mimeType: string;
  transcript: string;
  createdAt: string;  // ISO date string
  synced: boolean;
}

export interface ScreenshotAnnotation {
  id?: number;
  atomSlug: string;
  imageBlob: Blob;
  createdAt: string;  // ISO date string
  synced: boolean;
}

export interface ConfigOverride {
  atomSlug: string;    // Primary key
  overrides: Record<string, number | string | boolean>;
  updatedAt: string;   // ISO date string
  synced: boolean;
}

// ---- Database Init ----

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Atoms metadata store
      if (!db.objectStoreNames.contains('atoms')) {
        const atomStore = db.createObjectStore('atoms', { keyPath: 'slug' });
        atomStore.createIndex('date', 'date');
        atomStore.createIndex('type', 'type');
      }

      // Voice notes store
      if (!db.objectStoreNames.contains('voiceNotes')) {
        const voiceStore = db.createObjectStore('voiceNotes', {
          keyPath: 'id',
          autoIncrement: true
        });
        voiceStore.createIndex('atomSlug', 'atomSlug');
        voiceStore.createIndex('synced', 'synced');
      }

      // Screenshots store
      if (!db.objectStoreNames.contains('screenshots')) {
        const screenshotStore = db.createObjectStore('screenshots', {
          keyPath: 'id',
          autoIncrement: true
        });
        screenshotStore.createIndex('atomSlug', 'atomSlug');
        screenshotStore.createIndex('synced', 'synced');
      }

      // Config overrides store (parameter tweaks)
      if (!db.objectStoreNames.contains('configOverrides')) {
        db.createObjectStore('configOverrides', { keyPath: 'atomSlug' });
      }

      // Compositions store (Phase 5)
      if (!db.objectStoreNames.contains('compositions')) {
        const compositionStore = db.createObjectStore('compositions', { keyPath: 'id' });
        compositionStore.createIndex('name', 'name');
        compositionStore.createIndex('updatedAt', 'updatedAt');
        compositionStore.createIndex('synced', 'synced');  // Phase 6 sync queries
      }
    }
  });

  return dbInstance;
}

// ---- Atom Metadata CRUD ----

export async function saveAtomMetadata(atom: AtomMetadata): Promise<void> {
  const db = await getDB();
  await db.put('atoms', atom);
}

export async function saveAllAtomMetadata(atoms: AtomMetadata[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('atoms', 'readwrite');
  for (const atom of atoms) {
    await tx.store.put(atom);
  }
  await tx.done;
}

export async function getAtom(slug: string): Promise<AtomMetadata | undefined> {
  const db = await getDB();
  return db.get('atoms', slug);
}

export async function getAllAtomsSorted(): Promise<AtomMetadata[]> {
  const db = await getDB();
  const atoms = await db.getAllFromIndex('atoms', 'date');
  return atoms.reverse(); // Most recent first (YYYY-MM-DD sorts correctly)
}

export async function searchAtoms(query: string): Promise<AtomMetadata[]> {
  const atoms = await getAllAtomsSorted();
  const q = query.toLowerCase();
  return atoms.filter(a =>
    a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
  );
}

// ---- Voice Notes CRUD ----

export async function saveVoiceNote(note: Omit<VoiceNote, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('voiceNotes', { ...note, synced: false }) as Promise<number>;
}

export async function getVoiceNotesForAtom(atomSlug: string): Promise<VoiceNote[]> {
  const db = await getDB();
  return db.getAllFromIndex('voiceNotes', 'atomSlug', atomSlug);
}

export async function updateVoiceNoteTranscript(id: number, transcript: string): Promise<void> {
  const db = await getDB();
  const note = await db.get('voiceNotes', id);
  if (note) {
    note.transcript = transcript;
    await db.put('voiceNotes', note);
  }
}

// ---- Screenshot CRUD ----

export async function saveScreenshot(screenshot: Omit<ScreenshotAnnotation, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('screenshots', { ...screenshot, synced: false }) as Promise<number>;
}

export async function getScreenshotsForAtom(atomSlug: string): Promise<ScreenshotAnnotation[]> {
  const db = await getDB();
  return db.getAllFromIndex('screenshots', 'atomSlug', atomSlug);
}

// ---- Config Overrides CRUD ----

export async function saveConfigOverride(override: ConfigOverride): Promise<void> {
  const db = await getDB();
  await db.put('configOverrides', { ...override, synced: false });
}

export async function getConfigOverride(atomSlug: string): Promise<ConfigOverride | undefined> {
  const db = await getDB();
  return db.get('configOverrides', atomSlug);
}

// ---- Storage Quota ----

export async function getStorageEstimate(): Promise<{ usage: number; quota: number; percentUsed: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? Math.round((usage / quota) * 100) : 0;
    return { usage, quota, percentUsed };
  }
  return { usage: 0, quota: 0, percentUsed: 0 };
}
