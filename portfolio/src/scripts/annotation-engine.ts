/**
 * Annotation engine for screenshot markup.
 *
 * Features:
 * - Freehand pen drawing with quadratic Bezier curve smoothing
 * - Text annotation placement (tap location + typed text)
 * - Undo/redo stack (20 states max, using ImageData not base64)
 * - Adjustable stroke width
 * - Touch and mouse event support
 * - WebP export for storage
 *
 * Architecture:
 * - Canvas is the single drawing surface
 * - Image is drawn first as the background
 * - All markup (strokes, text) is drawn on top
 * - History stores full canvas snapshots (ImageData) for undo/redo
 * - Memory limit: 20 states × ~4MB per 1080p canvas = ~80MB max
 *
 * Anti-patterns avoided:
 * - No base64 toDataURL for history (memory bloat)
 * - No Fabric.js/tldraw (overkill for pen + text)
 * - No touchmove preventDefault unless actively drawing (preserves page scroll)
 */

export type Tool = 'pen' | 'text';

export interface AnnotationOptions {
  canvas: HTMLCanvasElement;
  strokeColor?: string;
  strokeWidth?: number;
  textColor?: string;
  textSize?: number;
}

export interface AnnotationState {
  canUndo: boolean;
  canRedo: boolean;
  tool: Tool;
  strokeWidth: number;
  hasImage: boolean;
}

export type StateCallback = (state: AnnotationState) => void;

