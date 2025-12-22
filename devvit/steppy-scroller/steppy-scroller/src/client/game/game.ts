import { Scene } from 'phaser';
import Phaser from 'phaser';
import { createStateController } from '@eoe/game-core/state-controller';
import {
  computeActions,
  createInitialState,
  getRow,
  STEPPY_COLUMNS,
  STEPPY_VERSION,
  CELL_BLOCK,
  CELL_WATER,
  type GameState,
} from '@eoe/game-core/steppy';
import { InitResponse } from '../../shared/types/api';

const CELL_SIZE = 56;
const VIEW_ROWS = 9;

export class Game extends Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private state: GameState;
  private controller: ReturnType<typeof createStateController> | undefined;
  private uiContainer: HTMLDivElement | null = null;

  constructor() {
    super('Game');
    this.state = createInitialState();
  }

  create() {
    this.graphics = this.add.graphics();

    // Setup UI Container (Overlay)
    this.createUiOverlay();

    // Initialize State Controller
    this.controller = createStateController(
      {
        load: async () => {
          try {
            const response = await fetch('/api/init');
            if (!response.ok) throw new Error('API Error');
            const data = (await response.json()) as InitResponse;
            // Version Check
            if (data.state.version !== STEPPY_VERSION) {
              console.warn('Version mismatch', data.state.version, STEPPY_VERSION);
              return createInitialState();
            }
            return data.state;
          } catch (e) {
            console.error('Load failed', e);
            return createInitialState();
          }
        },
        save: async (nextState: GameState) => {
          await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: nextState }),
          });
        },
      },
      {
        onState: (nextState) => {
          this.state = nextState;
          this.redraw();
          this.renderUi();
        },
        onError: (err) => console.error(err),
      }
    );

    void this.controller?.init();

    // Responsive sizing
    this.scale.on('resize', this.resize, this);
    this.resize(this.scale.gameSize);
  }

  resize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.main.setViewport(0, 0, width, height);
    this.cameras.main.centerOn((STEPPY_COLUMNS * CELL_SIZE) / 2, (VIEW_ROWS * CELL_SIZE) / 2);
    this.redraw();
  }

  createUiOverlay() {
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.bottom = '20px';
    this.uiContainer.style.left = '50%';
    this.uiContainer.style.transform = 'translateX(-50%)';
    this.uiContainer.style.display = 'flex';
    this.uiContainer.style.gap = '16px';
    document.body.appendChild(this.uiContainer);
  }

  renderUi() {
    if (!this.uiContainer) return;
    this.uiContainer.innerHTML = '';

    const actions = computeActions(this.state);
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.textContent = action.label;
      btn.disabled = !action.enabled;
      btn.className = 'action';
      // Apply basic styles inline since CSS might not be loaded the same way
      Object.assign(btn.style, {
        width: '88px',
        height: '88px',
        fontSize: '32px',
        background: '#2f583a',
        color: '#fff',
        border: '3px solid rgba(255,255,255,0.3)',
        borderRadius: '22px',
        cursor: action.enabled ? 'pointer' : 'not-allowed',
        opacity: action.enabled ? '1' : '0.6',
      });

      btn.onclick = () => this.controller?.act(action.id);
      this.uiContainer!.appendChild(btn);
    });
  }

  redraw() {
    if (!this.graphics) return;
    this.graphics.clear();

    const width = STEPPY_COLUMNS * CELL_SIZE;
    const height = VIEW_ROWS * CELL_SIZE;

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
          this.graphics.fillStyle(0x1a472a, 1);
          this.graphics.fillRoundedRect(screenX + 4, screenY + 4, CELL_SIZE - 8, CELL_SIZE - 8, 8);
          this.graphics.lineStyle(2, 0x2d6e42, 1);
          this.graphics.strokeRoundedRect(
            screenX + 4,
            screenY + 4,
            CELL_SIZE - 8,
            CELL_SIZE - 8,
            8
          );
        } else if (cell === CELL_WATER) {
          this.graphics.fillStyle(0x3498db, 0.8);
          this.graphics.fillCircle(screenX + CELL_SIZE / 2, screenY + CELL_SIZE / 2, CELL_SIZE / 4);
          this.graphics.lineStyle(2, 0x2980b9, 1);
          this.graphics.strokeCircle(
            screenX + CELL_SIZE / 2,
            screenY + CELL_SIZE / 2,
            CELL_SIZE / 4
          );
        }
      }
    }

    // Draw Player
    const playerRelativeY = this.state.player.y - cameraY;
    if (playerRelativeY >= 0 && playerRelativeY < VIEW_ROWS) {
      const padding = 10;
      const playerScreenY = (VIEW_ROWS - 1 - playerRelativeY) * CELL_SIZE;

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
        this.state.player.x * CELL_SIZE + CELL_SIZE / 2,
        playerScreenY + CELL_SIZE / 2,
        8
      );
    }

    // HUD
    const hudStyle = {
      fontFamily: 'monospace',
      color: '#2e5c3a',
      fontSize: '16px',
      backgroundColor: '#e6f0dccc',
      padding: { x: 4, y: 4 } as Phaser.Types.GameObjects.Text.TextPadding,
    };

    // Water Gauge
    const gaugeWidth = 16;
    const maxBarHeight = height - 40;
    const currentBarHeight = (this.state.water / this.state.maxWater) * maxBarHeight;
    const barX = 8;
    const barY = 20 + (maxBarHeight - currentBarHeight);

    this.graphics.fillStyle(0xbdc3c7, 0.5);
    this.graphics.fillRoundedRect(barX, 20, gaugeWidth, maxBarHeight, 4);

    const waterColor = this.state.water < 5 ? 0xe74c3c : 0x3498db;
    this.graphics.fillStyle(waterColor, 1);
    this.graphics.fillRoundedRect(barX, barY, gaugeWidth, currentBarHeight, 4);

    this.updateTextObj('hud-height', 10, 10, `Height: ${this.state.player.y}m`, hudStyle);
    this.updateTextObj('hud-water', width - 120, 10, `Water: ${this.state.water}`, {
      ...hudStyle,
      color: this.state.water < 5 ? '#e74c3c' : '#3498db',
    });

    if (this.state.status === 'ended') {
      this.updateTextObj(
        'hud-gameover',
        width / 2,
        height / 2,
        'WITHERED',
        {
          fontSize: '48px',
          color: '#c0392b',
          fontStyle: 'bold',
          stroke: '#fff',
          strokeThickness: 4,
        },
        0.5
      );
    } else {
      this.children.getByName('hud-gameover')?.destroy();
    }
  }

  updateTextObj(
    name: string,
    x: number,
    y: number,
    text: string,
    style: Partial<Phaser.Types.GameObjects.Text.TextStyle>,
    origin: number = 0
  ) {
    let obj = this.children.getByName(name) as Phaser.GameObjects.Text;
    if (obj) {
      obj.setText(text);
      obj.setStyle(style);
      obj.setPosition(x, y);
    } else {
      obj = this.add.text(x, y, text, style).setName(name).setDepth(10).setOrigin(origin);
    }
  }
}

// Boot the game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: STEPPY_COLUMNS * CELL_SIZE,
  height: VIEW_ROWS * CELL_SIZE,
  backgroundColor: 'transparent',
  parent: 'game-root',
  scene: [Game],
  render: {
    antialias: false,
    pixelArt: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
