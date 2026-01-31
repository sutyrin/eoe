# Phase 4: Mobile Gallery & Ideation Tools - Research

**Researched:** 2026-01-31
**Domain:** Progressive Web App (PWA) development with Astro
**Confidence:** MEDIUM-HIGH

## Summary

Phase 4 transforms the Astro-based portfolio into an offline-capable mobile companion for browsing atoms, tweaking parameters, and capturing ideation through voice notes and screenshot annotations. The standard stack uses `@vite-pwa/astro` for PWA capabilities, IndexedDB for offline storage, Prism.js for code highlighting, MediaRecorder API for voice capture, and HTML5 Canvas for annotation.

**Key architectural insight:** iOS Safari imposes strict storage limits (50MB cache) and requires careful MIME type handling for MediaRecorder. The recommended approach prioritizes static pre-generation of atom metadata at build time, lazy-loaded thumbnails, and aggressive cache management to stay within mobile quotas.

**Primary recommendation:** Build as Astro SSG with PWA layer, using IndexedDB for offline atom data, Prism.js for mobile-optimized code viewing, MediaRecorder → Whisper API for transcription, and lightweight Canvas-based pen annotation (avoid heavy libraries like Fabric.js or tldraw for this simple use case).

## Standard Stack

The established libraries/tools for this domain:

### Core PWA Foundation
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @vite-pwa/astro | 0.2.0+ | Zero-config PWA integration for Astro | Official Vite PWA integration, requires Astro 4.0+ and Vite 5+, handles service worker generation and manifest |
| Workbox | (via @vite-pwa/astro) | Service worker caching strategies | Industry standard for SW caching, supports cache-first, network-first, stale-while-revalidate patterns |
| IndexedDB | Native | Offline data storage for atoms/notes | Asynchronous API (works in service workers), supports 60% of disk space vs localStorage's 5MB, handles complex objects |

### Code Viewing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prism.js | Latest | Syntax highlighting | 2KB core + 0.3-0.5KB per language (vs highlight.js 1.6MB), 297 languages, Web Worker support, 9% faster than highlight.js |

### Voice Recording & Transcription
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MediaRecorder API | Native | Browser-native audio recording | Baseline widely available since April 2021, works on iOS Safari 14.3+, no dependencies |
| OpenAI Whisper API | Latest | Audio transcription | Industry-leading accuracy, supports mp3/m4a/wav/webm up to 25MB, server-side processing |
| openai npm package | Latest | Whisper API client | Official JavaScript SDK for OpenAI APIs |

### Canvas Annotation
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native HTML5 Canvas | Native | Drawing surface | Zero dependencies, touch event support built-in, adequate for pen + text annotations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| idb (Jake Archibald) | Latest | IndexedDB wrapper | Simplifies IndexedDB API with Promises, recommended for complex queries |
| Intersection Observer API | Native | Lazy loading images | Native browser support, triggers thumbnail loading when visible |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prism.js | highlight.js | Larger bundle (1.6MB vs 2KB core), but auto-detects languages |
| Prism.js | Shiki | Build-time highlighting only, not runtime (unsuitable for dynamic content) |
| Native Canvas | Fabric.js | 27.8k stars, object-oriented, but 80KB+ overhead for simple pen drawing |
| Native Canvas | tldraw | Full whiteboard SDK, overkill for simple annotation (pen + text only) |
| Whisper API | Self-hosted Whisper | Offline capability, but requires FFmpeg, CPU-intensive on mobile |
| IndexedDB | localStorage | Simpler API, but 5MB limit and synchronous (blocks main thread) |

**Installation:**
```bash
# PWA
pnpm add -D @vite-pwa/astro

# IndexedDB wrapper (optional but recommended)
pnpm add idb

# Syntax highlighting
pnpm add prismjs

# Whisper API client
pnpm add openai
```

## Architecture Patterns

### Recommended Project Structure
```
portfolio/
├── src/
│   ├── pages/
│   │   ├── index.astro           # Homepage (becomes gallery on mobile)
│   │   ├── mobile/
│   │   │   ├── gallery.astro     # Atom list view
│   │   │   ├── [slug].astro      # Atom detail view (dynamic route)
│   │   │   ├── annotate.astro    # Screenshot annotation tool
│   │   │   └── voice.astro       # Voice note recording
│   ├── components/
│   │   ├── AtomListItem.astro    # List item with lazy-loaded thumbnail
│   │   ├── CodeViewer.astro      # Prism.js code display
│   │   ├── VoiceRecorder.astro   # MediaRecorder UI component
│   │   └── CanvasAnnotation.astro # Canvas drawing tool
│   ├── layouts/
│   │   └── MobileLayout.astro    # PWA-aware layout with offline indicator
│   ├── scripts/
│   │   ├── pwa-register.ts       # Service worker registration
│   │   ├── db.ts                 # IndexedDB schema and helpers
│   │   └── offline-sync.ts       # Track offline changes for Phase 6
│   └── styles/
│       └── mobile.css            # Touch-optimized styles (44px tap targets)
├── public/
│   ├── manifest.webmanifest      # PWA manifest
│   └── sw.js                     # Service worker (generated by Vite PWA)
└── astro.config.mjs              # Astro + PWA integration
```

