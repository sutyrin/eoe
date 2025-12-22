export const STEPPY_VERSION = '0.5-step1-stamina';
export const STEPPY_COLUMNS = 5;
const SAFE_ROWS = 2;

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
  altitude: number;
  map: Record<string, number[]>; 
  seed: number;
  stamina: number;
  maxStamina: number;
};

export type Evaluation = {
  target: string;
  resources: {
    stamina: number;
    height: number;
  };
  threats: { x: number, y: number }[];
  optimalChoice: string | null;
  choices: { id: string, label: string, safety: 'safe' | 'risky' | 'dead-end' }[];
};

const randomFloat = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const getPathX = (seed: number, y: number) => {
  let pathX = Math.floor(STEPPY_COLUMNS / 2);
  for (let step = 1; step <= y; step += 1) {
    const roll = randomFloat(seed + step * 7919);
    if (roll < 0.33) {
      pathX -= 1;
    } else if (roll > 0.66) {
      pathX += 1;
    }
    if (pathX < 0) pathX = 0;
    if (pathX >= STEPPY_COLUMNS) pathX = STEPPY_COLUMNS - 1;
  }
  return pathX;
};

const ensureMoveOptions = (seed: number, y: number, row: number[]) => {
  if (row.length < 2) {
    return;
  }

  if (row[0] === CELL_BLOCK && row[1] === CELL_BLOCK) {
    const pickRight = randomFloat(seed + y * 271 + 3) > 0.5;
    row[pickRight ? 1 : 0] = CELL_EMPTY;
  }

  const last = row.length - 1;
  if (row[last] === CELL_BLOCK && row[last - 1] === CELL_BLOCK) {
    const pickLeft = randomFloat(seed + y * 271 + 7) > 0.5;
    row[pickLeft ? last - 1 : last] = CELL_EMPTY;
  }

  for (let x = 1; x < row.length - 1; x += 1) {
    if (row[x - 1] === CELL_BLOCK && row[x] === CELL_BLOCK && row[x + 1] === CELL_BLOCK) {
      row[x] = CELL_EMPTY;
    }
  }
};

// Pure function to generate a row's data based on seed and Y
const generateRowData = (seed: number, y: number): number[] => {
  if (y <= SAFE_ROWS) {
    return Array.from({ length: STEPPY_COLUMNS }, () => CELL_EMPTY);
  }

  const row: number[] = Array.from({ length: STEPPY_COLUMNS }, () => CELL_EMPTY);
  const pathX = getPathX(seed, y);

  for (let x = 0; x < STEPPY_COLUMNS; x += 1) {
    if (x === pathX) {
      continue;
    }
    const roll = randomFloat(seed + y * 1337 + x * 97);
    if (roll < 0.35) {
      row[x] = CELL_BLOCK;
    }
  }

  ensureMoveOptions(seed, y, row);
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

export const createInitialState = (): GameState => ({
  version: STEPPY_VERSION,
  status: 'running',
  tick: 0,
  player: { x: Math.floor(STEPPY_COLUMNS / 2), y: 0 },
  altitude: 0,
  map: {},
  seed: Date.now(),
  stamina: 12,
  maxStamina: 12
});

export const computeActions = (state: GameState): Action[] => {
  if (state.status === 'ended') {
    return [{ id: 'restart', label: 'Restart', enabled: true }];
  }
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
  if (actionId === 'restart') {
    return createInitialState();
  }
  if (state.status !== 'running') {
    return state;
  }
  
  const next: GameState = {
    ...state,
    player: { ...state.player },
    map: { ...state.map } 
  };

  let targetX = next.player.x;
  let targetY = next.player.y + 1; // Always move up

  if (actionId === 'step-left') targetX -= 1;
  if (actionId === 'step-right') targetX += 1;
  // step-up just keeps x same

  if (isWalkable(next, targetX, targetY)) {
    next.player.x = targetX;
    next.player.y = targetY;
    next.altitude += 1;

    // Cost of movement
    if (next.stamina > 0) {
      next.stamina -= 1;
    }

    // Persist row
    if (!next.map[targetY]) {
      next.map[targetY] = getRow(next, targetY);
    }
  } else {
    next.status = 'ended';
  }

  next.tick += 1;
  
  if (next.stamina <= 0) {
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
    
    if (!optimalChoice) {
      // Prefer straight up if safe, then diagonals
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
            stamina: state.stamina,
            height: state.altitude
        },
        threats,
        optimalChoice,
        choices
    };
};
