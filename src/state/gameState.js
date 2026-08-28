import Phaser from 'phaser';
import { TimeSystem } from '../systems/TimeSystem.js';
import { StatusSystem } from '../systems/StatusSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

// Barramento de eventos global e instâncias dos sistemas
export const eventBus = new Phaser.Events.EventEmitter();
export const timeSystem = new TimeSystem(eventBus);
export const statusSystem = new StatusSystem(eventBus);
export const economySystem = new EconomySystem(eventBus, statusSystem);

export const gameState = {
  time: timeSystem,
  status: statusSystem,
  economy: economySystem
};

// Tenta restaurar save anterior se existir
if (typeof window !== 'undefined' && SaveSystem.hasSave()) {
  const loadResult = SaveSystem.load(gameState);
  if (loadResult.success) {
    console.log('Progresso anterior restaurado com sucesso!', loadResult.savedAt);
  }
}
