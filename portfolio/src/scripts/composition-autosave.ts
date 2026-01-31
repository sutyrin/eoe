/**
 * Composition autosave with debouncing.
 *
 * Saves composition to IndexedDB after a 500ms quiet period.
 * This prevents excessive writes during rapid interactions
 * (dragging nodes, adjusting routes).
 *
 * From 05-RESEARCH.md: Instant parameter persistence pattern,
 * adapted with debounce for composition-level saves.
 */
import { saveComposition } from './composition-store';
import type { Composition } from './composition-types';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingComposition: Composition | null = null;

const DEBOUNCE_MS = 500;

/**
 * Schedule a composition save. Debounced: only the last call
 * within DEBOUNCE_MS window actually saves.
 */
export function scheduleAutosave(composition: Composition): void {
  pendingComposition = composition;

  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(async () => {
    if (pendingComposition) {
      try {
        await saveComposition(pendingComposition);
        console.log('[autosave] Saved composition:', pendingComposition.id);

        // Dispatch save event for UI feedback
        window.dispatchEvent(new CustomEvent('eoe:composition-saved', {
          detail: { compositionId: pendingComposition.id }
        }));
      } catch (err) {
        console.error('[autosave] Failed to save:', err);
        window.dispatchEvent(new CustomEvent('eoe:autosave-error', {
          detail: { error: String(err) }
        }));
      }
      pendingComposition = null;
    }
    saveTimer = null;
  }, DEBOUNCE_MS);
}

/**
 * Force immediate save (e.g., before navigating away).
 */
export async function flushAutosave(): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (pendingComposition) {
    await saveComposition(pendingComposition);
    console.log('[autosave] Flushed composition:', pendingComposition.id);
    pendingComposition = null;
  }
}

/**
 * Cancel any pending autosave (e.g., when loading a different composition).
 */
export function cancelAutosave(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  pendingComposition = null;
}
