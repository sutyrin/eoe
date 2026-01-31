# Phase 5 Research: Composition Canvas & Offline Support

**Researched:** 2026-01-31
**Domain:** React Flow composition canvas, touch interaction, parameter routing
**Confidence:** MEDIUM-HIGH

## Summary

Phase 5 builds a touch-friendly composition canvas enabling parameter routing between atoms using React Flow as the node-based UI foundation. Research confirms React Flow is production-ready for mobile touch (supports pan, zoom, pinch gestures) but requires careful optimization for 5-node compositions on mid-range phones. The recommended architecture stores compositions as JSON graphs in IndexedDB (atoms list + routing edges), uses dropdown selectors for parameter routing (visual node graph deferred to v1.2), and implements simple last-write-wins conflict resolution for Phase 6 sync.

**Key architectural insight:** React Flow's bundle size (600KB+ unoptimized) requires tree-shaking via named imports to stay under mobile performance targets. The composition data model should separate "composition metadata" (atoms, positions, zoom state) from "routing graph" (source param → target param edges) to enable independent evolution. Parameter type inference can be basic in Phase 5 (number → number, string → string) with range normalization deferred to Phase 6 when live preview validates edge cases.

**Primary recommendation:** Use React Flow 11.11+ with custom atom nodes (render config.json params as handles), store compositions in IndexedDB as `{ id, name, atoms: [{ atomSlug, position }], routes: [{ source, target, sourceParam, targetParam }] }`, implement dropdown-based parameter routing UI (tap node → show params → select source/target), and extend Phase 4's offline infrastructure (service worker + IndexedDB) to cache composition data alongside atom metadata.

---

## Key Findings

### 1. React Flow on Mobile

