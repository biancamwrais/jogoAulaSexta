import Phaser from 'phaser';
import { GAME_CONFIG } from './utils/Constants.js';
import { TimeSystem } from './systems/TimeSystem.js';
import { StatusSystem } from './systems/StatusSystem.js';
import { EconomySystem } from './systems/EconomySystem.js';
import { SaveSystem } from './systems/SaveSystem.js';

import { BootScene } from './scenes/BootScene.js';
import { KitnetScene } from './scenes/KitnetScene.js';
import { StreetScene } from './scenes/StreetScene.js';
import { MetroScene } from './scenes/MetroScene.js';
import { UIScene } from './scenes/UIScene.js';
import { DialogueOverlay } from './scenes/DialogueOverlay.js';

// Inicialização dos barramentos e instâncias globais
const eventBus = new Phaser.Events.EventEmitter();
const timeSystem = new TimeSystem(eventBus);
const statusSystem = new StatusSystem(eventBus);
const economySystem = new EconomySystem(eventBus, statusSystem);

const gameState = {
  time: timeSystem,
  status: statusSystem,
  economy: economySystem
};

// Tenta restaurar savegame anterior se existir
if (SaveSystem.hasSave()) {
  const loadResult = SaveSystem.load(gameState);
  if (loadResult.success) {
    console.log('Progresso anterior restaurado do localStorage!', loadResult.savedAt);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    KitnetScene,
    StreetScene,
    MetroScene,
    UIScene,
    DialogueOverlay
  ]
};

const game = new Phaser.Game(config);

// Registra dependências no registry para acesso compartilhado entre cenas
game.registry.set('events', eventBus);
game.registry.set('gameState', gameState);

export default game;
