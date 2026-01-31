/**
 * Undo/Redo manager for composition state.
 *
 * Uses a circular buffer (20 states max) to track composition changes.
 * Each state is a deep clone of the full Composition object.
 *
 * Memory impact (from 05-RESEARCH.md):
 * - Each composition snapshot: ~5-20KB (5 atoms, 50 routes, metadata)
 * - 20 snapshots: ~100-400KB total (well within mobile limits)
 *
 * Design decisions:
 * - Deep clone via JSON.parse(JSON.stringify()) for simplicity
 *   (Composition has no Blobs, Dates, or circular refs)
 * - Push clears redo stack (standard undo/redo behavior)
 * - Buffer overflow discards oldest state
 */
import type { Composition } from './composition-types';

const MAX_HISTORY = 20;

export class UndoRedoManager {
  private history: string[] = [];  // JSON-serialized Composition snapshots
  private cursor: number = -1;     // Points to current state in history

  /**
   * Push a new state onto the history.
   * Clears any redo states (future states after cursor).
   */
  push(composition: Composition): void {
    const snapshot = JSON.stringify(composition);

    // If we're not at the end of history, truncate redo states
    if (this.cursor < this.history.length - 1) {
      this.history = this.history.slice(0, this.cursor + 1);
    }

    // Add new state
    this.history.push(snapshot);

    // Enforce max buffer size (discard oldest)
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    } else {
      this.cursor++;
    }

    // Ensure cursor is at end
    this.cursor = this.history.length - 1;
  }

  /**
   * Undo: move cursor back one step.
   * Returns the previous composition state, or null if at beginning.
   */
  undo(): Composition | null {
    if (!this.canUndo()) return null;

    this.cursor--;
    return JSON.parse(this.history[this.cursor]);
  }

  /**
   * Redo: move cursor forward one step.
   * Returns the next composition state, or null if at end.
   */
  redo(): Composition | null {
    if (!this.canRedo()) return null;

    this.cursor++;
    return JSON.parse(this.history[this.cursor]);
  }

  /**
   * Can we undo? (cursor is past the first state)
   */
  canUndo(): boolean {
    return this.cursor > 0;
  }

  /**
   * Can we redo? (cursor is before the last state)
   */
  canRedo(): boolean {
    return this.cursor < this.history.length - 1;
  }

  /**
   * Get current state (at cursor position).
   */
  current(): Composition | null {
    if (this.cursor < 0 || this.cursor >= this.history.length) return null;
    return JSON.parse(this.history[this.cursor]);
  }

  /**
   * Clear all history (e.g., when loading a different composition).
   */
  clear(): void {
    this.history = [];
    this.cursor = -1;
  }

  /**
   * Get history stats for debugging / UI display.
   */
  stats(): { size: number; cursor: number; canUndo: boolean; canRedo: boolean } {
    return {
      size: this.history.length,
      cursor: this.cursor,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}
