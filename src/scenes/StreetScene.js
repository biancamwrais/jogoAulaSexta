import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Interactable } from '../entities/Interactable.js';
import { EVENTS } from '../utils/Constants.js';

export class StreetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StreetScene' });
  }

  create(data) {
    this.gameEvents = this.game.registry.get('events');
    this.gameState = this.game.registry.get('gameState');

    const width = 640;
    const height = 360;

    this.physics.world.setBounds(0, 0, width, height);

    this.createStreetEnvironment(width, height);
    this.createStreetInteractables();

    // Posição inicial do jogador
    const spawnX = data?.from === 'kitnet' ? 120 : (data?.spawnX ?? 200);
    const spawnY = data?.from === 'kitnet' ? 130 : (data?.spawnY ?? 200);

    this.player = new Player(this, spawnX, spawnY);
    this.game.registry.set('player', this.player);

    this.physics.add.collider(this.player, this.buildingsGroup);

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

    // Câmera seguindo o jogador na rua
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(1.8);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.gameEvents.on(EVENTS.PLAYER_EXHAUSTED, this.handleExhaustion, this);
  }

  update(time, delta) {
    this.player.update();
    this.gameState.time.update(delta);
  }

  createStreetEnvironment(width, height) {
    // 1. Calçada e Asfalto
    for (let x = 0; x < width; x += 32) {
      for (let y = 0; y < height; y += 32) {
        if (y >= 180 && y <= 280) {
          this.add.image(x + 16, y + 16, 'asphalt');
        } else {
          this.add.image(x + 16, y + 16, 'sidewalk');
        }
      }
    }

    // Faixas de pedestre / marcações da rua
    const roadMarkings = this.add.graphics();
    roadMarkings.fillStyle(0xf9d423, 0.8);
    for (let x = 16; x < width; x += 64) {
      roadMarkings.fillRect(x, 228, 32, 4);
    }

    // 2. Prédios de fundo / Fachadas (Grupo com colisão)
    this.buildingsGroup = this.physics.add.staticGroup();

    // Edifício Residencial (Seu prédio)
    this.createBuildingFacade(60, 40, 120, 80, 0x2b2d42, 'SEU PRÉDIO (KITNETS)');
    // Estação de Metrô
    this.createBuildingFacade(240, 40, 140, 80, 0x1d3557, 'METRÔ LINHA 4');
    // Faculdade Noturna
    this.createBuildingFacade(450, 40, 150, 80, 0x3d0c11, 'FACULDADE METROPOLITANA');
    // Padaria na parte inferior da rua
    this.createBuildingFacade(180, 310, 140, 60, 0x582f0e, 'PADARIA CENTRAL');
  }

  createBuildingFacade(x, y, w, h, color, label) {
    const b = this.add.graphics();
    b.fillStyle(color, 1);
    b.fillRect(x, y, w, h);
    b.lineStyle(2, 0xffffff, 0.2);
    b.strokeRect(x, y, w, h);

    this.add.text(x + w / 2, y + 20, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Bloco físico para colisão
    const collider = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(collider, true);
    this.buildingsGroup.add(collider);
  }

  createStreetInteractables() {
    this.interactionZones = this.physics.add.group();

    // 1. Porta de Entrada do Seu Prédio
    const apartmentDoor = new Interactable(this, 120, 110, 'door', 'Entrar no Kitnet', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('KitnetScene', { spawnX: 240, spawnY: 210 });
      });
    });
    this.registerInteractable(apartmentDoor);

    // 2. Catraca do Metrô (Linha para o Trabalho/Centro)
    const metroEntrance = new Interactable(this, 310, 110, 'metro_sign', 'Pegar o Metrô (R$ 5,00)', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Estação de Metrô',
        text: 'Acesso à Linha Amarela / Vermelha. Horário de pico metropolitano. Deseja embarcar?',
        options: [
          {
            label: 'Embarcar para o Centro (-R$5, -15 En)',
            action: () => this.enterMetro()
          },
          {
            label: 'Ficar na superfície',
            action: () => {}
          }
        ]
      });
    });
    this.registerInteractable(metroEntrance);

    // 3. Portaria da Faculdade Noturna
    const collegeEntrance = new Interactable(this, 520, 110, 'door', 'Entrar na Faculdade', () => {
      this.player.lock();
      const currentHour = this.gameState.time.hour;
      const isClassTime = currentHour >= 19 && currentHour <= 22;

      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Portaria da Faculdade',
        text: isClassTime 
          ? 'As aulas do período noturno estão acontecendo nas salas 304 e 305.' 
          : `A faculdade abre as aulas às 19:00. Agora são ${this.gameState.time.getTimeData().timeString}.`,
        options: isClassTime ? [
          {
            label: 'Assistir Aula Completa (3h, +4h Estudo)',
            action: () => this.attendClass()
          },
          {
            label: 'Só assinar lista de chamada (Matar aula)',
            action: () => this.skipClass()
          }
        ] : [
          {
            label: 'Estudar na Biblioteca Livre (1h)',
            action: () => this.studyInLibrary()
          }
        ]
      });
    });
    this.registerInteractable(collegeEntrance);

    // 4. Padaria Central (Café e Salgado)
    const bakery = new Interactable(this, 250, 310, 'door', 'Comprar na Padaria', () => {
      this.player.lock();
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Atendente da Padaria',
        text: 'Bom dia, jovem! O que vai ser hoje na correria?',
        options: [
          {
            label: 'Pingado + Pão na Chapa (-R$ 12, +35 En)',
            action: () => this.buyBakeryCombo()
          },
          {
            label: 'Bater papo amigável (-5 Estresse)',
            action: () => this.chatWithBarista()
          }
        ]
      });
    });
    this.registerInteractable(bakery);
  }

  registerInteractable(interactable) {
    interactable.interactionZone.parentInteractable = interactable;
    this.interactionZones.add(interactable.interactionZone);
  }

  enterMetro() {
    if (this.gameState.status.money < 5) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Saldo insuficiente no Bilhete Único para o metrô!',
        type: 'warning'
      });
      return;
    }

    this.gameState.status.modifyMoney(-5.00);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MetroScene');
    });
  }

  attendClass() {
    if (this.gameState.status.energy < 20) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Você dormiu em cima da carteira durante a aula toda!',
        type: 'warning'
      });
      this.gameState.time.advanceMinutes(180);
      this.gameState.status.modifyEnergy(-10);
      return;
    }

    this.gameState.time.advanceMinutes(180);
    this.gameState.status.modifyEnergy(-25);
    this.gameState.status.modifyStress(12);
    this.gameState.status.addStudy(4);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '🎓 Aula concluída com sucesso! +4 horas acadêmicas computadas.',
      type: 'success'
    });
  }

  skipClass() {
    this.gameState.time.advanceMinutes(30);
    this.gameState.status.modifyStress(-10);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: 'Assinou a lista e foi tomar ar fresco. (-10 Estresse)',
      type: 'info'
    });
  }

  studyInLibrary() {
    this.gameState.time.advanceMinutes(60);
    this.gameState.status.modifyEnergy(-12);
    this.gameState.status.addStudy(1.5);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '📖 Biblioteca silenciosa: +1.5h de estudo focado.',
      type: 'info'
    });
  }

  buyBakeryCombo() {
    if (this.gameState.status.money < 12) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Sem saldo para o pão na chapa!',
        type: 'warning'
      });
      return;
    }

    this.gameState.time.advanceMinutes(20);
    this.gameState.status.modifyMoney(-12.00);
    this.gameState.status.modifyEnergy(35);
    this.gameState.status.modifyStress(-8);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '🥖 Pão na chapa crocante e café quente (+35 Energia, -8 Estresse).',
      type: 'success'
    });
  }

  chatWithBarista() {
    this.gameState.time.advanceMinutes(15);
    this.gameState.status.modifyStress(-6);
    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: 'Uma conversa calorosa sobre o clima e a vida. (-6 Estresse)',
      type: 'info'
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
