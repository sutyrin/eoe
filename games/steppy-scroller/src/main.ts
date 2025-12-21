import './style.css';
import Phaser from 'phaser';
import { registerGame } from './mcp/game-api';
import { getBrowserId } from './game-core/browser-id';
import { createStateController } from './game-core/state-controller';
import {
  computeActions,
  createInitialState,
  evaluateState,
  getRow,
  STEPPY_COLUMNS,
  STEPPY_VERSION,
  CELL_BLOCK,
  CELL_WATER,
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
    const gaugeWidth = 16;
    const padding = 10;

    // Camera always follows player at the bottom row
    const cameraY = this.state.player.y;

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

    // Draw Cells
    for (let rowOffset = 0; rowOffset < VIEW_ROWS; rowOffset++) {
        const worldY = cameraY + rowOffset;
        const rowData = getRow(this.state, worldY);
        const screenY = (VIEW_ROWS - 1 - rowOffset) * CELL_SIZE;
        
        for (let x = 0; x < STEPPY_COLUMNS; x++) {
            const cell = rowData[x];
            const screenX = x * CELL_SIZE;
            
            if (cell === CELL_BLOCK) {
                // Deep Green for "Vine/Leaf" blocks
                this.graphics.fillStyle(0x1a472a, 1); 
                this.graphics.fillRoundedRect(screenX + 4, screenY + 4, CELL_SIZE - 8, CELL_SIZE - 8, 8);
                this.graphics.lineStyle(2, 0x2d6e42, 1);
                this.graphics.strokeRoundedRect(screenX + 4, screenY + 4, CELL_SIZE - 8, CELL_SIZE - 8, 8);
            } else if (cell === CELL_WATER) {
                // Blue Droplet
                this.graphics.fillStyle(0x3498db, 0.8);
                this.graphics.fillCircle(screenX + CELL_SIZE/2, screenY + CELL_SIZE/2, CELL_SIZE/4);
                this.graphics.lineStyle(2, 0x2980b9, 1);
                this.graphics.strokeCircle(screenX + CELL_SIZE/2, screenY + CELL_SIZE/2, CELL_SIZE/4);
            }
        }
    }

    // Draw Player
    const playerRelativeY = this.state.player.y - cameraY;
    if (playerRelativeY >= 0 && playerRelativeY < VIEW_ROWS) {
        const playerScreenY = (VIEW_ROWS - 1 - playerRelativeY) * CELL_SIZE;
        
        // Bright Flower/Sprout color
        this.graphics.fillStyle(0xffd700, 1);
        this.graphics.fillRoundedRect(
            this.state.player.x * CELL_SIZE + padding,
            playerScreenY + padding,
            CELL_SIZE - padding * 2,
            CELL_SIZE - padding * 2,
            16
        );
         this.graphics.fillStyle(0xff8c00, 1);
         this.graphics.fillCircle(
            this.state.player.x * CELL_SIZE + CELL_SIZE/2,
            playerScreenY + CELL_SIZE/2,
            8
         );
    }
    
    // Water Gauge (Left Side)
    // Draw relative to the left of the main grid.
    // Phaser Graphics is relative to scene 0,0. 
    // The game width is STEPPY_COLUMNS * CELL_SIZE.
    // We want it on the left edge.
    // Actually, let's draw it overlaying on the left, or just left of grid?
    // Since width is defined, we can just draw at x = 10.
    
    const maxBarHeight = height - 40;
    const currentBarHeight = (this.state.water / this.state.maxWater) * maxBarHeight;
    const barX = 8;
    const barY = 20 + (maxBarHeight - currentBarHeight);
    
    // Background bar
    this.graphics.fillStyle(0xbdc3c7, 0.5);
    this.graphics.fillRoundedRect(barX, 20, gaugeWidth, maxBarHeight, 4);
    
    // Fill bar
    const waterColor = this.state.water < 5 ? 0xe74c3c : 0x3498db;
    this.graphics.fillStyle(waterColor, 1);
    this.graphics.fillRoundedRect(barX, barY, gaugeWidth, currentBarHeight, 4);
    
    // HUD Text
    const hudStyle = { 
        fontFamily: 'monospace',
        color: '#2e5c3a',
        fontSize: '16px',
        backgroundColor: '#e6f0dccc',
        padding: { x: 4, y: 4 }
    };

    // Top Right: Height
    this.add.text(width - 120, 10, `Height: ${this.state.player.y}m`, hudStyle).setDepth(10);
    
    if (this.state.status === 'ended') {
        this.add.text(width/2, height/2, 'WITHERED', {
            fontSize: '48px',
            color: '#c0392b',
            fontStyle: 'bold',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(20);
    }
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
    getState: () => ({ 
        ...state, 
        actions: computeActions(state),
        evaluation: evaluateState(state) 
    } as any),
    getActions: () => computeActions(state),
    act: (actionId: string) => {
      controller.act(actionId);
      return { 
          ...state, 
          actions: computeActions(state),
          evaluation: evaluateState(state)
      } as any;
    }
  },
  { log: true, tag: '[mcp]' }
);

shell?.classList.add('is-loading');
void controller.init().then(() => {
  shell?.classList.remove('is-loading');
});