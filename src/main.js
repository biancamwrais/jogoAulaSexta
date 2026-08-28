import Phaser from 'phaser';
import { GAME_CONFIG } from './utils/Constants.js';
import { eventBus, gameState } from './state/gameState.js';

import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { StreetScene } from './scenes/StreetScene.js';
import { KitnetScene } from './scenes/KitnetScene.js';
import { MetroScene } from './scenes/MetroScene.js';
import { UIScene } from './scenes/UIScene.js';
import { DialogueOverlay } from './scenes/DialogueOverlay.js';

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
    TitleScene,
    StreetScene,
    KitnetScene,
    MetroScene,
    UIScene,
    DialogueOverlay
  ]
};

const game = new Phaser.Game(config);

game.registry.set('events', eventBus);
game.registry.set('gameState', gameState);

export default game;
