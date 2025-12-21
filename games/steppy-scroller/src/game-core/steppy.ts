export const STEPPY_VERSION = '0.2-garden';
export const STEPPY_COLUMNS = 5;

// Cell Types
export const CELL_EMPTY = 0;
export const CELL_BLOCK = 1;

export type Action = {
  id: string;
  label: string;
  enabled: boolean;
};

export type PlayerState = {
  x: number;
  y: number;
};

export type GameState = {
  version: string;
  status: 'ready' | 'running' | 'ended';
  tick: number;
  player: PlayerState;
  // Map stores row data. Key is Y coordinate.
  // We use a Record for infinite verticality.
  map: Record<string, number[]>; 
  seed: number;
};

// Simple pseudo-random using seed
const random = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Pure function to generate a row's data based on seed and Y
// This ensures consistency without side effects
const generateRowData = (seed: number, y: number): number[] => {
  const row: number[] = [];
  const rowSeed = seed + y * 100;

  // Feature: Vertical Vines
  // A vine is a vertical column of blocks.
  // We determine if a column C has a vine at row Y based on a slower varying noise.
  
  for (let x = 0; x < STEPPY_COLUMNS; x++) {
    let isBlock = false;

    // Safety Zone at start
    if (y > 3) {
      // 1. Scattered Noise (Thorns)
      // 10% chance of a random block
      const noise = random(rowSeed + x);
      if (noise < 0.1) {
        isBlock = true;
      }

      // 2. Structural Vines (Branching Paths)
      // We want vines to last for a segment (e.g. 10-20 rows).
      // We check a "segment index" for this column.
      const segmentHeight = 20;
      const segmentIndex = Math.floor(y / segmentHeight);
      // Unique seed for this column's segment
      const segmentSeed = seed + x * 500 + segmentIndex * 1000; 
      
      // 30% chance this segment of this column is a Vine
      if (random(segmentSeed) < 0.3) {
          // It's a vine segment!
          // But maybe we have gaps? No, solid vine is better for structure.
          isBlock = true;
      }
    }
    
    // Safety check: Don't block ALL columns.
    // This simple local logic doesn't guarantee a path, but with 5 cols and 0.3 density + 0.1 noise,
    // full blockage is rare but possible.
    // Enhancing safety: Ensure Column 2 (Middle) is safer? 
    // Or just accept dead ends for now (part of the game).
    
    row.push(isBlock ? CELL_BLOCK : CELL_EMPTY);
  }
  
  // Emergency Pass: If row is full, clear a random spot (deterministic)
  if (row.every(c => c === CELL_BLOCK)) {
     const safeCol = Math.floor(random(rowSeed) * STEPPY_COLUMNS);
     row[safeCol] = CELL_EMPTY;
  }

  return row;
};

// Generate a row if it doesn't exist
export const getRow = (state: GameState, y: number): number[] => {
  if (state.map[y]) {
    return state.map[y];
  }
  return generateRowData(state.seed, y);
};

// Check if a specific cell is walkable
const isWalkable = (state: GameState, x: number, y: number): boolean => {
  // Out of bounds (sides)
  if (x < 0 || x >= STEPPY_COLUMNS) return false;
  
  // For now, y < 0 is not allowed
  if (y < 0) return false;

  // Get (or generate) row data using the same pure logic
  let row = state.map[y];
  if (!row) {
      row = generateRowData(state.seed, y);
  }
  
  return row[x] !== CELL_BLOCK;
};

export const createInitialState = (): GameState => ({
  version: STEPPY_VERSION,
  status: 'running',
  tick: 0,
  player: { x: Math.floor(STEPPY_COLUMNS / 2), y: 0 },
  map: {},
  seed: Date.now(),
});

export const computeActions = (state: GameState): Action[] => {
  if (state.status !== 'running') {
    return [];
  }
  
  const { x, y } = state.player;
  
  return [
    { id: 'step-left', label: '←', enabled: isWalkable(state, x - 1, y) },
    // Step Up checks y + 1
    { id: 'step-up', label: '↑', enabled: isWalkable(state, x, y + 1) },
    { id: 'step-right', label: '→', enabled: isWalkable(state, x + 1, y) },
    // Optional: Step Down? For now, let's keep it upward only or allow down for backtracking.
    // Let's allow Down for "Exploration" feel.
    { id: 'step-down', label: '↓', enabled: isWalkable(state, x, y - 1) },
  ];
};

export const applyAction = (state: GameState, actionId: string): GameState => {
  if (state.status !== 'running') {
    return state;
  }
  
  // Deep clone or just spread logic
  const next: GameState = {
    ...state,
    player: { ...state.player },
    map: { ...state.map } // Shallow copy of map container
  };

  let targetX = next.player.x;
  let targetY = next.player.y;

  if (actionId === 'step-left') targetX -= 1;
  if (actionId === 'step-right') targetX += 1;
  if (actionId === 'step-up') targetY += 1;
  if (actionId === 'step-down') targetY -= 1;

  if (isWalkable(next, targetX, targetY)) {
      next.player.x = targetX;
      next.player.y = targetY;
      
      // Ensure the row we moved to is persisted in the map
      if (!next.map[targetY]) {
          // Generate and save
          next.map[targetY] = getRow(next, targetY);
      }
  }

  next.tick += 1;
  
  return next;
};