### Pattern 1: Astro SSG with PWA Layer
**What:** Generate static atom gallery pages at build time, layer PWA for offline access
**When to use:** Mobile companion to desktop workspace (viewing atoms, not creating)

**Example:**
```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EOE Atoms',
        short_name: 'EOE',
        theme_color: '#1a1a1a',
        icons: [/* ... */]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/,
            handler: 'NetworkOnly' // Whisper API - never cache
          },
          {
            urlPattern: /\.(?:png|jpg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
});
```

### Pattern 2: Dynamic Routes for Atom Detail Views
**What:** Use Astro's getStaticPaths() to generate detail pages for each atom at build time
**When to use:** Browse existing atoms offline without server

**Example:**
```typescript
// src/pages/mobile/[slug].astro
---
import fs from 'fs';
import path from 'path';

export async function getStaticPaths() {
  const atomsDir = path.join(process.cwd(), '../atoms');
  const atoms = fs.readdirSync(atomsDir)
    .filter(name => name.match(/^\d{4}-\d{2}-\d{2}-/))
    .map(name => ({
      params: { slug: name },
      props: {
        code: fs.readFileSync(path.join(atomsDir, name, 'sketch.js'), 'utf-8'),
        config: JSON.parse(fs.readFileSync(path.join(atomsDir, name, 'config.json'), 'utf-8')),
        notes: fs.readFileSync(path.join(atomsDir, name, 'NOTES.md'), 'utf-8')
      }
    }));

  return atoms;
}

const { slug } = Astro.params;
const { code, config, notes } = Astro.props;
---
<MobileLayout>
  <CodeViewer code={code} language="javascript" />
  <ParamSliders config={config} />
  <NotesView notes={notes} />
</MobileLayout>
```

### Pattern 3: MediaRecorder with iOS Safari MIME Type Fallback
**What:** Detect supported audio formats before recording, prioritize iOS-compatible formats
**When to use:** Voice note recording on cross-platform PWA

**Example:**
```typescript
// src/scripts/voice-recorder.ts
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Check supported MIME types in order of preference
  const mimeTypes = [
    'audio/webm;codecs=opus', // iOS Safari prefers this
    'audio/webm',
    'audio/mp4',
    'audio/wav'
  ];

  const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

  if (!supportedType) {
    throw new Error('No supported audio format found');
  }

  const recorder = new MediaRecorder(stream, { mimeType: supportedType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: supportedType });
    await transcribeWithWhisper(blob);
  };

  recorder.start();
  return recorder;
}
```

### Pattern 4: IndexedDB for Offline Atom Metadata
**What:** Store atom metadata (title, date, type, thumbnail path) in IndexedDB for offline gallery
**When to use:** Enable offline browsing of atom list without file system access

**Example:**
```typescript
// src/scripts/db.ts
import { openDB } from 'idb';

const dbPromise = openDB('eoe-atoms', 1, {
  upgrade(db) {
    const atomStore = db.createObjectStore('atoms', { keyPath: 'slug' });
    atomStore.createIndex('date', 'date');
    atomStore.createIndex('type', 'type');

    const voiceStore = db.createObjectStore('voiceNotes', { keyPath: 'id', autoIncrement: true });
    voiceStore.createIndex('atomSlug', 'atomSlug');

    const screenshotStore = db.createObjectStore('screenshots', { keyPath: 'id', autoIncrement: true });
    screenshotStore.createIndex('atomSlug', 'atomSlug');
  }
});

export async function saveAtomMetadata(atoms) {
  const db = await dbPromise;
  const tx = db.transaction('atoms', 'readwrite');

  for (const atom of atoms) {
    await tx.store.put({
      slug: atom.slug,
      title: atom.title,
      date: atom.date,
      type: atom.type,
      thumbnailUrl: `/thumbnails/${atom.slug}.webp`
    });
  }

  await tx.done;
}

export async function getAtomsSortedByDate() {
  const db = await dbPromise;
  const index = db.transaction('atoms').store.index('date');
  return index.getAll(); // Returns reverse chronological (YYYY-MM-DD naming)
}
```

