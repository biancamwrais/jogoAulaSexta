import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Interactable } from '../entities/Interactable.js';
import { EVENTS } from '../utils/Constants.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { eventBus, gameState } from '../state/gameState.js';

export class KitnetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'KitnetScene' });
  }

  create(data) {
    this.gameEvents = eventBus;
    this.gameState = gameState;

    const width = 480;
    const height = 270;

    // Configurar limites do mundo do quarto
    this.physics.world.setBounds(0, 0, width, height);

    this.createRoomGraphics(width, height);
    this.createInteractables();

    // Posição inicial do jogador (ou vindo da porta)
    const spawnX = data?.spawnX ?? 180;
    const spawnY = data?.spawnY ?? 150;
    this.player = new Player(this, spawnX, spawnY);
    this.game.registry.set('player', this.player);

    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.player, this.furnitureGroup);

    // Câmera estilizada
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(2);
    this.cameras.main.centerOn(width / 2, height / 2);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Ouvinte para caso o jogador desmaie
    this.gameEvents.on(EVENTS.PLAYER_EXHAUSTED, this.handleExhaustion, this);
  }

  update(time, delta) {
    this.player.update();
    this.gameState.time.update(delta);

    // Verificação de proximidade
    let nearby = null;
    if (this.interactables) {
      for (const item of this.interactables) {
        if (item.isNear(this.player)) {
          nearby = item;
          break;
        }
      }
    }
    this.player.setInteractable(nearby);
  }

  createRoomGraphics(width, height) {
    // 1. Chão de tacos de madeira (Tilemap simulado)
    for (let x = 64; x < width - 64; x += 32) {
      for (let y = 64; y < height - 32; y += 32) {
        this.add.image(x + 16, y + 16, 'floor_wood');
      }
    }

    // 2. Paredes e Colisões
    this.wallsGroup = this.physics.add.staticGroup();

    // Parede Norte
    for (let x = 32; x <= width - 32; x += 32) {
      const w = this.wallsGroup.create(x, 48, 'wall');
      w.refreshBody();
    }
    // Parede Sul
    for (let x = 32; x <= width - 32; x += 32) {
      const w = this.wallsGroup.create(x, height - 16, 'wall');
      w.refreshBody();
    }
    // Parede Oeste
    for (let y = 64; y <= height - 32; y += 32) {
      const w = this.wallsGroup.create(48, y, 'wall');
      w.refreshBody();
    }
    // Parede Leste
    for (let y = 64; y <= height - 32; y += 32) {
      const w = this.wallsGroup.create(width - 48, y, 'wall');
      w.refreshBody();
    }

    // Janela com luz suave da metrópole
    const windowGraphic = this.add.graphics();
    windowGraphic.fillStyle(0x3a86ff, 0.4);
    windowGraphic.fillRect(200, 36, 40, 24);
    windowGraphic.lineStyle(2, 0xffffff, 0.8);
    windowGraphic.strokeRect(200, 36, 40, 24);
  }

  createInteractables() {
    this.furnitureGroup = this.physics.add.staticGroup();
    this.interactables = [];

    // 1. Cama
    const bed = new Interactable(this, 100, 100, 'bed', 'Descansar na Cama', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Cama Macia',
        text: 'Seu corpo pesa após a rotina na metrópole. O que deseja fazer?',
        options: [
          {
            label: 'Dormir até amanhã',
            action: () => this.sleepFullNight()
          },
          {
            label: 'Cochilo rápido (1h)',
            action: () => this.napOneHour()
          }
        ]
      });
    });
    this.registerInteractable(bed);

    // 2. Mesa com Computador
    const desk = new Interactable(this, 300, 80, 'desk', 'Computador', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Computador Velho',
        text: 'Telas abertas: vagas de emprego, portal da faculdade e freelas.',
        options: [
          {
            label: 'Freela Rápido (+R$70, -25 En)',
            action: () => this.workFreelance()
          },
          {
            label: 'Estudar Matéria (+2h, -15 En)',
            action: () => this.studyAtDesk()
          },
          {
            label: 'Relaxar com Séries (-15 Estresse)',
            action: () => this.relaxAtDesk()
          }
        ]
      });
    });
    this.registerInteractable(desk);

    // 3. Geladeira
    const fridge = new Interactable(this, 390, 85, 'fridge', 'Cozinha / Geladeira', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Geladeira',
        text: 'A geladeira tem água gelada, miojo e restos do almoço.',
        options: [
          {
            label: 'Cozinhar Miojo (-R$ 5, +25 En)',
            action: () => this.eatNoodles()
          },
          {
            label: 'Café Preto Express (+15 En, +5 Est)',
            action: () => this.drinkCoffee()
          }
        ]
      });
    });
    this.registerInteractable(fridge);

    // 4. Porta de Saída para a Rua
    const door = new Interactable(this, 240, 244, 'door', 'Sair para a Rua', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('StreetScene', { from: 'kitnet' });
      });
    });
    this.registerInteractable(door);

    // 5. Gato de Estimação (Bidu)
    const cat = new Interactable(this, 160, 95, 'cat', 'Fazer carinho no Bidu', () => {
      this.gameState.status.modifyStress(-8);
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: '🐱 Bidu ronrona no seu colo. Seu estresse diminuiu (-8)!',
        type: 'success'
      });
    });
    this.registerInteractable(cat);
  }

  registerInteractable(interactable) {
    this.furnitureGroup.add(interactable);
    this.interactables.push(interactable);
  }

  sleepFullNight() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.gameState.time.advanceToNextDay();
      this.gameState.status.restoreSleep();
      this.gameState.economy.checkDailyBills(this.gameState.time.day);

      // Auto-save ao dormir
      SaveSystem.save(this.gameState);

      this.cameras.main.fadeIn(600, 0, 0, 0);
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: '☀️ Bom dia! Energia restabelecida e progresso salvo.',
        type: 'info'
      });
    });
  }

  napOneHour() {
    this.gameState.time.advanceMinutes(60);
    this.gameState.status.modifyEnergy(20);
    this.gameState.status.modifyStress(-5);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: 'Você tirou uma soneca de 1 hora (+20 Energia).',
      type: 'info'
    });
  }

  workFreelance() {
    if (this.gameState.status.energy < 25) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Cansaço demais para focar! Descanse antes.',
        type: 'warning'
      });
      return;
    }
    this.gameState.time.advanceMinutes(120);
    this.gameState.status.modifyEnergy(-25);
    this.gameState.status.modifyStress(10);
    this.gameState.status.modifyMoney(75.00);
    this.gameState.status.addWorkExp(15);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '💼 Freela entregue! +R$ 75,00 depositados na conta.',
      type: 'success'
    });
  }

  studyAtDesk() {
    if (this.gameState.status.isBurnout()) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: '❌ BURNOUT: Sua mente está sobrecarregada para absorver conteúdo!',
        type: 'danger'
      });
      return;
    }
    if (this.gameState.status.energy < 15) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Você está pescando de sono na frente dos livros.',
        type: 'warning'
      });
      return;
    }
    this.gameState.time.advanceMinutes(120);
    this.gameState.status.modifyEnergy(-20);
    this.gameState.status.modifyStress(6);
    this.gameState.status.addStudy(2);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '📚 2 horas de estudo dedicadas ao portfólio e provas.',
      type: 'info'
    });
  }

  relaxAtDesk() {
    this.gameState.time.advanceMinutes(60);
    this.gameState.status.modifyEnergy(-5);
    this.gameState.status.modifyStress(-18);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '🎮 Uma pausa assistindo vídeos no YouTube aliviou o estresse.',
      type: 'success'
    });
  }

  eatNoodles() {
    if (this.gameState.status.money < 5) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Sem dinheiro nem para o miojo!',
        type: 'warning'
      });
      return;
    }
    this.gameState.time.advanceMinutes(20);
    this.gameState.status.modifyMoney(-5.00);
    this.gameState.status.modifyEnergy(25);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '🍜 Miojão rápido servido. Bateria recarregada (+25 Energia)!',
      type: 'success'
    });
  }

  drinkCoffee() {
    this.gameState.time.advanceMinutes(10);
    this.gameState.status.modifyEnergy(15);
    this.gameState.status.modifyStress(6);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '☕ Café puro forte! Pico de cafeína (+15 Energia, +6 Estresse).',
      type: 'info'
    });
  }

  handleExhaustion() {
    this.player.lock();
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.gameState.status.penalizeExhaustion();
      this.gameState.time.advanceToNextDay();
      this.player.setPosition(100, 110);
      this.cameras.main.fadeIn(800, 0, 0, 0);
      this.player.unlock();
    });
  }
}