**Performance Characteristics:**
- [React Flow Performance Docs](https://reactflow.dev/learn/advanced-use/performance) emphasize that performance issues stem from unnecessary re-renders, not library size
- [Touch Device Example](https://reactflow.dev/examples/interaction/touch-device) demonstrates mobile support including drag, pan, pinch-zoom, and touch-based node connections
- [Stress Test](https://reactflow.dev/examples/nodes/stress) shows 100+ nodes are feasible on desktop, but mobile targets should stay below 10-15 nodes for <500ms render

**Bundle Size Impact:**
- React Flow core is ~100KB gzipped when properly tree-shaken via named imports
- Phase 4 current mobile bundle is <1MB; adding React Flow will increase by ~15-20% (acceptable)
- [Bundle Size Optimization Guide](https://oneuptime.com/blog/post/2026-01-15-optimize-react-bundle-size-tree-shaking/view) recommends named imports: `import { ReactFlow, Node, Edge } from 'reactflow'` instead of `import ReactFlow from 'reactflow'`

**Touch Gesture Optimization:**
- React Flow includes built-in touch handlers (no custom implementation needed)
- Pan: Single-finger drag on canvas background
- Zoom: Pinch gesture on canvas (configurable min/max zoom)
- Connect: Tap source handle → drag to target handle (48px touch targets recommended)
- Known issue: [iOS Safari grey rectangles](https://cables.gl/docs/faq/embedding/mobile_grey_rects/grey_rectangles_on_ios) on touch (CSS fix: `-webkit-tap-highlight-color: transparent`)

**Mobile-Specific Configuration:**
```typescript
<ReactFlow
  minZoom={0.5}
  maxZoom={2}
  nodesDraggable={true}
  panOnDrag={[1]} // Single-finger pan
  zoomOnPinch={true}
  panOnScroll={false} // Disable on mobile (conflicts with page scroll)
  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
  fitView
  fitViewOptions={{ padding: 0.2 }}
>
```

**Recommendation:**
- Limit compositions to 5 atoms in Phase 5 (increase in v1.2 after performance validation)
- Use React.memo on custom node components to prevent re-renders
- Implement virtualization if composition list exceeds 20 items (Phase 6 optimization)

**Confidence:** MEDIUM-HIGH (official docs + examples exist, but no published mobile benchmarks for 5-10 node compositions on Pixel 6a-class devices)

---

### 2. Composition Data Model

**Graph Storage Structure:**

Based on [IndexedDB best practices](https://rxdb.info/articles/indexeddb-max-storage-limit.html) and [graph database patterns](https://github.com/levelgraph/levelgraph), the recommended structure is:

```typescript
interface Composition {
  id: string;              // UUID
  name: string;            // User-visible name
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  atoms: CompositionAtom[];
  routes: ParameterRoute[];
  viewport: {              // React Flow viewport state
    x: number;
    y: number;
    zoom: number;
  };
  synced: boolean;         // Phase 6 sync flag
}

interface CompositionAtom {
  nodeId: string;          // Unique in composition (uuid)
  atomSlug: string;        // Reference to atoms store
  position: { x: number; y: number };
  paramOverrides?: Record<string, any>; // Local tweaks
}

interface ParameterRoute {
  id: string;              // UUID
  sourceNodeId: string;
  sourceParam: string;     // Config.json key
  targetNodeId: string;
  targetParam: string;     // Config.json key
  transform?: 'passthrough' | 'normalize' | 'invert'; // Phase 6
}
```

**Handling Missing Atoms:**
- When loading composition, check if atomSlug exists in atoms store
- If missing: Show placeholder node with "Atom not found: {slug}" + option to remove from composition
- Do not block composition loading due to missing atoms (graceful degradation)

**Circular Routing Detection:**
- Phase 5: Allow circular routes (trust user to avoid audio feedback loops)
- Phase 6: Implement acyclic validation during live preview (detect cycles, warn user)
- Rationale: Circular routes may be intentional (oscillating parameters), so don't prohibit by default

**Recommendation:**
- Store compositions in separate IndexedDB object store (reuse Phase 4's `db.ts` pattern)
- Use UUIDs for all IDs (avoid collision when merging compositions in Phase 6)
- Keep `paramOverrides` at composition level (don't mutate original atom config.json)

**Confidence:** HIGH (patterns well-established, similar to Cables.gl/Reaktor data models)

---

### 3. Parameter Routing Logic

**Type Inference:**

Phase 5 uses basic type matching based on config.json parameter values:

```typescript
function inferParamType(value: any): 'number' | 'string' | 'boolean' | 'object' {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'boolean') return 'boolean';
  return 'object'; // Arrays, nested objects
}

function canRoute(sourceValue: any, targetValue: any): boolean {
  const sourceType = inferParamType(sourceValue);
  const targetType = inferParamType(targetValue);

  // Phase 5: Only allow same-type routing
  return sourceType === targetType;
}
```

**Special Cases:**
- **Hue parameters** (detected by name pattern `*Hue` or value range 0-360): Allow routing to other hue params or generic numbers
- **Boolean toggles**: Only route to other booleans
- **Objects** (synth config, envelope): Do not allow routing in Phase 5 (defer to v1.2 nested routing)

**Range Normalization:**
- Phase 5: No automatic range conversion (0-1 routes directly to 0-360, user adjusts manually)
- Phase 6: Implement `transform: 'normalize'` option that maps source range → target range
- Example: `bgHue` (0-360) → `size` (0-500) becomes `size = (bgHue / 360) * 500`

**Routing Visualization:**
- Dropdown UI shows only compatible parameters (filtered by type)
- Color-code parameter types in dropdown: numbers (blue), strings (green), booleans (orange)
- Show current value next to parameter name: `bgHue (200)`

**Route Chaining:**
- Phase 5: Allow chaining (atom A.x → atom B.y → atom C.z)
- Implementation: Apply routes in dependency order (topological sort of routing graph)
- If cycle detected: Apply routes in edge creation order (warn in Phase 6 preview)

**Recommendation:**
- Start with strict type matching (number → number only)
- Use Phase 4's `param-engine.ts` heuristic range inference to detect parameter types
- Defer range normalization to Phase 6 (live preview will validate need)

**Confidence:** MEDIUM (type inference straightforward, but edge cases like "hue vs. generic number" require user testing)

---

### 4. Touch UI for Composition

**Add Atom to Canvas:**
1. Tap "+" button (fixed bottom-right, 64px circle, Material Design FAB pattern)
2. Gallery overlay slides up (bottom sheet, 80% screen height)
3. Search/filter atoms by name or type
4. Tap atom card → node appears at canvas center
5. Overlay dismisses, user drags node to position

**Route Parameters (Dropdown Approach):**
1. Tap source node → Node detail panel slides up (bottom sheet)
2. Panel shows: Node name, "Output Parameters" section, "Input Parameters" section
3. Under "Output Parameters": List all params with "+ Route" button
4. Tap "+ Route" → Dropdown shows compatible target nodes/params
5. Select target → Edge appears on canvas
6. Tap edge to edit/delete route

**Alternative (Tap-to-Connect):**
- Tap source node param handle → Enter "routing mode" (canvas dims, handles highlight)
- Tap target node param handle → Edge created
- Tap outside or "Cancel" → Exit routing mode
- Rationale: Faster for power users, but discoverability lower (prefer dropdown for Phase 5)

**Undo/Redo:**
- Track composition state changes in memory (circular buffer, 20 states max)
- Undo: Cmd+Z (keyboard) or "Undo" button in toolbar
- Redo: Cmd+Shift+Z or "Redo" button
- State changes: Add/remove node, add/remove edge, move node, rename composition

**Feedback for Successful Routing:**
- Edge animates in (fade + scale from source → target, 300ms)
- Brief toast notification: "Routed [source.param] → [target.param]"
- Edge color: Blue for active routes, grey for inactive (Phase 6 preview feature)

**Recommendation:**
- Use bottom sheet pattern (Material Design) for node details and atom selection
- Implement dropdown routing in Phase 5, defer tap-to-connect to v1.2 based on user feedback
- Use React Flow's built-in edge animations (smoothstep edges for organic feel)

**Confidence:** HIGH (touch UX patterns well-established, React Flow supports all interactions)

---

### 5. Offline Persistence

**IndexedDB Storage:**

Extend Phase 4's `db.ts` with new object store:

```typescript
// Add to db.ts upgrade handler
if (!db.objectStoreNames.contains('compositions')) {
  const compositionStore = db.createObjectStore('compositions', { keyPath: 'id' });
  compositionStore.createIndex('name', 'name');
  compositionStore.createIndex('updatedAt', 'updatedAt');
  compositionStore.createIndex('synced', 'synced'); // Phase 6 sync
}

export async function saveComposition(composition: Composition): Promise<void> {
  const db = await getDB();
  await db.put('compositions', { ...composition, synced: false });
}

export async function getComposition(id: string): Promise<Composition | undefined> {
  const db = await getDB();
  return db.get('compositions', id);
}

export async function getAllCompositions(): Promise<Composition[]> {
  const db = await getDB();
  const compositions = await db.getAllFromIndex('compositions', 'updatedAt');
  return compositions.reverse(); // Most recent first
}

export async function deleteComposition(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('compositions', id);
}
```

**Sync Strategy (Phase 6 Preparation):**
- Store `synced: boolean` flag on all compositions
- When user edits composition offline: Set `synced = false`
- Phase 6 sync service: Query `compositions.index('synced', false)` to find pending uploads
- After successful cloud upload: Set `synced = true`

**Conflict Resolution (Phase 6):**

Based on [PWA sync best practices](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/), use simple last-write-wins:

```typescript
interface SyncMetadata {
  deviceId: string;      // UUID stored in localStorage
  lastSyncedAt: string;  // ISO timestamp
  version: number;       // Increment on each save
}

// Composition interface extended
interface Composition {
  // ... existing fields
  syncMeta: SyncMetadata;
}

function resolveConflict(local: Composition, remote: Composition): Composition {
  // Simple: Most recent updatedAt wins
  if (local.updatedAt > remote.updatedAt) return local;
  if (remote.updatedAt > local.updatedAt) return remote;

  // Tie-breaker: Higher version number wins
  if (local.syncMeta.version > remote.syncMeta.version) return local;
  return remote;
}
```

**User-Facing Conflict UI (Phase 6):**
- If timestamps within 60 seconds: Show conflict dialog
- Dialog: "Composition edited on [Device A] and [Device B]. Choose version:"
  - Preview local (show atom count, last edited time)
  - Preview remote (show atom count, last edited time)
  - "Keep Local" | "Keep Remote" | "Keep Both" (rename remote to "{name} (from {device})")

**Storage Quota Monitoring:**
- Reuse Phase 4's `getStorageEstimate()` from `db.ts`
- Composition JSON typically 5-20KB each (5 atoms × 1KB metadata + 50 routes × 100 bytes)
- Warn at 80% quota: "Storage almost full. Delete old compositions?"

**Recommendation:**
- Implement IndexedDB storage in Phase 5
- Add sync flags but defer actual sync to Phase 6
- Use simple last-write-wins for Phase 6 (explicit user choice only if timestamps <60s apart)

**Confidence:** HIGH (IndexedDB patterns standard, conflict resolution well-documented)

---

### 6. Performance Targets

**Rendering Performance:**
- **Add atom to canvas**: <500ms cold (first add), <200ms warm (subsequent adds)
  - Measured: Time from tap on atom card → node visible on canvas
- **Parameter routing UI**: <200ms tap response
  - Measured: Time from tap "+ Route" → dropdown visible
- **Composition list**: <300ms render for 10 compositions
  - Measured: Time from navigate to /mobile/compose → list visible

**Memory Constraints:**
- **Single composition (5 atoms)**: <10MB heap
  - Breakdown: React Flow ~3MB, 5 custom nodes ~1MB each, routing graph <1MB
- **Composition list (20 items)**: <20MB heap
  - Use virtualization if memory exceeds 30MB (Phase 6 optimization)

**Implementation Strategy:**
- Use React.memo on custom node components:
  ```typescript
  const AtomNode = React.memo(({ data }: NodeProps<AtomNodeData>) => {
    // Node rendering logic
  }, (prev, next) => {
    // Only re-render if data changed
    return prev.data.atomSlug === next.data.atomSlug &&
           prev.data.paramOverrides === next.data.paramOverrides;
  });
  ```

- Implement lazy loading for composition list:
  ```typescript
  const CompositionList = () => {
    const [compositions, setCompositions] = useState<Composition[]>([]);

    useEffect(() => {
      // Load 10 at a time
      getAllCompositions().then(all => setCompositions(all.slice(0, 10)));
    }, []);

    const loadMore = () => {
      getAllCompositions().then(all => setCompositions(all.slice(0, compositions.length + 10)));
    };
  };
  ```

**Benchmarking Plan:**
- Phase 5.1: Measure baseline (empty React Flow canvas)
- Phase 5.2: Add 1 node, measure delta
- Phase 5.3: Add 5 nodes, measure total render time
- If >500ms on Pixel 6a simulator: Implement memoization + reduce bundle size

**Recommendation:**
- Set up performance monitoring in Phase 5.1 (Chrome DevTools Performance tab)
- Defer optimization until measurements exceed targets (premature optimization risk)
- If targets missed: Enable React Flow's `onlyRenderVisibleElements` prop

**Confidence:** MEDIUM (targets realistic based on React Flow docs, but device-specific validation needed)

---

### 7. Reference Implementations

**Cables.gl:**
- [Canvas editor](https://cables.gl/docs/2_intermediate/image_composition/image_composition) allows arranging ops (nodes) with parameter routing
- Touch support: [iOS grey rectangle fix](https://cables.gl/docs/faq/embedding/mobile_grey_rects/grey_rectangles_on_ios) shows `-webkit-tap-highlight-color` CSS
- Parameter automation: [Timeline feature](https://blog.cables.gl/june-2022-release/) keyframes any parameter
- Relevance: Proves node-based composition viable on mobile browsers

**Loopy Pro (iOS Music App):**
- [Canvas editor](https://wiki.loopypro.com/Introduction_to_Loopy_Pro) with pads, knobs, faders mapped to controls
- [Parameter automation](https://synthanatomy.com/2025/07/loopy-pro-2-0-levels-up-the-creative-audio-looper-app-with-midi-looping-and-more.html) includes MIDI parameter automation for audio/MIDI loops
- Touch actions: Press, press/release, swipe for parameter control
- Relevance: Shows touch-friendly parameter routing UX patterns

**REAKTOR Blocks:**
- [Universal connectivity](https://www.native-instruments.com/fileadmin/ni_media/downloads/manuals/REAKTOR_Blocks_Manual_English_2016_06.pdf) allows any block connection with predictable results
- Modular routing permits outputs → AudioParams of different nodes
- Relevance: Validates many-to-many routing architecture

**React Flow Examples:**
- [Touch Device Example](https://reactflow.dev/examples/interaction/touch-device) demonstrates mobile gestures
- [Node-Based UIs](https://reactflow.dev) showcase production apps (workflow builders, visualizers)
- Relevance: Official examples confirm mobile viability

**Key Patterns Extracted:**
1. **Bottom sheet for node details** (Cables.gl, Loopy Pro)
2. **Color-coded parameters** (REAKTOR: audio = yellow, control = blue)
3. **Animated edge creation** (Cables.gl: smooth connection animation)
4. **Touch gesture hierarchy** (Loopy Pro: press vs. swipe vs. hold for different actions)

**Recommendation:**
- Study Cables.gl for canvas UX (zoom, pan, node arrangement)
- Study Loopy Pro for parameter control UX (sliders, dropdowns, touch feedback)
- Do not replicate REAKTOR's visual complexity (too dense for 6" phone screen)

**Confidence:** MEDIUM-HIGH (reference apps exist, but direct mobile parameter routing examples sparse)

---

## Trade-offs & Decisions

| Decision | Option A | Option B | Recommendation |
|----------|----------|----------|----------------|
| **Routing UI** | Dropdown selector (tap node → select target) | Visual tap-to-connect (tap handle → tap handle) | **Dropdown for Phase 5**. Higher discoverability for first-time users. Defer visual tap-to-connect to v1.2 after user feedback. |
| **Parameter type matching** | Strict (number → number only) | Permissive (number → string via toString) | **Strict for Phase 5**. Prevents confusing routes. Add permissive mode in Phase 6 with explicit "Convert" checkbox. |
| **Range normalization** | Automatic (0-360 → 0-1 scales proportionally) | Manual (user adds transform function) | **Manual for Phase 5**. Automatic normalization requires knowing parameter semantics (is 200 hue "middle" or "high"?). Defer to Phase 6 after live preview validates. |
| **Circular routing** | Allow (trust user) | Prevent (acyclic graph only) | **Allow for Phase 5**. Circular routes may be intentional. Warn during Phase 6 preview if audio feedback detected. |
| **Composition storage** | IndexedDB (local-first) | Cloud-first (Firebase/Supabase) | **IndexedDB for Phase 5**. Aligns with offline-first architecture. Sync to cloud in Phase 6 as enhancement, not requirement. |
| **Conflict resolution** | Last-write-wins (timestamp) | User choice (always prompt) | **Last-write-wins for Phase 6**. Only prompt if timestamps <60s apart (true conflict). Most edits hours apart don't need UI interruption. |
| **Bundle size** | Include full React Flow (600KB) | Tree-shake via named imports (~100KB) | **Tree-shake**. Use `import { ReactFlow, Node } from 'reactflow'` instead of default import. Keeps mobile bundle <1.2MB. |
| **Node limit** | 5 atoms max (Phase 5) | 10 atoms max (Phase 5) | **5 atoms max**. Conservative for mid-range phones. Increase to 10 in v1.2 after performance validation. |

**Key Trade-off:**
Dropdown routing UI (Phase 5) vs. visual tap-to-connect (v1.2):
- **Dropdown pros:** Higher discoverability, works well on 6" screens, accessible (no precise tap required)
- **Dropdown cons:** More taps (3-4 vs. 2), less visual feedback during creation
- **Decision:** Dropdown for Phase 5, revisit in v1.2 based on user testing (if users request faster routing, add tap-to-connect as power-user feature)

---

## Open Questions

- **Q1:** React Flow performance on Pixel 6a-class devices (mid-range 2023 phone) with 5 custom nodes + 10 edges?
  - **Action:** Benchmark in Phase 5.2 implementation using Chrome DevTools remote debugging
  - **Fallback:** If >500ms render, enable `onlyRenderVisibleElements` prop and reduce node count to 3

- **Q2:** How to handle parameter routing when source atom deleted from library?
  - **Action:** During composition load, check if atomSlug exists in atoms store. If missing, show placeholder node "Atom missing: {slug}" with "Remove from composition" button. Do not break composition.
  - **Confidence:** HIGH (graceful degradation pattern)

- **Q3:** Should parameter overrides at composition level persist back to atom config.json?
  - **Action:** No. Composition-level tweaks stay in composition data. If user wants permanent change, they edit atom directly on desktop (Phase 1-3 workflow unchanged).
  - **Confidence:** HIGH (separation of concerns: composition is ephemeral experiment, atom is canonical)

- **Q4:** Can users rename parameters in composition (alias for clarity)?
  - **Action:** Defer to v1.2. Phase 5 shows raw config.json keys. If users request aliases (e.g., "bgHue" → "Background Color"), add in v1.2 with stored mapping in composition data.
  - **Confidence:** MEDIUM (nice-to-have, not blocking)

- **Q5:** How to visualize multi-hop routing chains (A → B → C) without overwhelming UI?
  - **Action:** Phase 5 shows edges individually (each edge A→B, B→C visible). Phase 6 adds "Show routing paths" toggle that highlights full chain A→B→C in single color. Defer to Phase 6 when live preview validates need.
  - **Confidence:** MEDIUM (visualization challenge, but not blocking for Phase 5 dropdown UI)

---

## Confidence Levels

| Topic | Confidence | Why |
|-------|------------|-----|
| React Flow performance | MEDIUM-HIGH | Extensive docs exist, touch examples proven, but no published benchmarks for 5-node mobile compositions on mid-range devices |
| Composition data model | HIGH | Similar to Cables.gl/Reaktor patterns, IndexedDB well-documented, graph storage straightforward |
| Parameter routing logic | MEDIUM | Type inference trivial for primitives, but edge cases (hue vs. generic number, boolean vs. toggle) need user testing |
| Touch UI patterns | HIGH | Material Design bottom sheets, React Flow touch examples, Loopy Pro/Cables.gl reference apps validate approach |
| Offline persistence | HIGH | IndexedDB patterns standard, Phase 4 already implements atoms/voiceNotes/screenshots stores, composition is similar |
| Performance targets | MEDIUM | Targets realistic based on React Flow docs, but device-specific validation needed (Pixel 6a simulator in Phase 5.2) |
| Conflict resolution | MEDIUM-HIGH | Last-write-wins well-documented in PWA sync literature, but user testing needed to validate 60s threshold |

**Overall Confidence:** MEDIUM-HIGH

Research sufficiently detailed for planning. Primary unknowns (React Flow mobile performance, parameter routing UX) can be addressed during implementation via benchmarking and user testing.

---

## Next Steps for Planning

**Planner should focus on:**

1. **Phase 5.1: React Flow Integration**
   - Install `reactflow` package via npm
   - Create `/mobile/compose` page with basic React Flow canvas
   - Implement custom atom node component (render atom thumbnail + params as handles)
   - Measure baseline performance (empty canvas → 1 node → 5 nodes)
   - Set up bundle size monitoring (target: <1.2MB total mobile bundle)

2. **Phase 5.2: Add Atom to Canvas**
   - Implement "+" FAB button (bottom-right, 64px, Material Design)
   - Create atom selection bottom sheet (search/filter atoms, tap to add)
   - Add atom to canvas at center position
   - Store composition in IndexedDB (extend `db.ts` with compositions store)
   - Implement composition list page (/mobile/compositions)

3. **Phase 5.3: Parameter Routing UI (Dropdown)**
   - Tap node → Bottom sheet with "Output Parameters" and "Input Parameters"
   - Tap "+ Route" on output param → Dropdown of compatible targets (type-filtered)
   - Select target → Create edge on canvas
   - Store route in composition.routes array
   - Tap edge → Show delete/edit options

4. **Phase 5.4: Composition Persistence**
   - Save composition on every change (debounced 500ms)
   - Load composition from IndexedDB on canvas mount
   - Implement undo/redo (20-state circular buffer)
   - Add composition rename/delete actions
   - Extend offline indicator to show "X compositions not synced" (Phase 6 prep)

5. **Phase 5.5: Touch Optimization**
   - Configure React Flow for mobile (panOnDrag, zoomOnPinch, disable scroll conflicts)
   - Increase touch target sizes (node handles 48px, edge tap radius 24px)
   - Add CSS fix for iOS grey rectangles (`-webkit-tap-highlight-color: transparent`)
   - Test on real device (or Pixel 6a simulator) for gesture responsiveness

**Defer to Phase 6:**
- Live preview (apply routes to running atoms)
- Range normalization transforms
- Circular routing detection/warnings
- Cloud sync and conflict resolution
- Advanced parameter aliasing

**Success Criteria for Phase 5 Planning:**
- [ ] All artifacts identified (React Flow components, IndexedDB schema, UI layouts)
- [ ] Performance benchmarks defined (render time, memory usage, bundle size)
- [ ] Touch interaction flows documented (add atom, route params, undo/redo)
- [ ] Offline persistence strategy clear (composition JSON structure, storage quotas)
- [ ] Phase 6 integration points identified (sync flags, conflict resolution hooks)

---

## References

### Primary (HIGH confidence)

**React Flow:**
- [React Flow Performance Documentation](https://reactflow.dev/learn/advanced-use/performance) - Re-render optimization
- [React Flow Touch Device Example](https://reactflow.dev/examples/interaction/touch-device) - Mobile gesture support
- [React Flow Node-Based UIs](https://reactflow.dev) - Official site and examples
- [React Flow on npm](https://www.npmjs.com/package/reactflow) - Package details
- [xyflow GitHub Repository](https://github.com/xyflow/xyflow) - Source code and issues

**IndexedDB & PWA Sync:**
- [IndexedDB Max Storage Limit Best Practices](https://rxdb.info/articles/indexeddb-max-storage-limit.html) - Storage quotas
- [Using IndexedDB API with JS in 2026](https://potentpages.com/web-design/javascript/indexeddb-api-with-javascript) - Modern patterns
- [Offline-first Frontend Apps 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) - Sync and conflict resolution
- [PWA Service Worker Background Sync](https://www.infoworld.com/article/2515213/progressive-web-app-essentials-service-worker-background-sync.html) - Background sync patterns

**Bundle Optimization:**
- [Optimize React Bundle Size with Tree Shaking (2026)](https://oneuptime.com/blog/post/2026-01-15-optimize-react-bundle-size-tree-shaking/view) - Tree-shaking techniques
- [Reducing JavaScript Bundle Size in React](https://medium.com/@abhi.venkata54/reducing-javascript-bundle-size-in-react-techniques-for-faster-load-times-703e70cb19de) - Performance optimization
- [Achieving 3x Reduction in React Bundle Size](https://agustinmaggi.com/achieving-3x-reduction-in-react-bundle-size) - Case study

### Secondary (MEDIUM confidence)

**Reference Implementations:**
- [Cables.gl](https://cables.gl/) - Visual programming platform
- [Cables.gl Image Composition Docs](https://cables.gl/docs/2_intermediate/image_composition/image_composition) - Canvas editor patterns
- [Cables.gl iOS Touch Fix](https://cables.gl/docs/faq/embedding/mobile_grey_rects/grey_rectangles_on_ios) - Mobile CSS fixes
- [Loopy Pro Introduction](https://wiki.loopypro.com/Introduction_to_Loopy_Pro) - Mobile music app UX
- [Loopy Pro 2.0 Announcement](https://synthanatomy.com/2025/07/loopy-pro-2-0-levels-up-the-creative-audio-looper-app-with-midi-looping-and-more.html) - Parameter automation
- [REAKTOR Blocks Manual](https://www.native-instruments.com/fileadmin/ni_media/downloads/manuals/REAKTOR_Blocks_Manual_English_2016_06.pdf) - Modular routing architecture

**Web Audio API:**
- [Web Audio API Performance and Debugging](https://padenot.github.io/web-audio-perf/) - Performance notes
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Official docs
- [MDN Using Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API) - Tutorials

**Parameter Inference (Research Context):**
- [DiffMoog: Differentiable Modular Synthesizer](https://arxiv.org/html/2401.12570v1) - Parameter matching
- [Syntheon: Parameter Inference for Synthesizers](https://github.com/gudgud96/syntheon) - Deep learning approach
- [Strategies of Mapping Between Gesture and Synthesis](https://web.media.mit.edu/~rebklein/downloads/papers/Organised%20Sounds%20V7-n2/04-%20Strategies%20of%20mapping%20between%20gesture%20data%20and%20synthesis%20model%20parameters%20using%20perceptual%20spaces.pdf) - MIT research

### Tertiary (LOW confidence - marked for validation)

**Graph Storage:**
- [LevelGraph GitHub](https://github.com/levelgraph/levelgraph) - Graph database on IndexedDB
- [Graph Database Goodness with LevelGraph](https://www.cloudbees.com/blog/graph-database-goodness-with-levelgraph) - Tutorial
- Note: LevelGraph may be overkill for simple composition graph (direct IndexedDB sufficient)

**Mobile App Comparisons:**
- Various WebSearch results on React Native vs. Flutter (not directly applicable to PWA, included for performance context)

---

## Metadata

**Confidence breakdown:**
- React Flow mobile viability: HIGH - Official docs, touch examples, community validation
- Composition data model: HIGH - Similar to Cables.gl, IndexedDB patterns standard
- Parameter routing logic: MEDIUM - Type inference trivial, but edge cases need user testing
- Touch UI patterns: HIGH - Material Design bottom sheets, reference apps exist
- Offline persistence: HIGH - IndexedDB well-documented, Phase 4 already implements
- Performance targets: MEDIUM - Realistic based on docs, but device validation needed
- Conflict resolution: MEDIUM-HIGH - Last-write-wins standard, 60s threshold needs testing

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - React Flow and PWA patterns stable)

**Key unknowns requiring validation:**
1. React Flow render performance on Pixel 6a-class devices (5 nodes + 10 edges)
2. Touch interaction quality (tap target sizes, gesture conflicts)
3. Parameter routing UX discoverability (dropdown vs. visual tap-to-connect)
4. Bundle size impact after React Flow integration (target <1.2MB total)

**Validation plan:**
- Phase 5.1: Benchmark empty canvas → 1 node → 5 nodes (Chrome DevTools Performance)
- Phase 5.2: User testing with 3-5 users (can they discover routing UI without docs?)
- Phase 5.3: Bundle size monitoring (webpack-bundle-analyzer or Vite's rollup visualizer)
- Phase 5.5: Real device testing (iOS Safari + Android Chrome on mid-range phones)

---

**Research complete. Ready for Phase 5 planning.**
