/**
 * PreviewEngine: Orchestrates multi-atom preview with parameter routing.
 *
 * Responsibilities:
 * 1. Load atom code from IndexedDB for all atoms in composition
 * 2. Create AtomRuntime instance for each atom (sandboxed iframes)
 * 3. Start atoms based on playbackMode (simultaneous or sequential)
 * 4. Run parameter routing loop at ~30fps
 * 5. Apply routed values in real-time via AtomRuntime.updateParams
 * 6. Handle audio glitches (emit warning events for UI)
 * 7. Cleanup all resources on stop
 *
 * Phase 6 Design:
 * - Simultaneous: all atoms start at once
 * - Sequential: atoms start one at a time, user clicks Next
 * - Routing loop: reads source params, applies to targets
 * - Glitch handling: emits 'glitch-warning' event with Continue/Restart options
 */

import type { Composition, CompositionAtom, ParameterRoute, PreviewState, AtomMessage } from './composition-types';
import { AtomRuntime } from './atom-runtime';

export interface PreviewEngineEvents {
  'state-change': PreviewState;
  'glitch-warning': { atomNodeId: string; reason: string };
  'route-active': string[];  // Array of route IDs currently active
  'sequential-next-ready': boolean;  // In sequential mode, can start next atom?
}

export class PreviewEngine extends EventTarget {
  private composition: Composition;
  private runtimes: Map<string, AtomRuntime> = new Map();
  private state: PreviewState = 'stopped';
  private routingLoopId: number | null = null;
  private sequentialIndex: number = 0;
  private atomsDb: IDBDatabase | null = null;

  constructor(composition: Composition) {
    super();
    this.composition = composition;
  }

