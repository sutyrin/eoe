# Steppy Scroller: Infinite Garden & Branching Paths

## Vision
**"Infinite Garden"** transforms Steppy Scroller from a finite grid puzzle into an endless, relaxing, procedural climber. The player controls a character (or a growing tip of a plant) ascending through an infinite lattice of vines, leaves, and flowers.

## Core Concepts

### 1. The Garden (World)
- **Infinite Verticality:** There is no "end" (y=9). The goal is to grow as high as possible.
- **Branching Paths:** The path isn't an open field. It is constrained by the structure of the "Plant".
    - At certain points, the path splits (Fork).
    - Some paths might dead-end (Withered branches) or loop back.
    - **Initial Implementation:** A wide scrolling lane where obstacles form "branches" by blocking movement.
    - **Advanced Implementation:** A true Graph structure where you navigate from Node to Node.

### 2. The Step (Mechanic)
- **Rhythm & Growth:** Each step `Up` generates new content above and moves the viewport.
- **Lateral Movement:** Moving `Left` or `Right` changes the "Lane" or "Branch" you are currently traversing.
- **Resource/Energy:** (Optional for later) Steps might cost water/sunlight, replenished by collecting items.

### 3. Aesthetics
- **Theme:** Organic, botanical, pixel-art or vector minimal.
- **Colors:** Deep greens, bright blooms, earthy browns.
- **Feedback:** Smooth camera follow, "growing" animation when stepping.

---

## Technical Architecture & Roadmap

### Phase 1: The Endless Vine (Current Priority)
**Goal:** Remove the vertical limit and implement basic procedural generation (PCG).
- **Refactor `GameState`:**
    - Remove fixed `STEPPY_ROWS`.
    - Introduce `depth` (score).
    - Introduce `terrain`: A Map or Array representing the generated rows ahead.
- **PCG Engine:**
    - A simple function `generateRow(depth)` that returns a row configuration (open/blocked cells).
    - State management must handle "windowing" (keeping only relevant rows in memory).

### Phase 2: Branching Topology
**Goal:** Make choices matter.
- Introduce "Hard Blocks" that force a commitment to a left or right path.
- Visual distinction between "Lanes".

### Phase 3: Garden Aesthetics
**Goal:** Replace placeholders with Garden assets.
- SVG/Canvas rendering of Vines instead of Grid Cells.
- "Flower" items for points.

---

## Execution Plan: Phase 1 (The Endless Vine)

### Step 1.1: Refactor Logic (`steppy.ts`)
- [ ] Modify `GameState`:
    - Add `map: Record<number, RowData>` (sparse map or windowed array).
    - Add `score/depth`.
    - Remove `status: 'ended'` (game over only on trap/stuck, not on win).
- [ ] Implement `getTile(x, y)`:
    - If row `y` doesn't exist in `map`, generate it deterministically (seeded) or procedurally.

### Step 1.2: Visualization Update (`main.ts` / `steppy-renderer`)
- [ ] Update rendering loop to draw relative to `player.y`.
- [ ] Camera system: keep player centered vertically.

### Step 1.3: Verification
- [ ] Update Tests: `smoke.spec.ts` to handle infinite loop possibility (don't wait for 'ended').
- [ ] New Test: `infinite.spec.ts` verifying generation of new rows.

## Next Steps for AI Agent
1.  **Refactor `steppy.ts`** to support infinite rows.
2.  **Implement Basic PCG** (randomly blocked tiles).
3.  **Update Rendering** to scroll with the player.
4.  **Verify** with screenshots and tests.