### Pattern 5: Canvas Pen Drawing with Touch Support
**What:** Implement freehand pen with touch events, stroke smoothing, undo/redo stack
**When to use:** Screenshot annotation on mobile (pen + text, no shapes in v1.1)

**Example:**
```typescript
// src/scripts/canvas-annotation.ts
class CanvasAnnotation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private history: ImageData[] = [];
  private historyIndex = -1;
  private isDrawing = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupEventListeners();
    this.saveState(); // Initial state for undo
  }

  private setupEventListeners() {
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const touch = e.touches[0];
      const { x, y } = this.getTouchPos(touch);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDrawing) return;

      const touch = e.touches[0];
      const { x, y } = this.getTouchPos(touch);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDrawing = false;
      this.saveState(); // Save after each stroke
    });
  }

  private getTouchPos(touch: Touch) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  private saveState() {
    // Clear future history if we're not at the end
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Save current state
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history.push(imageData);
    this.historyIndex++;

    // Limit history size to prevent memory issues on mobile
    if (this.history.length > 20) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
    }
  }

  setStrokeWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  async exportAsWebP(): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.9);
    });
  }
}
```

### Pattern 6: Lazy-Loaded Thumbnails with Intersection Observer
**What:** Generate thumbnails at build time, lazy-load with native loading="lazy" or IntersectionObserver
**When to use:** Atom gallery list view with many items

**Example:**
```astro
---
// src/components/AtomListItem.astro
const { slug, title, date, type, thumbnailUrl } = Astro.props;
---
<li class="atom-list-item">
  <a href={`/mobile/${slug}`}>
    <img
      src={thumbnailUrl}
      alt={`${title} thumbnail`}
      loading="lazy"
      width="80"
      height="80"
    />
    <div class="atom-info">
      <h3>{title}</h3>
      <time>{date}</time>
      <span class="type">{type}</span>
    </div>
  </a>
</li>

<style>
  .atom-list-item {
    /* Touch-friendly tap target: 44px minimum */
    min-height: 44px;
    padding: 12px;
  }

  .atom-list-item a {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  img {
    border-radius: 8px;
    object-fit: cover;
  }
</style>
```

### Pattern 7: Whisper API Transcription with Error Handling
**What:** Upload audio blob to Whisper API, handle network errors, show transcript for user review
**When to use:** Voice note transcription (background process after recording)

