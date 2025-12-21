import Phaser from 'phaser';
import { createStateController } from '@eoe/game-core/state-controller';
import {
  computeActions,
  createInitialState,
  STEPPY_COLUMNS,
  STEPPY_ROWS,
  type GameState,
} from '@eoe/game-core/steppy';

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

let scene: SteppyScene | null = null;

const store = {
  load: async () => {
    const response = await fetch('/api/init');
    if (!response.ok) {
      return createInitialState();
    }
    const payload = (await response.json()) as { state: GameState };
    return payload.state;
  },
  save: async (state: GameState) => {
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  },
};

const controller = createStateController(store, {
  onState: (state) => {
    scene?.updateState(state);
    renderControls(state);
  },
  onError: (error) => {
    console.error('Save failed', error);
  },
});

const handleAction = (actionId: string) => {
  controller.act(actionId);
};

const init = async () => {
  shell?.classList.add('is-loading');
  const initialState = await controller.init();

  const localScene = new SteppyScene(initialState);
  scene = localScene;

  new Phaser.Game({
    type: Phaser.CANVAS,
    width: STEPPY_COLUMNS * CELL_SIZE,
    height: STEPPY_ROWS * CELL_SIZE,
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

  renderControls(initialState);
  shell?.classList.remove('is-loading');
};

void init();
