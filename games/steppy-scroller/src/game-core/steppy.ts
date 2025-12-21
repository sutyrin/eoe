export const STEPPY_VERSION = '0.4-diagonal';
export const STEPPY_COLUMNS = 5;

// Cell Types
export const CELL_EMPTY = 0;
export const CELL_BLOCK = 1;
export const CELL_WATER = 2;

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
  map: Record<string, number[]>; 
  seed: number;
  water: number;
  maxWater: number;
  score: number;
};

export type Evaluation = {
  target: string;
  resources: {
    water: number;
    height: number;
  };
  threats: { x: number, y: number }[];
  optimalChoice: string | null;
  choices: { id: string, label: string, safety: 'safe' | 'risky' | 'dead-end' }[];
};

// Simple pseudo-random using seed
const random = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Pure function to generate a row's data based on seed and Y
const generateRowData = (seed: number, y: number): number[] => {
  const row: number[] = [];
  const rowSeed = seed + y * 100;
  
  for (let x = 0; x < STEPPY_COLUMNS; x++) {
    let cellType = CELL_EMPTY;

    // Safety Zone at start
    if (y > 3) {
      // 1. Scattered Noise (Thorns)
      const noise = random(rowSeed + x);
      if (noise < 0.1) {
        cellType = CELL_BLOCK;
      }

      // 2. Structural Vines (Branching Paths)
      const segmentHeight = 20;
      const segmentIndex = Math.floor(y / segmentHeight);
      const segmentSeed = seed + x * 500 + segmentIndex * 1000; 
      
      if (random(segmentSeed) < 0.3) {
          cellType = CELL_BLOCK;
      }
      
      // 3. Dew Drops (Water)
      // If it's empty so far, small chance for water
      if (cellType === CELL_EMPTY) {
          if (random(rowSeed + x + 999) < 0.05) {
              cellType = CELL_WATER;
          }
      }
    }
    
    row.push(cellType);
  }
  
  // Emergency Pass: If row is full of blocks, clear a random spot
  if (row.every(c => c === CELL_BLOCK)) {
     const safeCol = Math.floor(random(rowSeed) * STEPPY_COLUMNS);
     (row as number[])[safeCol] = CELL_EMPTY;
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

// Check if a specific cell is walkable (not a block)
const isWalkable = (state: GameState, x: number, y: number): boolean => {
  if (x < 0 || x >= STEPPY_COLUMNS) return false;
  if (y < 0) return false;

  let row = state.map[y];
  if (!row) {
      row = generateRowData(state.seed, y);
  }
  
  return row[x] !== CELL_BLOCK;
};

const getCellType = (state: GameState, x: number, y: number): number => {
    if (x < 0 || x >= STEPPY_COLUMNS) return CELL_BLOCK;
    if (y < 0) return CELL_BLOCK;
    let row = state.map[y];
    if (!row) {
        row = generateRowData(state.seed, y);
    }
    return row[x];
}

export const createInitialState = (): GameState => ({
  version: STEPPY_VERSION,
  status: 'running',
  tick: 0,
  player: { x: Math.floor(STEPPY_COLUMNS / 2), y: 0 },
  map: {},
  seed: Date.now(),
  water: 20,
  maxWater: 25,
  score: 0
});

export const computeActions = (state: GameState): Action[] => {
  if (state.status !== 'running') {
    return [];
  }
  
  const { x, y } = state.player;
  
  // Diagonal Movement Logic: All steps move Y+1
  return [
    { id: 'step-left', label: '↖', enabled: isWalkable(state, x - 1, y + 1) },
    { id: 'step-up', label: '↑', enabled: isWalkable(state, x, y + 1) },
    { id: 'step-right', label: '↗', enabled: isWalkable(state, x + 1, y + 1) },
  ];
};

export const applyAction = (state: GameState, actionId: string): GameState => {
  if (state.status !== 'running') {
    return state;
  }
  
  const next: GameState = {
    ...state,
    player: { ...state.player },
    map: { ...state.map } 
  };

  // Cost of movement
  if (next.water > 0) {
      next.water -= 1;
  } else {
      next.status = 'ended';
      return next;
  }

  let targetX = next.player.x;
  let targetY = next.player.y + 1; // Always move up

  if (actionId === 'step-left') targetX -= 1;
  if (actionId === 'step-right') targetX += 1;
  // step-up just keeps x same

  if (isWalkable(next, targetX, targetY)) {
      next.player.x = targetX;
      next.player.y = targetY;
      
      // Persist row
      if (!next.map[targetY]) {
          next.map[targetY] = getRow(next, targetY);
      }
      
      // Check for collection
      const cell = next.map[targetY][targetX];
      if (cell === CELL_WATER) {
          next.water = Math.min(next.maxWater, next.water + 5);
          const newRow = [...next.map[targetY]];
          newRow[targetX] = CELL_EMPTY;
          next.map[targetY] = newRow;
          next.score += 5;
      }
      
      next.score += 1;
  }

  next.tick += 1;
  
  if (next.water <= 0) {
      next.status = 'ended';
  }

  return next;
};

// Evaluation Logic
export const evaluateState = (state: GameState): Evaluation => {
    const { x, y } = state.player;
    
    // 1. Identify Threats (Blocks ahead)
    const threats: { x: number, y: number }[] = [];
    [ [x-1, y+1], [x, y+1], [x+1, y+1] ].forEach(([tx, ty]) => {
        if (!isWalkable(state, tx, ty)) {
            threats.push({ x: tx, y: ty });
        }
    });

    // 2. Determine Optimal Choice
    let optimalChoice: string | null = null;
    let target = "Climb Up";
    
    const upSafe = isWalkable(state, x, y + 1);
    const leftSafe = isWalkable(state, x - 1, y + 1);
    const rightSafe = isWalkable(state, x + 1, y + 1);
    
    // Greedy Water
    if (state.water < 8) {
        target = "Find Water";
        if (getCellType(state, x, y+1) === CELL_WATER) optimalChoice = 'step-up';
        else if (getCellType(state, x-1, y+1) === CELL_WATER) optimalChoice = 'step-left';
        else if (getCellType(state, x+1, y+1) === CELL_WATER) optimalChoice = 'step-right';
    }
    
    if (!optimalChoice) {
        // Prefer straight up if safe, then diagonals
        // But diagonals are just as good now!
        // Look 2 steps ahead?
        // Simple: Pick safe
        if (upSafe) optimalChoice = 'step-up';
        else if (leftSafe) optimalChoice = 'step-left';
        else if (rightSafe) optimalChoice = 'step-right';
    }
    
    // 3. Annotate Choices
    const choices = [
        { id: 'step-left', label: '↖', enabled: leftSafe },
        { id: 'step-up', label: '↑', enabled: upSafe },
        { id: 'step-right', label: '↗', enabled: rightSafe },
    ].filter(c => c.enabled).map(c => ({
        ...c,
        safety: 'safe' as const
    }));

    return {
        target,
        resources: {
            water: state.water,
            height: y
        },
        threats,
        optimalChoice,
        choices
    };
};