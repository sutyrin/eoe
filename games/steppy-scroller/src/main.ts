import './style.css';
import Phaser from 'phaser';
import { registerGame, type Action, type GameState } from './mcp/game-api';

const COLUMNS = 5;
const ROWS = 9;
const CELL_SIZE = 56;

const createInitialState = (): GameState => ({
  version: '0.1',
  status: 'running',
  tick: 0,
  player: { x: Math.floor(COLUMNS / 2), y: 0 },
  actions: [],
  meta: { columns: COLUMNS, rows: ROWS }
});

const computeActions = (state: GameState): Action[] => {
  if (state.status !== 'running') {
    return [];
  }
  return [
    { id: 'step-left', label: 'Left', enabled: state.player.x > 0 },
    { id: 'step-up', label: 'Up', enabled: state.player.y < ROWS - 1 },
    { id: 'step-right', label: 'Right', enabled: state.player.x < COLUMNS - 1 }
  ];
};

const applyAction = (state: GameState, actionId: string): GameState => {
  if (state.status !== 'running') {
    return state;
  }
  const next = { ...state, player: { ...state.player } };
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
  next.actions = computeActions(next);
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

    this.graphics.fillStyle(0xe3f0db, 1);
    this.graphics.fillRect(0, 0, width, height);

    this.graphics.lineStyle(2, 0x9eb28f, 1);
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
    this.graphics.fillStyle(0x3b6b3b, 1);
    this.graphics.fillRoundedRect(
      x * CELL_SIZE + padding,
      height - (y + 1) * CELL_SIZE + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2,
      8
    );
  }
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app');
}

app.innerHTML = `
  <div class="shell">
    <div class="hud">
      <div class="title">Steppy Scroller</div>
      <div class="subtitle">Climb one step at a time. Choose wisely.</div>
      <div class="status" id="status"></div>
    </div>
    <div id="game-root"></div>
    <div class="controls" id="controls"></div>
  </div>
`;

const statusEl = document.querySelector<HTMLDivElement>('#status');
const controlsEl = document.querySelector<HTMLDivElement>('#controls');

let state = createInitialState();
state.actions = computeActions(state);

const scene = new SteppyScene(state);

new Phaser.Game({
  type: Phaser.CANVAS,
  width: COLUMNS * CELL_SIZE,
  height: ROWS * CELL_SIZE,
  backgroundColor: '#e3f0db',
  parent: 'game-root',
  scene: [scene],
  render: {
    antialias: false,
    pixelArt: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});

const renderUi = () => {
  if (statusEl) {
    statusEl.textContent = state.status === 'ended' ? 'Reached the top.' : 'Ready for your next step.';
  }
  if (!controlsEl) {
    return;
  }
  controlsEl.innerHTML = '';
  state.actions.forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action';
    button.textContent = action.label;
    button.disabled = !action.enabled;
    button.addEventListener('click', () => {
      state = applyAction(state, action.id);
      scene.updateState(state);
      renderUi();
    });
    controlsEl.appendChild(button);
  });
};

registerGame(
  {
    getState: () => state,
    getActions: () => state.actions,
    act: (actionId: string) => {
      state = applyAction(state, actionId);
      scene.updateState(state);
      renderUi();
      return state;
    }
  },
  { log: true, tag: '[mcp]' }
);

renderUi();
