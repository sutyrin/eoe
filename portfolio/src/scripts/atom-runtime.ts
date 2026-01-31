/**
 * AtomRuntime: Sandboxed execution environment for individual atoms.
 *
 * Each atom runs in its own iframe to:
 * 1. Prevent interference between atoms (separate DOM, globals, Web Audio contexts)
 * 2. Enable real-time parameter injection via postMessage
 * 3. Isolate errors (one atom crashing doesn't affect others)
 * 4. Detect audio glitches (AudioContext.state changes, audio underruns)
 *
 * Phase 6 Design:
 * - iframe.sandbox = 'allow-scripts' (no top navigation, no popups)
 * - Parent -> iframe: { type: 'param-update', params: {...} }
 * - iframe -> Parent: { type: 'ready' | 'error' | 'audio-glitch', ... }
 */

import type { AtomMessage } from './composition-types';

export class AtomRuntime {
  private iframe: HTMLIFrameElement | null = null;
  private atomNodeId: string;
  private atomSlug: string;
  private atomCode: string;
  private atomConfigJson: string;
  private onMessage: (msg: AtomMessage) => void;
  private glitchCheckInterval: number | null = null;

  constructor(
    atomNodeId: string,
    atomSlug: string,
    atomCode: string,
    atomConfigJson: string,
    onMessage: (msg: AtomMessage) => void
  ) {
    this.atomNodeId = atomNodeId;
    this.atomSlug = atomSlug;
    this.atomCode = atomCode;
    this.atomConfigJson = atomConfigJson;
    this.onMessage = onMessage;
  }

  /**
   * Create sandboxed iframe and load atom code.
   * Returns a promise that resolves when the iframe sends 'ready' message.
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create hidden iframe (audio-only atoms don't need visible canvas)
      this.iframe = document.createElement('iframe');
      this.iframe.sandbox.add('allow-scripts');
      this.iframe.style.position = 'absolute';
      this.iframe.style.width = '1px';
      this.iframe.style.height = '1px';
      this.iframe.style.opacity = '0';
      this.iframe.style.pointerEvents = 'none';
      this.iframe.setAttribute('data-atom-node-id', this.atomNodeId);
      document.body.appendChild(this.iframe);

      // Listen for messages from iframe
      const messageHandler = (event: MessageEvent) => {
        // Only accept messages from our iframe
        if (event.source !== this.iframe?.contentWindow) return;

        const msg = event.data as AtomMessage;
        if (msg.atomNodeId !== this.atomNodeId) return;

        if (msg.type === 'ready') {
          window.removeEventListener('message', messageHandler);
          resolve();
          // Start glitch monitoring after atom is ready
          this.startGlitchMonitoring();
        } else if (msg.type === 'error') {
          window.removeEventListener('message', messageHandler);
          reject(new Error(`Atom ${this.atomSlug} failed to initialize`));
        }

        // Forward all messages to parent callback
        this.onMessage(msg);
      };

      window.addEventListener('message', messageHandler);

      // Inject atom code into iframe
      this.injectAtomCode();
    });
  }

  /**
   * Update atom parameters in real-time.
   * Called by PreviewEngine during routing loop.
   */
  updateParams(params: Record<string, unknown>): void {
    if (!this.iframe?.contentWindow) return;

    const message: AtomMessage = {
      type: 'param-update',
      atomNodeId: this.atomNodeId,
      payload: params,
    };

    this.iframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Stop atom execution and cleanup resources.
   */
  stop(): void {
    if (this.glitchCheckInterval !== null) {
      clearInterval(this.glitchCheckInterval);
      this.glitchCheckInterval = null;
    }

    if (this.iframe) {
      // Send stop message to iframe to cleanup Web Audio resources
      this.iframe.contentWindow?.postMessage(
        { type: 'stop', atomNodeId: this.atomNodeId },
        '*'
      );

      // Remove iframe from DOM
      this.iframe.remove();
      this.iframe = null;
    }
  }

  /**
   * Inject atom code into iframe with parameter update listener.
   * The iframe wrapper:
   * 1. Loads atom code
   * 2. Parses config.json for initial controllers
   * 3. Listens for param-update messages
   * 4. Applies parameter changes to window.controllers
   * 5. Sends ready/error messages back to parent
   */
  private injectAtomCode(): void {
    if (!this.iframe?.contentDocument) return;

    const iframeDoc = this.iframe.contentDocument;

    // Build iframe HTML with atom code embedded
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module">
    // Parse config.json for initial controllers
    const config = ${this.atomConfigJson};
    window.controllers = config.controllers || {};

    const atomNodeId = '${this.atomNodeId}';

    // Listen for parameter updates from parent
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'param-update' && msg.atomNodeId === atomNodeId) {
        // Apply parameter changes
        Object.assign(window.controllers, msg.payload);
      } else if (msg.type === 'stop' && msg.atomNodeId === atomNodeId) {
        // Cleanup Web Audio resources
        if (window.Tone?.Transport) {
          window.Tone.Transport.stop();
          window.Tone.Transport.cancel();
        }
        if (window.Tone?.context) {
          window.Tone.context.close();
        }
      }
    });

    // Load atom code
    try {
      ${this.atomCode}

      // Send ready signal
      window.parent.postMessage({
        type: 'ready',
        atomNodeId: atomNodeId,
      }, '*');
    } catch (error) {
      // Send error signal
      window.parent.postMessage({
        type: 'error',
        atomNodeId: atomNodeId,
        payload: { message: error.message },
      }, '*');
    }
  </script>
</body>
</html>
    `;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }

  /**
   * Monitor iframe's AudioContext for glitches.
   * Checks every 500ms for:
   * - AudioContext.state === 'interrupted'
   * - Large baseLatency increases (indicates buffer underruns)
   */
  private startGlitchMonitoring(): void {
    let lastLatency = 0;

    this.glitchCheckInterval = window.setInterval(() => {
      if (!this.iframe?.contentWindow) return;

      const win = this.iframe.contentWindow as any;
      const audioContext = win.Tone?.context || win.AudioContext;

      if (!audioContext) return;

      // Check for interrupted state
      if (audioContext.state === 'interrupted') {
        this.onMessage({
          type: 'audio-glitch',
          atomNodeId: this.atomNodeId,
          payload: { reason: 'AudioContext interrupted' },
        });
        return;
      }

      // Check for large latency increases (buffer underruns)
      const currentLatency = audioContext.baseLatency || 0;
      if (lastLatency > 0 && currentLatency > lastLatency * 2) {
        this.onMessage({
          type: 'audio-glitch',
          atomNodeId: this.atomNodeId,
          payload: { reason: 'Audio buffer underrun detected' },
        });
      }
      lastLatency = currentLatency;
    }, 500) as unknown as number;
  }
}