  /**
   * Initialize preview engine.
   * Opens IndexedDB connection to load atom code.
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EnginesDB', 1);

      request.onsuccess = () => {
        this.atomsDb = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB for preview'));
      };
    });
  }

  /**
   * Start preview playback.
   * Loads atom code, creates runtimes, starts based on playbackMode.
   */
  async play(): Promise<void> {
    if (this.state === 'playing') return;

    try {
      // Load atom code from IndexedDB
      const atomDataMap = await this.loadAtomData();

      // Create AtomRuntime for each atom
      for (const compAtom of this.composition.atoms) {
        const atomData = atomDataMap.get(compAtom.atomSlug);
        if (!atomData) {
          console.warn(`Atom ${compAtom.atomSlug} not found in IndexedDB, skipping`);
          continue;
        }

        const runtime = new AtomRuntime(
          compAtom.nodeId,
          compAtom.atomSlug,
          atomData.code,
          atomData.configJson,
          (msg: AtomMessage) => this.handleAtomMessage(msg)
        );

        this.runtimes.set(compAtom.nodeId, runtime);
      }

      // Start atoms based on playback mode
      if (this.composition.playbackMode === 'simultaneous') {
        await this.startAllAtoms();
      } else {
        await this.startNextAtom();
      }

      this.state = 'playing';
      this.emitStateChange();

      // Start parameter routing loop
      this.startRoutingLoop();
    } catch (error) {
      console.error('Preview playback failed:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Pause preview (stop routing loop, keep atoms running).
   */
  pause(): void {
    if (this.state !== 'playing') return;

    this.stopRoutingLoop();
    this.state = 'paused';
    this.emitStateChange();
  }

  /**
   * Resume preview from paused state.
   */
  resume(): void {
    if (this.state !== 'paused') return;

    this.startRoutingLoop();
    this.state = 'playing';
    this.emitStateChange();
  }

  /**
   * Stop preview and cleanup all resources.
   */
  async stop(): Promise<void> {
    this.stopRoutingLoop();

    // Stop all atom runtimes
    for (const runtime of this.runtimes.values()) {
      runtime.stop();
    }
    this.runtimes.clear();

    // Reset sequential mode
    this.sequentialIndex = 0;

    this.state = 'stopped';
    this.emitStateChange();

    // Emit empty route-active to clear highlights
    this.dispatchEvent(new CustomEvent('route-active', { detail: [] }));
  }

  /**
   * In sequential mode, start the next atom.
   * Returns true if atom started, false if no more atoms.
   */
  async startNext(): Promise<boolean> {
    if (this.composition.playbackMode !== 'sequential') return false;
    if (this.sequentialIndex >= this.composition.atoms.length) return false;

    await this.startNextAtom();
    return this.sequentialIndex < this.composition.atoms.length;
  }

  /**
   * Get current preview state.
   */
  getState(): PreviewState {
    return this.state;
  }

  /**
   * Cleanup engine resources (close IndexedDB).
   */
  cleanup(): void {
    if (this.atomsDb) {
      this.atomsDb.close();
      this.atomsDb = null;
    }
  }

  /**
   * Load atom code and config.json from IndexedDB for all composition atoms.
   */
  private async loadAtomData(): Promise<Map<string, { code: string; configJson: string }>> {
    if (!this.atomsDb) throw new Error('IndexedDB not initialized');

    const atomDataMap = new Map<string, { code: string; configJson: string }>();

    for (const compAtom of this.composition.atoms) {
      const tx = this.atomsDb.transaction('atoms', 'readonly');
      const store = tx.objectStore('atoms');

      const atom = await new Promise<any>((resolve, reject) => {
        const request = store.get(compAtom.atomSlug);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!atom) continue;

      // Merge overrides into controllers
      const config = JSON.parse(atom.configJson);
      const controllers = { ...config.controllers, ...compAtom.paramOverrides };
      const configWithOverrides = { ...config, controllers };

      atomDataMap.set(compAtom.atomSlug, {
        code: atom.code,
        configJson: JSON.stringify(configWithOverrides),
      });
    }

    return atomDataMap;
  }

  /**
   * Start all atoms simultaneously.
   */
  private async startAllAtoms(): Promise<void> {
    const startPromises = Array.from(this.runtimes.values()).map(runtime => runtime.start());
    await Promise.all(startPromises);
  }

  /**
   * Start the next atom in sequential mode.
   */
  private async startNextAtom(): Promise<void> {
    if (this.sequentialIndex >= this.composition.atoms.length) return;

    const compAtom = this.composition.atoms[this.sequentialIndex];
    const runtime = this.runtimes.get(compAtom.nodeId);

    if (runtime) {
      await runtime.start();
      this.sequentialIndex++;

      // Emit event to enable/disable Next button
      const hasMore = this.sequentialIndex < this.composition.atoms.length;
      this.dispatchEvent(new CustomEvent('sequential-next-ready', { detail: hasMore }));
    }
  }

  /**
   * Start parameter routing loop at ~30fps.
   * Reads source parameter values, applies to targets via routes.
   */
  private startRoutingLoop(): void {
    if (this.routingLoopId !== null) return;

    const fps = 30;
    const interval = 1000 / fps;

    this.routingLoopId = window.setInterval(() => {
      this.runRoutingCycle();
    }, interval) as unknown as number;
  }

  /**
   * Stop parameter routing loop.
   */
  private stopRoutingLoop(): void {
    if (this.routingLoopId !== null) {
      clearInterval(this.routingLoopId);
      this.routingLoopId = null;
    }
  }

  /**
   * Single routing cycle: read source params, apply to targets.
   * Also emits 'route-active' event with IDs of routes that applied values.
   */
  private runRoutingCycle(): void {
    const activeRouteIds: string[] = [];

    for (const route of this.composition.routes) {
      const sourceRuntime = this.runtimes.get(route.sourceNodeId);
      const targetRuntime = this.runtimes.get(route.targetNodeId);

      if (!sourceRuntime || !targetRuntime) continue;

      // Read source parameter value from iframe
      const sourceValue = this.readParamFromRuntime(sourceRuntime, route.sourceParam);
      if (sourceValue === undefined) continue;

      // Apply to target runtime
      targetRuntime.updateParams({ [route.targetParam]: sourceValue });

      // Track active route for visualization
      activeRouteIds.push(route.id);
    }

    // Emit active routes for canvas highlighting
    this.dispatchEvent(new CustomEvent('route-active', { detail: activeRouteIds }));
  }

  /**
   * Read parameter value from an AtomRuntime's iframe.
   * Accesses iframe's window.controllers object.
   */
  private readParamFromRuntime(runtime: AtomRuntime, paramName: string): unknown {
    try {
      // Access iframe's window object (same-origin policy applies)
      const iframe = document.querySelector(`[data-atom-node-id="${(runtime as any).atomNodeId}"]`) as HTMLIFrameElement;
      if (!iframe?.contentWindow) return undefined;

      const controllers = (iframe.contentWindow as any).controllers;
      if (!controllers) return undefined;

      return controllers[paramName];
    } catch (error) {
      // Cross-origin or security error - can't read param
      return undefined;
    }
  }

  /**
   * Handle messages from AtomRuntime instances.
   */
  private handleAtomMessage(msg: AtomMessage): void {
    if (msg.type === 'audio-glitch') {
      this.dispatchEvent(new CustomEvent('glitch-warning', {
        detail: {
          atomNodeId: msg.atomNodeId,
          reason: msg.payload?.reason || 'Unknown audio issue',
        },
      }));
    }
  }

  /**
   * Emit state-change event.
   */
  private emitStateChange(): void {
    this.dispatchEvent(new CustomEvent('state-change', { detail: this.state }));
  }
}
