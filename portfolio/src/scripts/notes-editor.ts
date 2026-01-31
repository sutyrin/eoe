/**
 * Notes editor persistence logic.
 * Saves edited NOTES.md content to the atom's IndexedDB record.
 * Marks the atom as locally modified for future Phase 6 sync.
 */
import { getAtom, saveAtomMetadata, type AtomMetadata } from './db';

/**
 * Save edited notes text to IndexedDB for a specific atom.
 * Updates the atom's `notes` field and marks it as locally modified.
 */
export async function saveAtomNotes(atomSlug: string, notesText: string): Promise<boolean> {
  const atom = await getAtom(atomSlug);
  if (!atom) {
    console.error('[notes-editor] Atom not found:', atomSlug);
    return false;
  }

  const updated: AtomMetadata = {
    ...atom,
    notes: notesText
  };

  await saveAtomMetadata(updated);
  console.log(`[notes-editor] Saved notes for ${atomSlug} (${notesText.length} chars)`);
  return true;
}

/**
 * Load current notes text from IndexedDB for a specific atom.
 */
export async function loadAtomNotes(atomSlug: string): Promise<string> {
  const atom = await getAtom(atomSlug);
  return atom?.notes || '';
}
