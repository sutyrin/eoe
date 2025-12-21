import './style.css';
import Phaser from 'phaser';
import { registerGame } from './mcp/game-api';
import { getBrowserId } from './game-core/browser-id';
import { createStateController } from './game-core/state-controller';
import {
  computeActions,
  createInitialState,
  STEPPY_COLUMNS,
  STEPPY_ROWS,
  type GameState
} from './game-core/steppy';

const CELL_SIZE = 56;

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

    const width = STEPPY_COLUMNS * CELL_SIZE;
    const height = STEPPY_ROWS * CELL_SIZE;

    this.graphics.fillStyle(0xe6f0dc, 0.8);
    this.graphics.fillRect(0, 0, width, height);

    this.graphics.lineStyle(2, 0x9eb28f, 0.8);
    for (let col = 0; col <= STEPPY_COLUMNS; col += 1) {
      const x = col * CELL_SIZE;
      this.graphics.lineBetween(x, 0, x, height);
    }
    for (let row = 0; row <= STEPPY_ROWS; row += 1) {
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
    <div id="game-root"></div>
    <div class="controls" id="controls"></div>
  </div>
`;

const shell = document.querySelector<HTMLDivElement>('.shell');
const controlsEl = document.querySelector<HTMLDivElement>('#controls');

let state = createInitialState();

const scene = new SteppyScene(state);

new Phaser.Game({
  type: Phaser.CANVAS,
  width: STEPPY_COLUMNS * CELL_SIZE,
  height: STEPPY_ROWS * CELL_SIZE,
  backgroundColor: 'transparent',
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
  if (!controlsEl) {
    return;
  }
  controlsEl.innerHTML = '';
  const actions = computeActions(state);
  actions.forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action';
    button.textContent = action.label;
    button.disabled = !action.enabled;
    button.addEventListener('click', () => {
      controller.act(action.id);
    });
    controlsEl.appendChild(button);
  });
};

const store = {
  load: async () => {
    try {
      const clientId = getBrowserId();
      const response = await fetch('/api/state', {
        headers: { 'x-client-id': clientId }
      });
      if (!response.ok) {
        return createInitialState();
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON content:', contentType);
        return createInitialState();
      }
      const payload = (await response.json()) as { state: GameState };
      return payload.state;
    } catch (err) {
      console.warn('Failed to load state from API, falling back to local:', err);
      return createInitialState();
    }
  },
  save: async (nextState: GameState) => {
    const clientId = getBrowserId();
    await fetch('/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId
      },
      body: JSON.stringify({ state: nextState })
    });
  }
};

const controller = createStateController(store, {
  onState: (nextState) => {
    state = nextState;
    scene.updateState(state);
    renderUi();
  },
  onError: (error) => {
    console.error('Save failed', error);
  }
});

registerGame(
  {
    getState: () => ({ ...state, actions: computeActions(state) }),
    getActions: () => computeActions(state),
    act: (actionId: string) => {
      controller.act(actionId);
      return { ...state, actions: computeActions(state) };
    }
  },
  { log: true, tag: '[mcp]' }
);

shell?.classList.add('is-loading');
void controller.init().then(() => {
  shell?.classList.remove('is-loading');
});
