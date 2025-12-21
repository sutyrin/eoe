import './style.css';
import Phaser from 'phaser';
import { registerGame } from './mcp/game-api';
import { getBrowserId } from './game-core/browser-id';
import { createStateController } from './game-core/state-controller';
import {
  computeActions,
  createInitialState,
  getRow,
  STEPPY_COLUMNS,
  STEPPY_VERSION,
  CELL_BLOCK,
  type GameState
} from './game-core/steppy';

const CELL_SIZE = 56;
const VIEW_ROWS = 9; // Number of rows visible on screen

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
    const height = VIEW_ROWS * CELL_SIZE;

    // Calculate camera offset to keep player in view
    // We want the player to be roughly at the 3rd row from the bottom
    // screenRow = VIEW_ROWS - 1 - (worldY - cameraY)
    // We want screenRow ~ VIEW_ROWS - 3 => worldY - cameraY ~ 2 => cameraY ~ worldY - 2
    let cameraY = Math.max(0, this.state.player.y - 2);

    // Draw Background
    this.graphics.fillStyle(0xe6f0dc, 0.8);
    this.graphics.fillRect(0, 0, width, height);

    // Draw Grid Lines
    this.graphics.lineStyle(2, 0x9eb28f, 0.8);
    for (let col = 0; col <= STEPPY_COLUMNS; col += 1) {
      const x = col * CELL_SIZE;
      this.graphics.lineBetween(x, 0, x, height);
    }
    for (let i = 0; i <= VIEW_ROWS; i += 1) {
        const y = i * CELL_SIZE;
        this.graphics.lineBetween(0, y, width, y);
    }

    // Draw Cells (Blocks)
    this.graphics.fillStyle(0x5e4c35, 1); // Brown for obstacles
    
    // We render rows from cameraY to cameraY + VIEW_ROWS
    for (let rowOffset = 0; rowOffset < VIEW_ROWS; rowOffset++) {
        const worldY = cameraY + rowOffset;
        const rowData = getRow(this.state, worldY);
        
        // Screen Y calculation:
        // World Y increases UP. Screen Y increases DOWN.
        // If worldY = cameraY, it should be at the bottom? 
        // No, cameraY is the "bottom-most visible row index".
        // So worldY=cameraY is at screenY = (VIEW_ROWS - 1) * CELL_SIZE?
        // Let's verify:
        // If worldY = cameraY, we want it at the bottom of the screen.
        // screenY index = VIEW_ROWS - 1 - rowOffset
        const screenY = (VIEW_ROWS - 1 - rowOffset) * CELL_SIZE;
        
        for (let x = 0; x < STEPPY_COLUMNS; x++) {
            if (rowData[x] === CELL_BLOCK) {
                const screenX = x * CELL_SIZE;
                this.graphics.fillRoundedRect(
                    screenX + 4,
                    screenY + 4,
                    CELL_SIZE - 8,
                    CELL_SIZE - 8,
                    4
                );
            }
        }
    }

    // Draw Player
    const padding = 10;
    const playerRelativeY = this.state.player.y - cameraY;
    
    // Only draw if within view (should always be true due to camera logic)
    if (playerRelativeY >= 0 && playerRelativeY < VIEW_ROWS) {
        const playerScreenY = (VIEW_ROWS - 1 - playerRelativeY) * CELL_SIZE;
        
        this.graphics.fillStyle(0x2e5c3a, 1);
        this.graphics.fillRoundedRect(
            this.state.player.x * CELL_SIZE + padding,
            playerScreenY + padding,
            CELL_SIZE - padding * 2,
            CELL_SIZE - padding * 2,
            8
        );
    }
    
    // Debug info
    // this.add.text(10, 10, `Y: ${this.state.player.y}`, { color: '#000' });
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
  height: VIEW_ROWS * CELL_SIZE,
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
      // Version Check
      if (payload.state.version !== STEPPY_VERSION) {
          console.warn('Version mismatch, resetting state', payload.state.version, STEPPY_VERSION);
          return createInitialState();
      }
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