import { EVENTS } from '../utils/Constants.js';
import { eventBus, gameState } from '../state/gameState.js';

export class MetroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MetroScene' });
  }

  create() {
    this.gameEvents = eventBus;
    this.gameState = gameState;

    const width = 480;
    const height = 270;

    this.cameras.main.setZoom(2);
    this.cameras.main.centerOn(width / 2, height / 2);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.createTrainInterior(width, height);
    this.startCommuteSimulation();
  }

  update(time, delta) {
    this.gameState.time.update(delta);
  }

  createTrainInterior(width, height) {
    // 1. Paredes metálicas do vagão de metrô
    const carBg = this.add.graphics();
    carBg.fillStyle(0x1a2130, 1);
    carBg.fillRect(40, 30, width - 80, height - 60);

    // Janelas com efeito de velocidade (luzes do túnel passando)
    for (let x = 80; x < width - 100; x += 90) {
      const windowFrame = this.add.graphics();
      windowFrame.fillStyle(0x05070d, 1);
      windowFrame.fillRect(x, 50, 60, 40);
      windowFrame.lineStyle(2, 0x485671, 1);
      windowFrame.strokeRect(x, 50, 60, 40);

      // Luzes piscando do túnel
      const lightStreak = this.add.rectangle(x + 30, 70, 40, 2, 0xf9d423, 0.6);
      this.tweens.add({
        targets: lightStreak,
        x: x - 20,
        alpha: { from: 0.8, to: 0 },
        duration: 300,
        repeat: -1
      });
    }

    // Barras de apoio amarelas (típicas de metrô)
    const poleGraphics = this.add.graphics();
    poleGraphics.fillStyle(0xf9d423, 0.9);
    poleGraphics.fillRect(140, 30, 4, height - 60);
    poleGraphics.fillRect(240, 30, 4, height - 60);
    poleGraphics.fillRect(340, 30, 4, height - 60);

    // Título e display no teto
    this.statusDisplay = this.add.text(width / 2, 42, 'PRÓXIMA ESTAÇÃO: CENTRO EMPRESARIAL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#00f2fe'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.statusDisplay,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Passageiros aglomerados (silhuetas em pixel art)
    const crowdGroup = this.add.graphics();
    crowdGroup.fillStyle(0x2d3748, 0.85);
    for (let i = 0; i < 9; i++) {
      const px = 70 + i * 40;
      crowdGroup.fillRect(px, 140, 18, 50); // corpos
      crowdGroup.fillCircle(px + 9, 130, 8); // cabeças
    }
  }

  startCommuteSimulation() {
    // Avança 35 minutos de trajeto padrão
    this.gameState.time.advanceMinutes(35);
    this.gameState.status.modifyEnergy(-12);
    this.gameState.status.modifyStress(8);

    // Sorteia um evento aleatório da "Dungeon Urbana"
    this.time.delayedCall(1200, () => {
      this.triggerRandomCommuteEvent();
    });
  }

  triggerRandomCommuteEvent() {
    const eventsList = [
      {
        title: 'VAGÃO HIPERLOTADO',
        text: 'O ar-condicionado parou e as portas mal fecham com tanta gente empurrando.',
        options: [
          {
            label: 'Colocar fone e focar na música (-5 Estresse)',
            action: () => {
              this.gameState.status.modifyStress(-5);
              this.showArrivalPrompt();
            }
          },
          {
            label: 'Reclamar em voz alta (+15 Estresse)',
            action: () => {
              this.gameState.status.modifyStress(15);
              this.showArrivalPrompt();
            }
          }
        ]
      },
      {
        title: 'AMBULANTE CRIATIVO',
        text: '"Olha a bala de café e o fone com som de cinema por apenas 5 reais!"',
        options: [
          {
            label: 'Comprar fone/bala (-R$ 5, -8 Estresse)',
            action: () => {
              this.gameState.status.modifyMoney(-5);
              this.gameState.status.modifyStress(-8);
              this.showArrivalPrompt();
            }
          },
          {
            label: 'Ignorar e olhar para o chão',
            action: () => {
              this.showArrivalPrompt();
            }
          }
        ]
      },
      {
        title: 'BANCO VAGO SURPRESA',
        text: 'Um assento desocupou bem na sua frente!',
        options: [
          {
            label: 'Sentar imediatamente (+15 Energia)',
            action: () => {
              this.gameState.status.modifyEnergy(15);
              this.showArrivalPrompt();
            }
          },
          {
            label: 'Ceder lugar a uma senhora idosa (-10 Estresse)',
            action: () => {
              this.gameState.status.modifyStress(-10);
              this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
                text: 'A senhora sorriu e agradeceu de coração. Sua sanidade melhorou!',
                type: 'success'
              });
              this.showArrivalPrompt();
            }
          }
        ]
      },
      {
        title: 'FALHA DE SINALIZAÇÃO',
        text: 'O trem freia bruscamente no túnel escuro. "Aguardando movimentação à frente".',
        options: [
          {
            label: 'Respirar fundo e ter paciência (30m, +10 Est)',
            action: () => {
              this.gameState.time.advanceMinutes(30);
              this.gameState.status.modifyStress(10);
              this.showArrivalPrompt();
            }
          }
        ]
      }
    ];

    const chosen = Phaser.Math.RND.pick(eventsList);

    this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
      speaker: chosen.title,
      text: chosen.text,
      options: chosen.options
    });
  }

  showArrivalPrompt() {
    this.time.delayedCall(800, () => {
      this.gameEvents.emit(EVENTS.SHOW_DIALOGUE, {
        speaker: 'Estação Central Chegando',
        text: 'As portas abrem do lado esquerdo. Você chegou à área comercial da metrópole.',
        options: [
          {
            label: 'Trabalhar no Escritório/Estágio (4h, +R$120)',
            action: () => this.workShift()
          },
          {
            label: 'Retornar ao Bairro',
            action: () => this.returnToStreet()
          }
        ]
      });
    });
  }

  workShift() {
    if (this.gameState.status.energy < 30) {
      this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
        text: 'Exaustão no trabalho: Seu chefe chamou sua atenção!',
        type: 'danger'
      });
      this.gameState.time.advanceMinutes(180);
      this.gameState.status.modifyStress(25);
      this.gameState.status.modifyMoney(60.00);
      this.returnToStreet();
      return;
    }

    this.gameState.time.advanceMinutes(240); // 4 horas de turno
    this.gameState.status.modifyEnergy(-35);
    this.gameState.status.modifyStress(16);
    this.gameState.status.modifyMoney(120.00);
    this.gameState.status.addWorkExp(25);

    this.gameEvents.emit(EVENTS.SHOW_NOTIFICATION, {
      text: '💼 Turno de estágio concluído! +R$ 120,00 recebidos.',
      type: 'success'
    });

    this.returnToStreet();
  }

  returnToStreet() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StreetScene', { spawnX: 310, spawnY: 150 });
    });
  }
}
