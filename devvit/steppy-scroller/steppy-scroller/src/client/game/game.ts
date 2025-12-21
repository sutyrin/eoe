import Phaser from 'phaser';

const COLUMNS = 5;
const ROWS = 9;
const CELL_SIZE = 56;

type Action = {
  id: string;
  label: string;
  enabled: boolean;
};

type GameState = {
  version: string;
  status: 'ready' | 'running' | 'ended';
  tick: number;
  player: {
    x: number;
    y: number;
  };
};

const computeActions = (state: GameState): Action[] => {
  if (state.status !== 'running') {
    return [];
  }
  return [
    { id: 'step-left', label: '←', enabled: state.player.x > 0 },
    { id: 'step-up', label: '↑', enabled: state.player.y < ROWS - 1 },
    { id: 'step-right', label: '→', enabled: state.player.x < COLUMNS - 1 },
  ];
};

const applyAction = (state: GameState, actionId: string): GameState => {
  if (state.status !== 'running') {
    return state;
  }
  const next: GameState = {
    ...state,
    player: { ...state.player },
  };

  if (actionId === 'step-left' && next.player.x > 0) {
    next.player.x -= 1;
  }
  if (actionId === 'step-right' && next.player.x < COLUMNS - 1) {
    next.player.x += 1;
  }
  if (actionId === 'step-up' && next.player.y < ROWS - 1) {
    next.player.y += 1;
  }
  next.tick += 1;
  if (next.player.y >= ROWS - 1) {
    next.status = 'ended';
  }
  return next;
};

class SteppyScene extends Phaser.Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private state: GameState;

  constructor(initialState: GameState) {
    super('steppy');
    this.state = initialState;
  }

  create() {
    this.graphics = this.add.graphics();
    this.redraw();
  }

  updateState(state: GameState) {
    this.state = state;
    this.redraw();
  }

  private redraw() {
    if (!this.graphics) {
      return;
    }
    this.graphics.clear();

    const width = COLUMNS * CELL_SIZE;
    const height = ROWS * CELL_SIZE;

    this.graphics.fillStyle(0xe6f0dc, 0.8);
    this.graphics.fillRect(0, 0, width, height);

    this.graphics.lineStyle(2, 0x9eb28f, 0.8);
    for (let col = 0; col <= COLUMNS; col += 1) {
      const x = col * CELL_SIZE;
      this.graphics.lineBetween(x, 0, x, height);
    }
    for (let row = 0; row <= ROWS; row += 1) {
      const y = row * CELL_SIZE;
      this.graphics.lineBetween(0, y, width, y);
    }

    const { x, y } = this.state.player;
    const padding = 10;
    this.graphics.fillStyle(0x2e5c3a, 1);
    this.graphics.fillRoundedRect(
      x * CELL_SIZE + padding,
      height - (y + 1) * CELL_SIZE + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2,
      8,
    );
  }
}

const shell = document.querySelector<HTMLDivElement>('.shell');
const controlsEl = document.querySelector<HTMLDivElement>('#controls');

const renderControls = (state: GameState) => {
  if (!controlsEl) {
    return;
  }
  const actions = computeActions(state);
  controlsEl.innerHTML = '';
  actions.forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action';
    button.textContent = action.label;
    button.disabled = !action.enabled;
    button.addEventListener('click', () => {
      void handleAction(action.id);
    });
    controlsEl.appendChild(button);
  });
};

let state: GameState | null = null;
let scene: SteppyScene | null = null;

const handleAction = async (actionId: string) => {
  if (!state) {
    return;
  }
  const optimistic = applyAction(state, actionId);
  state = optimistic;
  scene?.updateState(state);
  renderControls(state);

  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    if (!response.ok) {
      return;
    }
    await response.json();
  } catch (error) {
    console.error('Action failed', error);
  }
};

const init = async () => {
  shell?.classList.add('is-loading');
  const response = await fetch('/api/init');
  if (!response.ok) {
    throw new Error('Failed to init');
  }
  const payload = (await response.json()) as { state: GameState };
  state = payload.state;

  const localScene = new SteppyScene(state);
  scene = localScene;

  new Phaser.Game({
    type: Phaser.CANVAS,
    width: COLUMNS * CELL_SIZE,
    height: ROWS * CELL_SIZE,
    backgroundColor: 'transparent',
    parent: 'game-root',
    scene: [localScene],
    render: {
      antialias: false,
      pixelArt: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });

  renderControls(state);
  shell?.classList.remove('is-loading');
};

void init();