**Example:**
```typescript
// src/scripts/whisper-transcribe.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
  // NEVER expose API key in frontend - use server endpoint
  dangerouslyAllowBrowser: false
});

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Convert Blob to File (Whisper API requires File, not Blob)
    const audioFile = new File([audioBlob], 'voice-note.m4a', { type: audioBlob.type });

    // Call server endpoint that handles Whisper API
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const { text } = await response.json();
    return text;

  } catch (error) {
    console.error('Transcription error:', error);

    // Graceful degradation: save audio without transcript
    return '[Transcription unavailable - offline or API error]';
  }
}

// Server endpoint (Astro API route: src/pages/api/transcribe.ts)
export async function POST({ request }) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1'
  });

  return new Response(JSON.stringify({ text: transcription.text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Anti-Patterns to Avoid
- **Storing full code in IndexedDB**: Code is already in service worker cache; IndexedDB should only store metadata
- **Using localStorage for atoms**: 5MB limit too restrictive, synchronous API blocks main thread
- **Custom code editor on mobile**: Use Prism.js for viewing only, defer editing to desktop
- **Heavy drawing libraries**: Fabric.js/tldraw overkill for pen + text; native Canvas is 80KB lighter
- **Client-side Whisper API key**: Expose API key = security risk; use server endpoint
- **Saving canvas state as base64 toDataURL**: Memory-intensive; use ImageData for undo/redo stack

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker generation | Custom SW caching logic | @vite-pwa/astro + Workbox | Cache versioning, precaching, runtime strategies all handled; manual SW = cache invalidation bugs |
| IndexedDB raw API | Direct IDB calls | `idb` wrapper library | Promise-based API, handles version migrations, cleaner syntax |
| Syntax highlighting | Regex + HTML escaping | Prism.js | 297 languages, proper token parsing, 2KB core, battle-tested |
| Audio format detection | Hardcode 'audio/webm' | MediaRecorder.isTypeSupported() | iOS Safari needs 'audio/webm;codecs=opus', Android varies |
| Lazy image loading | Manual IntersectionObserver | Native loading="lazy" | Browser-optimized, zero JS, works in 95% of browsers (2026) |
| Clipboard copy on iOS | execCommand('copy') | Clipboard API with textarea fallback | execCommand deprecated, Clipboard API is standard (with iOS Safari quirks) |
| Stroke smoothing | Raw touch coords | Bezier curve smoothing | Jagged lines on fast strokes; quadratic curves smooth pen input |
| Offline detection | Ping server every N seconds | navigator.onLine + service worker | Battery-efficient, instant feedback, integrates with SW |

**Key insight:** PWA tooling matured significantly by 2026; custom service worker code = reinventing Workbox poorly. Let @vite-pwa/astro generate SW, focus on app logic.

## Common Pitfalls

### Pitfall 1: iOS Safari Storage Eviction
**What goes wrong:** PWA works offline on Android, but iOS clears cache after 7 days of non-use or when storage pressure occurs
**Why it happens:** Safari's aggressive storage eviction policy (50MB cache limit, 7-day cap on IndexedDB)
**How to avoid:**
- Monitor storage quota with `navigator.storage.estimate()`
- Prioritize app shell + critical atoms in cache (use Workbox precache)
- Warn users at 80% quota usage
- Implement cache cleanup for old thumbnails
**Warning signs:**
- User reports "atoms disappeared" on iPhone after week without opening app
- Cache size grows linearly with atom count (thumbnails not expiring)

### Pitfall 2: MediaRecorder MIME Type Hardcoding
**What goes wrong:** Voice recording works on desktop Chrome, fails silently on iOS Safari
**Why it happens:** Hardcoded `audio/webm` unsupported on Safari; iOS prefers `audio/webm;codecs=opus` or `audio/mp4`
**How to avoid:**
- Always check `MediaRecorder.isTypeSupported()` before instantiating
- Test fallback chain: `webm;codecs=opus` → `webm` → `mp4` → `wav`
- Store detected MIME type with audio blob for playback
**Warning signs:**
- `navigator.mediaDevices.getUserMedia()` succeeds but `MediaRecorder.start()` throws error
- Audio blob is 0 bytes on iOS

### Pitfall 3: Clipboard API iOS Safari User Gesture Timing
**What goes wrong:** Copy-to-clipboard works on button click, fails in async callback (e.g., after fetch)
**Why it happens:** iOS Safari requires clipboard access within same event loop tick as user gesture; async operations break the chain
**How to avoid:**
- Use `ClipboardItem` with Blob for async operations (Safari-specific workaround)
- For text, write to clipboard immediately before async operation, update after
- Fall back to textarea select + execCommand for older Safari versions
**Warning signs:**
- `navigator.clipboard.writeText()` throws `NotAllowedError` on iOS but works on Android
- Copy works on direct button click, fails after network request completes

### Pitfall 4: Canvas Undo/Redo Memory Leak
**What goes wrong:** Annotation tool becomes sluggish after ~50 strokes, crashes on low-end phones
**Why it happens:** Storing full canvas as base64 toDataURL for each undo state; 1080p canvas = ~1MB per state
**How to avoid:**
- Use `ctx.getImageData()` instead of `toDataURL()` (returns raw pixels, more compact)
- Limit undo stack to 20-30 states (sufficient for annotation session)
- Clear redo stack when new stroke added (standard undo/redo behavior)
**Warning signs:**
- Memory usage grows ~1MB per pen stroke
- Browser DevTools show large base64 strings in memory profiler

### Pitfall 5: Prism.js Language Auto-Detection Bloat
**What goes wrong:** Prism.js bundle size grows to 200KB+ with all languages, slow initial load on mobile
**Why it happens:** Including all 297 languages or using auto-detect plugin without tree-shaking
**How to avoid:**
- Import only required languages: `import 'prismjs/components/prism-javascript'`
- Use Prism's custom build tool or Vite's tree-shaking
- For this project: only need `javascript`, `json`, `markdown` (atoms use p5.js = JS)
**Warning signs:**
- Prism.js bundle exceeds 50KB (should be ~5KB for 3 languages)
- Lighthouse flags "Reduce JavaScript execution time"

### Pitfall 6: Dynamic Route Build Explosion
**What goes wrong:** Build time grows exponentially with atom count (100 atoms = 5min build)
**Why it happens:** Astro's getStaticPaths() generates HTML for every atom detail page; reading files synchronously
**How to avoid:**
- Cache atom metadata in JSON file at build time (single read)
- Use parallel processing for file reads (Promise.all)
- Consider pagination or virtual scrolling for gallery (Phase 6 optimization)
**Warning signs:**
- `astro build` takes >1 second per atom
- Build output shows "Generating static paths..." taking majority of time

### Pitfall 7: Touch Event preventDefault Breaking Scroll
**What goes wrong:** Canvas annotation captures touch correctly, but page can't scroll anymore
**Why it happens:** Calling `e.preventDefault()` on all `touchmove` events disables native scroll
**How to avoid:**
- Only preventDefault on touchmove when `isDrawing === true`
- Use CSS `touch-action: none` on canvas element instead of JS preventDefault
- Let browser handle scroll when user not actively drawing
**Warning signs:**
- Users report "can't scroll page when touching canvas"
- Canvas responds to touch but page scroll broken

## Code Examples

Verified patterns from official sources:

### Astro PWA Integration
```typescript
// astro.config.mjs
// Source: https://vite-pwa-org.netlify.app/frameworks/astro
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'EOE Atoms Gallery',
        short_name: 'EOE',
        description: 'Browse and annotate visual/audio atoms',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/mobile/gallery',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/404',
        globPatterns: ['**/*.{css,js,html,svg,png,webp,woff,woff2}'],
        runtimeCaching: [
          {
            // Atom code files (cache-first, they don't change)
            urlPattern: /\/atoms\/.*\/sketch\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'atom-code',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          },
          {
            // Thumbnails (stale-while-revalidate)
            urlPattern: /\/thumbnails\/.*\.webp$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'thumbnails',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
});
```

### MediaRecorder with iOS Safari MIME Type Detection
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
// Enhanced with iOS Safari guidance from https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription

async function recordVoiceNote(): Promise<Blob> {
  // Request microphone access
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Detect supported format (iOS Safari needs specific MIME types)
  const mimeTypes = [
    'audio/webm;codecs=opus', // iOS Safari preference
    'audio/webm',
    'audio/mp4',
    'audio/wav'
  ];

  const supportedMime = mimeTypes.find(mime => MediaRecorder.isTypeSupported(mime));
  if (!supportedMime) {
    throw new Error('No supported audio format on this device');
  }

  const recorder = new MediaRecorder(stream, { mimeType: supportedMime });
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: supportedMime });
      stream.getTracks().forEach(track => track.stop()); // Release mic
      resolve(audioBlob);
    };

    recorder.onerror = (e) => reject(e);

    recorder.start();

    // Auto-stop after 5 minutes (safety limit)
    setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    }, 5 * 60 * 1000);
  });
}
```

