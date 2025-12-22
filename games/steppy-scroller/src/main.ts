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
  type GameState
} from './game-core/steppy';

const CELL_SIZE = 56;
const VIEW_ROWS = 9; // Number of rows visible on screen
const HUD_HEIGHT = 30;
const HUD_INSET = 6;
const HUD_GAP = 12;
const HUD_BAR_HEIGHT = HUD_HEIGHT + 8;

class SteppyScene extends Phaser.Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private state: GameState;
  private staminaText?: Phaser.GameObjects.Text;
  private altitudeText?: Phaser.GameObjects.Text;
  private endText?: Phaser.GameObjects.Text;
  private gridTop = 0;
  private gridHeight = 0;

  constructor(initialState: GameState) {
    super('steppy');
    this.state = initialState;
  }

  create() {
    const width = STEPPY_COLUMNS * CELL_SIZE;
    this.gridTop = HUD_BAR_HEIGHT;
    this.gridHeight = VIEW_ROWS * CELL_SIZE;
    this.graphics = this.add.graphics();
    const hudStyle = {
      fontFamily: 'monospace',
      color: '#2e5c3a',
      fontSize: '14px'
    };
    const hudBoxWidth = (width - HUD_INSET * 2 - HUD_GAP) / 2;
    const leftBoxX = HUD_INSET;
    const rightBoxX = HUD_INSET + hudBoxWidth + HUD_GAP;
    const hudTopY = HUD_INSET + 4;
    this.staminaText = this.add
      .text(leftBoxX, hudTopY, '', hudStyle)
      .setFixedSize(hudBoxWidth, HUD_HEIGHT - 6)
      .setPadding(8, 3)
      .setAlign('left')
      .setDepth(10);
    this.altitudeText = this.add
      .text(rightBoxX, hudTopY, '', hudStyle)
      .setFixedSize(hudBoxWidth, HUD_HEIGHT - 6)
      .setPadding(8, 3)
      .setAlign('right')
      .setDepth(10);
    this.endText = this.add
      .text((STEPPY_COLUMNS * CELL_SIZE) / 2, this.gridTop + this.gridHeight / 2, 'EXHAUSTED', {
        fontSize: '48px',
        color: '#c0392b',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);
    this.redraw();
  }

  updateState(state: GameState) {
    this.state = state;
    this.redraw();
  }

  private redraw() {
    const g = this.graphics;
    if (!g) {
      return;
    }
    g.clear();

    const width = STEPPY_COLUMNS * CELL_SIZE;
    const height = this.gridHeight + this.gridTop;
    const gaugeWidth = 16;
    const padding = 10;

    // Camera always follows player at the bottom row
    const cameraY = this.state.player.y;

    // Draw Background
    g.fillStyle(0xe6f0dc, 0.8);
    g.fillRect(0, 0, width, height);

    // Draw Grid Lines
    g.lineStyle(2, 0x9eb28f, 0.8);
    for (let col = 0; col <= STEPPY_COLUMNS; col += 1) {
      const x = col * CELL_SIZE;
      g.lineBetween(x, this.gridTop, x, this.gridTop + this.gridHeight);
    }
    for (let i = 0; i <= VIEW_ROWS; i += 1) {
        const y = this.gridTop + i * CELL_SIZE;
        g.lineBetween(0, y, width, y);
    }

    // Draw Cells
    for (let rowOffset = 0; rowOffset < VIEW_ROWS; rowOffset++) {
        const worldY = cameraY + rowOffset;
        const rowData = getRow(this.state, worldY);
        const screenY = this.gridTop + (VIEW_ROWS - 1 - rowOffset) * CELL_SIZE;
        
        for (let x = 0; x < STEPPY_COLUMNS; x++) {
            const cell = rowData[x];
            const screenX = x * CELL_SIZE;
            
            if (cell === CELL_BLOCK) {
                // Deep Green for "Rock" blocks
                g.fillStyle(0x1a472a, 1); 
                g.fillRoundedRect(screenX + 4, screenY + 4, CELL_SIZE - 8, CELL_SIZE - 8, 8);
                g.lineStyle(2, 0x2d6e42, 1);
                g.strokeRoundedRect(screenX + 4, screenY + 4, CELL_SIZE - 8, CELL_SIZE - 8, 8);
            }
        }
    }

    // Highlight available/unavailable next steps
    if (this.state.status === 'running') {
        const nextY = this.state.player.y + 1;
        const targetXs = [this.state.player.x - 1, this.state.player.x, this.state.player.x + 1];
        const rowData = getRow(this.state, nextY);
        const rowOffset = nextY - cameraY;
        if (rowOffset >= 0 && rowOffset < VIEW_ROWS) {
            const screenY = this.gridTop + (VIEW_ROWS - 1 - rowOffset) * CELL_SIZE;
            targetXs.forEach((targetX) => {
                const screenX = targetX * CELL_SIZE;
                const isInBounds = targetX >= 0 && targetX < STEPPY_COLUMNS;
                const blocked = !isInBounds || rowData[targetX] === CELL_BLOCK;
                const color = blocked ? 0xe74c3c : 0x2ecc71;
                g.lineStyle(4, color, 0.7);
                g.strokeRoundedRect(screenX + 6, screenY + 6, CELL_SIZE - 12, CELL_SIZE - 12, 10);
            });
        }
    }

    // Draw Player
    const playerRelativeY = this.state.player.y - cameraY;
    if (playerRelativeY >= 0 && playerRelativeY < VIEW_ROWS) {
        const playerScreenY = this.gridTop + (VIEW_ROWS - 1 - playerRelativeY) * CELL_SIZE;
        
        // Bright Flower/Sprout color
        g.fillStyle(0xffd700, 1);
        g.fillRoundedRect(
            this.state.player.x * CELL_SIZE + padding,
            playerScreenY + padding,
            CELL_SIZE - padding * 2,
            CELL_SIZE - padding * 2,
            16
        );
         g.fillStyle(0xff8c00, 1);
         g.fillCircle(
            this.state.player.x * CELL_SIZE + CELL_SIZE/2,
            playerScreenY + CELL_SIZE/2,
            8
         );
    }

    // HUD Bar + Boxes (drawn on top of grid)
    const hudBoxWidth = (width - HUD_INSET * 2 - HUD_GAP) / 2;
    const leftBoxX = HUD_INSET;
    const rightBoxX = HUD_INSET + hudBoxWidth + HUD_GAP;
    const hudBarY = 0;
    g.fillStyle(0xe6f0dc, 0.98);
    g.fillRect(0, hudBarY, width, HUD_BAR_HEIGHT);
    g.lineStyle(2, 0x9eb28f, 0.9);
    g.strokeRect(0, hudBarY, width, HUD_BAR_HEIGHT);
    g.fillStyle(0xf3f7ee, 1);
    g.fillRoundedRect(leftBoxX, HUD_INSET + 4, hudBoxWidth, HUD_HEIGHT - 6, 6);
    g.fillRoundedRect(rightBoxX, HUD_INSET + 4, hudBoxWidth, HUD_HEIGHT - 6, 6);
    g.lineStyle(2, 0x9eb28f, 0.9);
    g.strokeRoundedRect(leftBoxX, HUD_INSET + 4, hudBoxWidth, HUD_HEIGHT - 6, 6);
    g.strokeRoundedRect(rightBoxX, HUD_INSET + 4, hudBoxWidth, HUD_HEIGHT - 6, 6);
    
    // Stamina Gauge (Left Side)
    // Draw relative to the left of the main grid.
    // Phaser Graphics is relative to scene 0,0. 
    // The game width is STEPPY_COLUMNS * CELL_SIZE.
    // We want it on the left edge.
    // Actually, let's draw it overlaying on the left, or just left of grid?
    // Since width is defined, we can just draw at x = 10.
    
    const maxBarHeight = this.gridHeight - padding * 2;
    const currentBarHeight = (this.state.stamina / this.state.maxStamina) * maxBarHeight;
    const barX = 8;
    const barY = this.gridTop + padding + (maxBarHeight - currentBarHeight);
    
    // Background bar
    g.fillStyle(0xbdc3c7, 0.5);
    g.fillRoundedRect(barX, this.gridTop + padding, gaugeWidth, maxBarHeight, 4);
    
    // Fill bar
    const staminaColor = this.state.stamina < 4 ? 0xe74c3c : 0x2ecc71;
    g.fillStyle(staminaColor, 1);
    g.fillRoundedRect(barX, barY, gaugeWidth, currentBarHeight, 4);
    
    if (this.staminaText) {
      this.staminaText.setText(`Stamina: ${this.state.stamina}`);
    }
    if (this.altitudeText) {
      this.altitudeText.setText(`Altitude: ${this.state.altitude}m`);
    }
    if (this.endText) {
      this.endText.setVisible(this.state.status === 'ended');
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
  height: VIEW_ROWS * CELL_SIZE + HUD_BAR_HEIGHT,
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
