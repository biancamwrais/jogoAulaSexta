import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Interactable } from '../entities/Interactable.js';
import { EVENTS } from '../utils/Constants.js';
import { eventBus, gameState } from '../state/gameState.js';

export class StreetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StreetScene' });
  }

  create(data) {
    this.gameEvents = eventBus;
    this.gameState = gameState;

    const width = 640;
    const height = 360;

    this.physics.world.setBounds(0, 0, width, height);

    this.createStreetEnvironment(width, height);
    this.createStreetInteractables();

    // Posição inicial do jogador
    const spawnX = data?.spawnX ?? 240;
    const spawnY = data?.spawnY ?? 210;

    this.player = new Player(this, spawnX, spawnY);
    this.registry.set('player', this.player);

    this.physics.add.collider(this.player, this.collidersGroup);

    this.physics.add.overlap(this.player, this.interactionZones, (player, zone) => {
      player.setInteractable(zone.parentInteractable);
    });

    this.events.on('update', () => {
      if (this.player.currentInteractable) {
        const zone = this.player.currentInteractable.interactionZone;
        if (!this.physics.overlap(this.player, zone)) {
          this.player.setInteractable(null);
        }
      }
    });

    // Câmera focada no jogador com zoom estilo Stardew Valley (2x)
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(1.8);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.gameEvents.on(EVENTS.PLAYER_EXHAUSTED, this.handleExhaustion, this);
  }

  update(time, delta) {
    this.player.update();
    this.gameState.time.update(delta);
  }

  createStreetEnvironment(width, height) {
    // 1. Pavimento de Paralelepípedos Dourados (Referência Imagem 1)
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        this.add.image(x + 16, y + 16, 'cobblestone');
      }
    }

    this.collidersGroup = this.physics.add.staticGroup();

    // 2. Lojas na parte superior (Threads Boutique, Salon Flamingo, Kitnets e Metrô)
    // Threads Clothing Boutique
    this.add.image(100, 75, 'threads_shop');
    const threadsCol = this.add.zone(100, 75, 116, 70);
    this.physics.add.existing(threadsCol, true);
    this.collidersGroup.add(threadsCol);

    // Salon Flamingo
    this.add.image(230, 75, 'salon_shop');
    const salonCol = this.add.zone(230, 75, 106, 70);
    this.physics.add.existing(salonCol, true);
    this.collidersGroup.add(salonCol);

    // Kitnets Metropolitanos (Seu Prédio)
    this.add.image(360, 75, 'apt_building');
    const aptCol = this.add.zone(360, 75, 96, 70);
    this.physics.add.existing(aptCol, true);
    this.collidersGroup.add(aptCol);

    // Estação de Metrô
    this.add.image(500, 90, 'subway_station');
    const subCol = this.add.zone(500, 90, 76, 50);
    this.physics.add.existing(subCol, true);
    this.collidersGroup.add(subCol);

    // 3. Guarda-corpo e Palmeiras com Luzinhas na parte inferior (Referência Imagem 1)
    for (let x = 32; x < width - 32; x += 64) {
      this.add.image(x + 32, 290, 'street_railing');
      const railCol = this.add.zone(x + 32, 292, 64, 18);
      this.physics.add.existing(railCol, true);
      this.collidersGroup.add(railCol);
    }

    // Vasos de Palmeiras Tropicais com Luzinhas penduradas
    this.add.image(120, 315, 'palm_planter');
    this.add.image(300, 315, 'palm_planter');
    this.add.image(480, 315, 'palm_planter');
  }

  createStreetInteractables() {
    this.interactionZones = this.physics.add.group();

    // 1. Porta do Threads Clothing Boutique
    const threadsDoor = new Interactable(this, 140, 115, 'door', 'Entrar na Boutique Threads', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Threads Boutique',
        text: 'Bem-vinda à Threads! Roupas elegantes e casuais para enfrentar o expediente na metrópole.',
        options: [
          {
            label: 'Comprar Look Novo (-R$ 80, -25 Estresse)',
            action: () => this.buyClothes()
          },
          {
            label: 'Só olhar a vitrine',
            action: () => {}
          }
        ]
      });
    });
    this.registerInteractable(threadsDoor);

    // 2. Porta do Salon Flamingo
    const salonDoor = new Interactable(this, 248, 115, 'door', 'Entrar no Salon Flamingo', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Salon Flamingo',
        text: 'Olá! Que tal um corte de cabelo moderno ou um café expresso enquanto espera?',
        options: [
          {
            label: 'Corte de Cabelo & Penteado (-R$ 45, -20 Estresse)',
            action: () => this.getHaircut()
          },
          {
            label: 'Elogiar as rosas da entrada',
            action: () => {
              this.gameState.status.modifyStress(-5);
              this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
                text: 'As rosas perfumadas acalmaram seus ânimos! (-5 Estresse)',
                type: 'success'
              });
            }
          }
        ]
      });
    });
    this.registerInteractable(salonDoor);

    // 3. Portaria do seu Prédio (Kitnet)
    const aptDoor = new Interactable(this, 375, 115, 'door', 'Entrar no seu Kitnet', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('KitnetScene');
      });
    });
    this.registerInteractable(aptDoor);

    // 4. Catraca do Metrô
    const subwayEntrance = new Interactable(this, 500, 115, 'metro_sign', 'Descer ao Metrô (R$ 5,00)', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Metrô Subterrâneo',
        text: 'Acesso às linhas que cortam a metrópole. Deseja validar sua passagem de R$ 5,00?',
        options: [
          {
            label: 'Validar Bilhete (-R$ 5,00)',
            action: () => this.enterSubway()
          },
          {
            label: 'Ficar na superfície',
            action: () => {}
          }
        ]
      });
    });
    this.registerInteractable(subwayEntrance);
  }

  registerInteractable(interactable) {
    interactable.interactionZone.parentInteractable = interactable;
    this.interactionZones.add(interactable.interactionZone);
  }

  buyClothes() {
    if (this.gameState.status.money < 80) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Saldo bancário insuficiente para comprar roupas novas!',
        type: 'warning'
      });
      return;
    }
    this.gameState.time.advanceMinutes(30);
    this.gameState.status.modifyMoney(-80);
    this.gameState.status.modifyStress(-25);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '👗 Visual renovado na Threads! Autoestima nas alturas (-25 Estresse).',
      type: 'success'
    });
  }

  getHaircut() {
    if (this.gameState.status.money < 45) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Sem dinheiro para o corte no momento!',
        type: 'warning'
      });
      return;
    }
    this.gameState.time.advanceMinutes(45);
    this.gameState.status.modifyMoney(-45);
    this.gameState.status.modifyStress(-20);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '✂️ Corte impecável no Salon Flamingo (-20 Estresse)!',
      type: 'success'
    });
  }

  enterSubway() {
    if (this.gameState.status.money < 5) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Saldo insuficiente no bilhete!',
        type: 'warning'
      });
      return;
    }
    this.gameState.status.modifyMoney(-5);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MetroScene');
    });
  }

  handleExhaustion() {
    this.player.lock();
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.gameState.status.penalizeExhaustion();
      this.gameState.time.advanceToNextDay();
      this.scene.start('KitnetScene');
    });
  }
}