### Prism.js Code Highlighting
```astro
---
// src/components/CodeViewer.astro
// Source: https://prismjs.com/
import 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import 'prismjs/components/prism-javascript'; // Only load needed languages

const { code, language = 'javascript' } = Astro.props;
---
<div class="code-viewer">
  <pre class="language-{language}"><code class="language-{language}">{code}</code></pre>
</div>

<script>
  import Prism from 'prismjs';

  // Highlight on client-side (Astro runs server-side)
  document.addEventListener('DOMContentLoaded', () => {
    Prism.highlightAll();
  });
</script>

<style>
  .code-viewer {
    /* Mobile-optimized code display */
    font-size: 16px; /* Large enough to read on 6" screen */
    line-height: 1.6;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
  }

  pre {
    /* Code wraps to screen width (no horizontal scroll) */
    white-space: pre-wrap;
    word-wrap: break-word;
    padding: 16px;
    border-radius: 8px;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    /* No line numbers - cleaner look on mobile */
  }
</style>
```

### Canvas Annotation with Touch Support and Undo/Redo
```typescript
// src/scripts/canvas-annotation.ts
// Touch event pattern from: https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
// Undo/redo pattern from: https://codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx

export class AnnotationCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private history: ImageData[] = [];
  private historyStep = -1;
  private isDrawing = false;
  private strokeColor = '#000000';
  private strokeWidth = 3;

  constructor(canvas: HTMLCanvasElement, imageUrl: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.loadImage(imageUrl).then(() => {
      this.saveState(); // Initial state for undo
      this.setupEventListeners();
    });
  }

  private async loadImage(url: string) {
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = url;
    });

    // Set canvas size to image dimensions
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
  }

  private setupEventListeners() {
    // Configure stroke style
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = this.getTouchPos(touch);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.isDrawing = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.isDrawing) return;
      e.preventDefault(); // Only prevent when drawing

      const touch = e.touches[0];
      const { x, y } = this.getTouchPos(touch);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isDrawing = false;
      this.saveState();
    });

    // Mouse events for desktop testing
    this.canvas.addEventListener('mousedown', (e) => {
      const { x, y } = this.getMousePos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.isDrawing = true;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      const { x, y } = this.getMousePos(e);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
      this.saveState();
    });
  }

  private getTouchPos(touch: Touch) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  private getMousePos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  private saveState() {
    // Remove states after current step (redo branch)
    this.history = this.history.slice(0, this.historyStep + 1);

    // Save current canvas state
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history.push(imageData);
    this.historyStep++;

    // Limit to 20 states to prevent memory issues on mobile
    if (this.history.length > 20) {
      this.history.shift();
      this.historyStep--;
    }
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.ctx.putImageData(this.history[this.historyStep], 0, 0);
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.ctx.putImageData(this.history[this.historyStep], 0, 0);
      return true;
    }
    return false;
  }

  setStrokeWidth(width: number) {
    this.strokeWidth = width;
    this.ctx.lineWidth = width;
  }

  async exportAsWebP(): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/webp', 0.9);
    });
  }
}
```

