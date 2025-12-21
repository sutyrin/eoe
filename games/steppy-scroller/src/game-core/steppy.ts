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

// Generate a row if it doesn't exist
export const getRow = (state: GameState, y: number): number[] => {
  if (state.map[y]) {
    return state.map[y];
  }
  
  // Deterministic generation based on Y and initial seed
  const row: number[] = [];
  const rowSeed = state.seed + y * 100;
  
  for (let x = 0; x < STEPPY_COLUMNS; x++) {
    // 15% chance of block, but ensure start (y=0) is empty
    const isBlock = y > 2 && random(rowSeed + x) < 0.15;
    row.push(isBlock ? CELL_BLOCK : CELL_EMPTY);
  }
  
  return row;
};

// Check if a specific cell is walkable
const isWalkable = (state: GameState, x: number, y: number): boolean => {
  // Out of bounds (sides)
  if (x < 0 || x >= STEPPY_COLUMNS) return false;
  
  // For now, y < 0 is not allowed
  if (y < 0) return false;

  // Get (or generate) row data. 
  // Note: This function doesn't mutate state, it just calculates what *would* be there.
  // In a real implementation we might want to cache this generation, 
  // but for purity in `isWalkable` we re-calculate if missing.
  // However, `computeActions` shouldn't mutate state. 
  // So we replicate generation logic here locally or rely on `getRow` return.
  
  // To avoid mutation issues in "check" functions, we need a way to peek.
  // Since `getRow` above returns the array but doesn't *save* it to state unless we assign it,
  // we need to be careful. 
  // For this version: "Generation on read" is okay if deterministic.
  
  // Re-implement generation logic for "Peek" to avoid state mutation side-effects in getters?
  // Or just accept that `getRow` is a generator.
  
  // Let's use the determinstic property:
  // If it's in the map, use it. If not, generate it temporarily.
  let row = state.map[y];
  if (!row) {
      const rowSeed = state.seed + y * 100;
      row = [];
      for (let cx = 0; cx < STEPPY_COLUMNS; cx++) {
        const isBlock = y > 2 && random(rowSeed + cx) < 0.15;
        row.push(isBlock ? CELL_BLOCK : CELL_EMPTY);
      }
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