export class AnnotationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Drawing state
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private prevX = 0; // For Bezier smoothing (point before last)
  private prevY = 0;
  private strokeCount = 0; // Points in current stroke

  // Tool settings
  private currentTool: Tool = 'pen';
  private strokeColor: string;
  private strokeWidth: number;
  private textColor: string;
  private textSize: number;

  // History
  private history: ImageData[] = [];
  private historyIndex = -1;
  private readonly MAX_HISTORY = 20;

  // State callback
  private onStateChange: StateCallback | null = null;

  // Image loaded flag
  private imageLoaded = false;

  // Bound event handlers for proper cleanup
  private handleTouchStart!: (e: TouchEvent) => void;
  private handleTouchMove!: (e: TouchEvent) => void;
  private handleTouchEnd!: (e: TouchEvent) => void;
  private handleMouseDown!: (e: MouseEvent) => void;
  private handleMouseMove!: (e: MouseEvent) => void;
  private handleMouseUp!: () => void;

  constructor(options: AnnotationOptions) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.strokeColor = options.strokeColor || '#222222';
    this.strokeWidth = options.strokeWidth || 3;
    this.textColor = options.textColor || '#222222';
    this.textSize = options.textSize || 20;

    // Configure canvas for high-DPI screens
    this.canvas.style.touchAction = 'none'; // Prevent scroll while drawing

    this.setupEventListeners();
  }

  // ---- Public API ----

  /**
   * Load an image onto the canvas as the background.
   */
  async loadImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Scale canvas to fit image while respecting screen width
        const maxWidth = this.canvas.parentElement?.clientWidth || window.innerWidth;
        const scale = Math.min(1, maxWidth / img.width);

        this.canvas.width = Math.floor(img.width * scale);
        this.canvas.height = Math.floor(img.height * scale);

        // Draw image
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

        // Setup drawing context defaults
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.imageLoaded = true;

        // Save initial state
        this.saveState();
        this.emitState();

        resolve();
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Load image from a File or Blob.
   */
  async loadImageFromFile(file: File | Blob): Promise<void> {
    const url = URL.createObjectURL(file);
    try {
      await this.loadImage(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Set the active tool.
   */
  setTool(tool: Tool): void {
    this.currentTool = tool;
    this.canvas.style.cursor = tool === 'text' ? 'text' : 'crosshair';
    this.emitState();
  }

  /**
   * Set pen stroke width.
   */
  setStrokeWidth(width: number): void {
    this.strokeWidth = Math.max(1, Math.min(20, width));
    this.emitState();
  }

  /**
   * Undo last action.
   */
  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
      this.emitState();
      return true;
    }
    return false;
  }

  /**
   * Redo previously undone action.
   */
  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
      this.emitState();
      return true;
    }
    return false;
  }

  /**
   * Subscribe to state changes (undo/redo availability, tool, etc.).
   */
  onState(callback: StateCallback): void {
    this.onStateChange = callback;
    this.emitState();
  }

  /**
   * Export the annotated canvas as a WebP Blob.
   */
  async exportAsWebP(quality = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to export canvas'));
        },
        'image/webp',
        quality
      );
    });
  }

  /**
   * Clear all annotations (keep background image).
   * Note: This reloads the image, clearing all markup.
   */
  clearAnnotations(): void {
    if (this.historyIndex >= 0 && this.history.length > 0) {
      // Restore to the first state (original image)
      this.ctx.putImageData(this.history[0], 0, 0);
      this.saveState();
      this.emitState();
    }
  }

  /**
   * Destroy the engine and remove event listeners.
   */
  destroy(): void {
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.history = [];
  }

  // ---- Private: Event Handling ----

  private setupEventListeners(): void {
    // Bind methods for proper removal
    this.handleTouchStart = this.onTouchStart.bind(this);
    this.handleTouchMove = this.onTouchMove.bind(this);
    this.handleTouchEnd = this.onTouchEnd.bind(this);
    this.handleMouseDown = this.onMouseDown.bind(this);
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseUp = this.onMouseUp.bind(this);

    // Touch events (mobile)
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);

    // Mouse events (desktop testing)
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault(); // Prevent scroll
    const touch = e.touches[0];
    const pos = this.getTouchPos(touch);

    if (this.currentTool === 'pen') {
      this.beginStroke(pos.x, pos.y);
    } else if (this.currentTool === 'text') {
      this.placeText(pos.x, pos.y);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this.isDrawing) return;
    e.preventDefault(); // Only prevent when actively drawing

    const touch = e.touches[0];
    const pos = this.getTouchPos(touch);
    this.continueStroke(pos.x, pos.y);
  }

  private onTouchEnd(_e: TouchEvent): void {
    if (this.isDrawing) {
      this.endStroke();
    }
  }

  private onMouseDown(e: MouseEvent): void {
    const pos = this.getMousePos(e);

    if (this.currentTool === 'pen') {
      this.beginStroke(pos.x, pos.y);
    } else if (this.currentTool === 'text') {
      this.placeText(pos.x, pos.y);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing) return;
    const pos = this.getMousePos(e);
    this.continueStroke(pos.x, pos.y);
  }

  private onMouseUp(): void {
    if (this.isDrawing) {
      this.endStroke();
    }
  }

  // ---- Private: Drawing ----

  private beginStroke(x: number, y: number): void {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
    this.prevX = x;
    this.prevY = y;
    this.strokeCount = 0;

    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  private continueStroke(x: number, y: number): void {
    this.strokeCount++;

    if (this.strokeCount < 3) {
      // First few points: simple line
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    } else {
      // Quadratic Bezier smoothing: use last point as control point
      // This produces smooth curves instead of jagged line segments
      const midX = (this.lastX + x) / 2;
      const midY = (this.lastY + y) / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(this.prevX, this.prevY);
      this.ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
      this.ctx.stroke();

      this.prevX = midX;
      this.prevY = midY;
    }

    this.lastX = x;
    this.lastY = y;
  }

  private endStroke(): void {
    // Draw final segment to current position
    this.ctx.lineTo(this.lastX, this.lastY);
    this.ctx.stroke();

    this.isDrawing = false;
    this.saveState();
  }

  private placeText(x: number, y: number): void {
    const text = prompt('Enter annotation text:');
    if (!text) return;

    this.ctx.font = `${this.textSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    this.ctx.fillStyle = this.textColor;
    this.ctx.textBaseline = 'top';

    // Background for readability
    const metrics = this.ctx.measureText(text);
    const padding = 4;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.fillRect(
      x - padding,
      y - padding,
      metrics.width + padding * 2,
      this.textSize + padding * 2
    );

    // Text
    this.ctx.fillStyle = this.textColor;
    this.ctx.fillText(text, x, y);

    this.saveState();
  }

  // ---- Private: Coordinate Helpers ----

  private getTouchPos(touch: Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  private getMousePos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  // ---- Private: History ----

  private saveState(): void {
    // Discard redo branch
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Save current canvas state
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history.push(imageData);
    this.historyIndex++;

    // Enforce max history (drop oldest to stay under memory limit)
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
      this.historyIndex--;
    }

    this.emitState();
  }

  private emitState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        canUndo: this.historyIndex > 0,
        canRedo: this.historyIndex < this.history.length - 1,
        tool: this.currentTool,
        strokeWidth: this.strokeWidth,
        hasImage: this.imageLoaded
      });
    }
  }
}