### IndexedDB Schema for Offline Storage
```typescript
// src/scripts/db.ts
// Pattern from: https://blog.logrocket.com/offline-storage-for-pwas/
import { openDB, IDBPDatabase } from 'idb';

interface AtomMetadata {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD format
  type: 'visual' | 'audio' | 'av';
  thumbnailUrl: string;
}

interface VoiceNote {
  id?: number;
  atomSlug: string;
  audioBlob: Blob;
  transcript: string;
  createdAt: Date;
  synced: boolean; // For Phase 6 sync
}

interface Screenshot {
  id?: number;
  atomSlug: string;
  imageBlob: Blob;
  createdAt: Date;
  synced: boolean;
}

const DB_NAME = 'eoe-atoms';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Atoms metadata store
      const atomStore = db.createObjectStore('atoms', { keyPath: 'slug' });
      atomStore.createIndex('date', 'date'); // For reverse chronological sort
      atomStore.createIndex('type', 'type'); // For filtering by type

      // Voice notes store
      const voiceStore = db.createObjectStore('voiceNotes', {
        keyPath: 'id',
        autoIncrement: true
      });
      voiceStore.createIndex('atomSlug', 'atomSlug');
      voiceStore.createIndex('synced', 'synced');

      // Screenshots store
      const screenshotStore = db.createObjectStore('screenshots', {
        keyPath: 'id',
        autoIncrement: true
      });
      screenshotStore.createIndex('atomSlug', 'atomSlug');
      screenshotStore.createIndex('synced', 'synced');
    }
  });
}

export async function saveAtom(atom: AtomMetadata) {
  const db = await initDB();
  await db.put('atoms', atom);
}

export async function getAllAtomsSorted(): Promise<AtomMetadata[]> {
  const db = await initDB();
  const atoms = await db.getAllFromIndex('atoms', 'date');
  return atoms.reverse(); // Most recent first
}

export async function saveVoiceNote(note: Omit<VoiceNote, 'id'>) {
  const db = await initDB();
  await db.add('voiceNotes', { ...note, synced: false });
}

export async function getVoiceNotesForAtom(atomSlug: string): Promise<VoiceNote[]> {
  const db = await initDB();
  return db.getAllFromIndex('voiceNotes', 'atomSlug', atomSlug);
}

export async function saveScreenshot(screenshot: Omit<Screenshot, 'id'>) {
  const db = await initDB();
  await db.add('screenshots', { ...screenshot, synced: false });
}

export async function getScreenshotsForAtom(atomSlug: string): Promise<Screenshot[]> {
  const db = await initDB();
  return db.getAllFromIndex('screenshots', 'atomSlug', atomSlug);
}

// Get unsynced items for Phase 6 sync
export async function getUnsyncedVoiceNotes(): Promise<VoiceNote[]> {
  const db = await initDB();
  return db.getAllFromIndex('voiceNotes', 'synced', false);
}

export async function getUnsyncedScreenshots(): Promise<Screenshot[]> {
  const db = await initDB();
  return db.getAllFromIndex('screenshots', 'synced', false);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Service Worker manual coding | @vite-pwa/astro + Workbox | 2023 | Zero-config PWA for Astro, eliminates cache versioning bugs |
| localStorage for offline data | IndexedDB with idb wrapper | 2020 | 60% disk quota vs 5MB, async API, works in service workers |
| highlight.js | Prism.js for mobile | 2021+ | 80% smaller bundle (2KB vs 1.6MB), modular imports |
| execCommand('copy') | Clipboard API | 2020 (iOS Safari 13.1) | Async, secure context required, iOS quirks remain |
| Canvas toDataURL for undo | ImageData in-memory | Always better | 10x memory savings (raw pixels vs base64 encoding) |
| Custom audio recorder libraries | Native MediaRecorder API | 2021 (baseline widely available) | Zero dependencies, iOS Safari support since 14.3 |
| Self-hosted Whisper | OpenAI Whisper API | 2023 | No FFmpeg dependency, 25MB file limit, $0.006/min pricing |
| loading="lazy" via IntersectionObserver | Native loading="lazy" | 2022 (95%+ support) | Zero JS, browser-optimized, works in Chrome/Edge/Firefox/Safari |

**Deprecated/outdated:**
- **execCommand('copy')**: Deprecated 2020, replaced by Clipboard API (but iOS Safari still has quirks)
- **Application Cache (AppCache)**: Removed 2022, replaced by Service Workers
- **Web SQL**: Deprecated 2010, replaced by IndexedDB
- **getUserMedia() vendor prefixes**: Standardized 2021, no longer need `navigator.webkitGetUserMedia`

## Open Questions

Things that couldn't be fully resolved:

1. **iOS Safari Clipboard API reliability in PWA context**
   - What we know: Clipboard API requires user gesture within same event loop tick
   - What's unclear: Does standalone PWA mode (home screen) behave differently than Safari browser?
   - Recommendation: Implement textarea fallback for copy operations, test thoroughly on iOS 16+

2. **Whisper API rate limits for mobile use case**
   - What we know: $0.006/minute pricing, 25MB file limit, supports common mobile formats
   - What's unclear: Rate limits for API calls (burst recording sessions), timeout behavior on slow networks
   - Recommendation: Implement queue for transcription requests, show progress indicator, handle 429 errors gracefully

3. **IndexedDB quota on iOS PWA after home screen install**
   - What we know: Safari web = 50MB cache, home screen PWA = potentially up to 60% disk (conflicting reports)
   - What's unclear: Exact quota calculation, whether eviction policy differs for PWA vs web
   - Recommendation: Monitor `navigator.storage.estimate()` aggressively, warn at 40MB usage, test on real devices

4. **Thumbnail generation strategy (build-time vs runtime)**
   - What we know: Atoms have index.html with p5.js sketch, no static preview image
   - What's unclear: How to generate thumbnails without running p5.js sketch (headless browser? Playwright?)
   - Recommendation: Phase 4 task should spike on Playwright screenshot automation during build

5. **Parameter tweaking without live preview**
   - What we know: Context says "parameters update config but don't auto-preview"
   - What's unclear: User experience flow - do they see stale visual while adjusting params? Confusing?
   - Recommendation: Show "Preview on desktop" message after parameter changes, defer live preview to Phase 5

## Recommended Approach

### Stack Decisions (HIGH Confidence)
- **PWA Foundation:** @vite-pwa/astro (official integration, zero-config)
- **Offline Storage:** IndexedDB with `idb` wrapper (60% disk quota, async, standard)
- **Code Highlighting:** Prism.js (2KB core, mobile-optimized, 297 languages)
- **Voice Recording:** MediaRecorder API (native, iOS Safari 14.3+)
- **Transcription:** OpenAI Whisper API via server endpoint (industry-leading accuracy)
- **Annotation:** Native HTML5 Canvas (zero dependencies, touch events built-in)
- **Image Format:** WebP for thumbnails/screenshots (26% smaller than PNG, 2026 universal support)

### Architecture Patterns (MEDIUM-HIGH Confidence)
1. **Static Site Generation:** Astro getStaticPaths() for atom detail pages
2. **Service Worker:** Workbox runtime caching (cache-first for code, stale-while-revalidate for thumbnails)
3. **Gallery List:** Lazy-loaded thumbnails with native loading="lazy"
4. **Undo/Redo:** ImageData stack (20-state limit for mobile memory constraints)
5. **MIME Type Detection:** MediaRecorder.isTypeSupported() fallback chain

### Implementation Sequence
**Phase 4.1: PWA Foundation (Week 1)**
- Install @vite-pwa/astro, configure manifest
- Set up service worker caching strategies
- Create mobile layout with offline indicator
- Implement IndexedDB schema

**Phase 4.2: Atom Gallery (Week 1-2)**
- Generate atom metadata at build time
- Create gallery list view (reverse chronological)
- Implement detail view with Prism.js code display
- Add thumbnail generation (Playwright screenshot spike)

**Phase 4.3: Voice Notes (Week 2)**
- MediaRecorder with MIME type detection
- Whisper API server endpoint
- Voice note storage in IndexedDB
- Transcript review UI

**Phase 4.4: Screenshot Annotation (Week 3)**
- Canvas touch drawing implementation
- Pen stroke with undo/redo
- Text annotation tool (Phase 4.5 if time allows)
- WebP export and storage

**Phase 4.5: Parameter Tweaking (Week 3)**
- Render sliders from config.json
- Real-time local config updates
- "Preview on desktop" messaging
- Offline change tracking for Phase 6 sync

**Phase 4.6: Polish & Testing (Week 4)**
- iOS Safari testing (clipboard, MediaRecorder, storage quota)
- Android Chrome testing
- Lighthouse PWA audit (target 100 score)
- Offline functionality testing

### Safe to Start Immediately
- @vite-pwa/astro integration (well-documented, stable)
- Prism.js code viewer (straightforward, no gotchas)
- IndexedDB schema (idb wrapper is mature)
- Canvas pen drawing (standard HTML5, many examples)

### Needs Careful Planning
- **Thumbnail generation:** Spike on Playwright headless screenshot automation
- **iOS Safari testing:** Requires real device testing for MediaRecorder, Clipboard API, storage quotas
- **Whisper API integration:** Design server endpoint, handle rate limits, implement queue
- **Cache quota management:** Monitor storage, implement cleanup strategy

## Unknowns & Risks

### HIGH Risk
1. **iOS Safari storage eviction unpredictability**
   - Risk: Users lose offline atoms after 7 days or low disk space
   - Mitigation: Warn at 40MB usage, prioritize app shell caching, document limitation
   - Validation: Test on iPhone with low storage, monitor eviction behavior

2. **Thumbnail generation complexity**
   - Risk: p5.js sketches require browser runtime, can't generate thumbnails at build time easily
   - Mitigation: Spike on Playwright headless browser, fallback to placeholder thumbnails
   - Validation: Prototype Playwright screenshot script in Phase 4.1

### MEDIUM Risk
3. **Whisper API rate limits during burst usage**
   - Risk: User records 10 voice notes in quick succession, API throttles or times out
   - Mitigation: Implement queue with retry logic, show transcription progress
   - Validation: Test with 20+ consecutive recordings, observe API behavior

4. **Clipboard API iOS Safari quirks in standalone PWA**
   - Risk: Copy-to-clipboard fails in home screen PWA mode despite working in Safari browser
   - Mitigation: Implement textarea fallback, test both contexts
   - Validation: Install PWA to home screen, test copy on iOS 16+

### LOW Risk
5. **Prism.js bundle size creep**
   - Risk: Accidentally including all 297 languages instead of just JavaScript
   - Mitigation: Use Vite's tree-shaking, verify bundle size in build output
   - Validation: Check dist/ bundle sizes, target <10KB for Prism

6. **Canvas undo/redo memory on low-end devices**
   - Risk: 20-state ImageData history uses too much RAM on budget Android phones
   - Mitigation: Test on low-end device, reduce to 10 states if needed
   - Validation: Profile memory usage on <2GB RAM device

## Sources

### Primary (HIGH confidence)
- [@vite-pwa/astro Documentation](https://vite-pwa-org.netlify.app/frameworks/astro) - PWA integration
- [MDN MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API) - Voice recording
- [Prism.js Official Site](https://prismjs.com/) - Syntax highlighting
- [Web.dev PWA Offline Data](https://web.dev/learn/pwa/offline-data/) - IndexedDB patterns
- [Chrome for Developers Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview/) - Service worker patterns

### Secondary (MEDIUM confidence)
- [PWA on iOS - Current Status & Limitations](https://brainhub.eu/library/pwa-on-ios) - iOS Safari limitations
- [iPhone Safari MediaRecorder Guide](https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription) - iOS MIME types
- [highlight.js vs Prism Comparison](https://www.peterbe.com/plog/benchmark-compare-highlight.js-vs-prism) - Performance benchmarks
- [LogRocket Offline Storage for PWAs](https://blog.logrocket.com/offline-storage-for-pwas/) - IndexedDB patterns
- [Microsoft Edge Store Data on Device](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/offline) - Storage quota details

### Tertiary (LOW confidence - marked for validation)
- WebSearch results on canvas stroke smoothing (various blog posts, no single authoritative source)
- WebSearch results on mobile slider libraries (2026 rankings, not yet verified)
- iOS PWA storage quota conflicting reports (50MB vs 60% disk - needs device testing)

## Metadata

**Confidence breakdown:**
- PWA stack (@vite-pwa/astro, Workbox, IndexedDB): HIGH - Official docs, widely adopted
- Code highlighting (Prism.js): HIGH - Official docs, verified bundle sizes
- Voice recording (MediaRecorder): MEDIUM-HIGH - MDN docs, iOS MIME types need testing
- Transcription (Whisper API): MEDIUM - Official API docs, rate limits unclear
- Annotation (Canvas): MEDIUM - Standard HTML5, but iOS Safari clipboard quirks remain
- iOS Safari behavior: LOW-MEDIUM - Conflicting reports on storage quotas, needs real device testing

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - PWA/mobile tech is relatively stable)

**Key unknowns requiring validation:**
1. Thumbnail generation with Playwright headless browser
2. iOS Safari storage quota in standalone PWA mode
3. Whisper API rate limits for burst transcription
4. Clipboard API behavior in iOS PWA vs Safari browser context
