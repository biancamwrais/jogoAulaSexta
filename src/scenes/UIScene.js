import Phaser from 'phaser';
import { EVENTS } from '../utils/Constants.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.gameEvents = this.game.registry.get('events');
    this.gameState = this.game.registry.get('gameState');

    this.createHudBar();
    this.createNotificationsContainer();
    this.createBillsModal();

    // Ouvintes de eventos do sistema
    this.gameEvents.on(EVENTS.TIME_TICK, this.updateTimeDisplay, this);
    this.gameEvents.on(EVENTS.STATUS_CHANGED, this.updateStatusDisplay, this);
    this.gameEvents.on(EVENTS.SHOW_NOTIFICATION, this.showNotification, this);
    this.gameEvents.on(EVENTS.GAME_OVER, this.showGameOverModal, this);

    // Atualização inicial
    this.updateTimeDisplay(this.gameState.time.getTimeData());
    this.updateStatusDisplay(this.gameState.status.getStatusData());
  }

  createHudBar() {
    const width = this.cameras.main.width;

    // Fundo superior do HUD (Vidro escuro translúcido com borda neon)
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x0e131f, 0.9);
    hudBg.fillRect(0, 0, width, 46);
    hudBg.lineStyle(1, 0x00f2fe, 0.4);
    hudBg.lineBetween(0, 46, width, 46);

    // 1. Bloco de Tempo / Calendário
    this.dateText = this.add.text(16, 8, 'SEG • DIA 01', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#00f2fe'
    });

    this.timeText = this.add.text(16, 24, '07:00 AM ☀️', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#f9d423'
    });

    // 2. Bloco de Barras de Status (Energia e Estresse)
    // Barra de Energia
    this.add.text(200, 8, 'ENERGIA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#8b949e'
    });
    this.energyBarBg = this.add.graphics();
    this.energyBarBg.fillStyle(0x21262d, 1);
    this.energyBarBg.fillRect(200, 22, 130, 14);
    this.energyBar = this.add.graphics();
    this.energyText = this.add.text(265, 29, '100/100', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Barra de Estresse
    this.add.text(360, 8, 'ESTRESSE / SANIDADE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#8b949e'
    });
    this.stressBarBg = this.add.graphics();
    this.stressBarBg.fillStyle(0x21262d, 1);
    this.stressBarBg.fillRect(360, 22, 130, 14);
    this.stressBar = this.add.graphics();
    this.stressText = this.add.text(425, 29, '15/100', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 3. Saldo Bancário
    this.moneyText = this.add.text(width - 240, 14, 'R$ 350,00', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#52b788'
    });

    // 4. Botão de Boletos
    const billsBtn = this.add.text(width - 120, 12, '📄 BOLETOS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      backgroundColor: '#1d3557',
      color: '#ffffff',
      padding: { x: 8, y: 6 }
    }).setInteractive({ useHandCursor: true });

    billsBtn.on('pointerdown', () => this.toggleBillsModal());
    billsBtn.on('pointerover', () => billsBtn.setStyle({ backgroundColor: '#457b9d' }));
    billsBtn.on('pointerout', () => billsBtn.setStyle({ backgroundColor: '#1d3557' }));

    // 5. Botão de Salvar
    const saveBtn = this.add.text(width - 40, 12, '💾', {
      fontSize: '16px',
      backgroundColor: '#1d3557',
      padding: { x: 6, y: 2 }
    }).setInteractive({ useHandCursor: true });

    saveBtn.on('pointerdown', () => {
      const res = SaveSystem.save(this.gameState);
      if (res.success) {
        this.showNotification({ text: 'Jogo salvo com sucesso no navegador!', type: 'success' });
      }
    });
  }

  updateTimeDisplay(timeData) {
    if (!this.dateText || !this.timeText) return;

    const shortDay = timeData.dayOfWeek.slice(0, 3).toUpperCase();
    const dayFormatted = String(timeData.day).padStart(2, '0');
    this.dateText.setText(`${shortDay} • DIA ${dayFormatted} (MÊS ${timeData.month})`);

    const icon = timeData.isDaytime ? '☀️' : '🌙';
    this.timeText.setText(`${timeData.timeString} ${icon}`);
  }

  updateStatusDisplay(statusData) {
    if (!this.energyBar || !this.stressBar) return;

    // Atualiza Energia
    const energyWidth = Math.max(0, (statusData.energy / statusData.maxEnergy) * 126);
    this.energyBar.clear();
    let energyColor = 0x2ec4b6; // Verde água
    if (statusData.energy < 50) energyColor = 0xff9f1c; // Amarelo
    if (statusData.energy < 25) energyColor = 0xe71d36; // Vermelho crítico

    this.energyBar.fillStyle(energyColor, 1);
    this.energyBar.fillRect(202, 24, energyWidth, 10);
    this.energyText.setText(`${statusData.energy}/${statusData.maxEnergy}`);

    // Atualiza Estresse
    const stressWidth = Math.max(0, (statusData.stress / statusData.maxStress) * 126);
    this.stressBar.clear();
    let stressColor = 0x4cc9f0; // Azul suave
    if (statusData.stress > 50) stressColor = 0xf72585; // Rosa/Roxo alerta
    if (statusData.isBurnout) stressColor = 0xd90429; // Vermelho Burnout

    this.stressBar.fillStyle(stressColor, 1);
    this.stressBar.fillRect(362, 24, stressWidth, 10);
    this.stressText.setText(`${statusData.stress}/${statusData.maxStress}`);

    // Saldo
    this.moneyText.setText(`R$ ${statusData.money.toFixed(2).replace('.', ',')}`);
    if (statusData.money < 100) {
      this.moneyText.setColor('#ff4d6d');
    } else {
      this.moneyText.setColor('#52b788');
    }
  }

  createNotificationsContainer() {
    this.notificationBox = this.add.container(this.cameras.main.width / 2, 85);
    this.notificationBox.setAlpha(0);
  }

  showNotification({ text, type = 'info' }) {
    this.notificationBox.removeAll(true);

    const colors = {
      info: { bg: 0x1d3557, border: 0x457b9d },
      success: { bg: 0x134e4a, border: 0x2dd4bf },
      warning: { bg: 0x78350f, border: 0xfbbf24 },
      danger: { bg: 0x7f1d1d, border: 0xf87171 },
      alert: { bg: 0x581c87, border: 0xc084fc }
    };

    const palette = colors[type] || colors.info;

    const bg = this.add.graphics();
    bg.fillStyle(palette.bg, 0.95);
    bg.fillRoundedRect(-240, -18, 480, 36, 6);
    bg.lineStyle(1, palette.border, 1);
    bg.strokeRoundedRect(-240, -18, 480, 36, 6);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 460 }
    }).setOrigin(0.5);

    this.notificationBox.add([bg, label]);

    this.tweens.add({
      targets: this.notificationBox,
      alpha: 1,
      y: 75,
      duration: 250,
      hold: 3500,
      yoyo: true,
      onComplete: () => {
        this.notificationBox.setY(85);
      }
    });
  }

  createBillsModal() {
    this.billsModal = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.billsModal.setVisible(false);
    this.billsModal.setDepth(200);
  }

  toggleBillsModal() {
    const isVisible = !this.billsModal.visible;
    this.billsModal.setVisible(isVisible);

    if (isVisible) {
      this.refreshBillsModal();
    }
  }

  refreshBillsModal() {
    this.billsModal.removeAll(true);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0e17, 0.95);
    bg.fillRoundedRect(-220, -150, 440, 300, 10);
    bg.lineStyle(2, 0x00f2fe, 0.8);
    bg.strokeRoundedRect(-220, -150, 440, 300, 10);

    const title = this.add.text(0, -120, 'GERENCIADOR DE BOLETOS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#00f2fe'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(190, -135, '✕', {
      fontSize: '18px',
      color: '#ff4d6d'
    }).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleBillsModal());

    this.billsModal.add([bg, title, closeBtn]);

    const summary = this.gameState.economy.getBillsSummary();
    let yOffset = -70;

    summary.forEach(bill => {
      const isPaid = bill.paid;
      const cardBg = this.add.graphics();
      cardBg.fillStyle(isPaid ? 0x16232e : 0x221a24, 0.8);
      cardBg.fillRoundedRect(-200, yOffset, 400, 50, 6);

      const billText = this.add.text(-185, yOffset + 10, `${bill.name} (Vence Dia ${bill.dueDay})`, {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#e6edf3'
      });

      const valueText = this.add.text(-185, yOffset + 28, `Valor: R$ ${bill.amount.toFixed(2)}`, {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '12px',
        color: '#f9d423'
      });

      let actionElement;
      if (isPaid) {
        actionElement = this.add.text(140, yOffset + 16, 'PAGO ✅', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          color: '#2ec4b6'
        }).setOrigin(0.5);
      } else {
        actionElement = this.add.text(140, yOffset + 16, 'PAGAR', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          backgroundColor: '#00f2fe',
          color: '#000000',
          padding: { x: 8, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        actionElement.on('pointerdown', () => {
          const res = this.gameState.economy.payBill(bill.id);
          if (res.success) {
            this.refreshBillsModal();
          } else {
            this.showNotification({ text: res.message, type: 'warning' });
          }
        });
      }

      this.billsModal.add([cardBg, billText, valueText, actionElement]);
      yOffset += 60;
    });
  }

  showGameOverModal({ reason, message }) {
    const modal = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    modal.setDepth(300);

    const bg = this.add.graphics();
    bg.fillStyle(0x05070a, 0.98);
    bg.fillRect(-300, -180, 600, 360);
    bg.lineStyle(2, 0xff007f, 1);
    bg.strokeRect(-300, -180, 600, 360);

    const title = this.add.text(0, -110, 'FIM DA LINHA NA METRÓPOLE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ff007f'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -30, message || 'Você não suportou a pressão da rotina urbana.', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '15px',
      color: '#e6edf3',
      align: 'center',
      wordWrap: { width: 520 }
    }).setOrigin(0.5);

    const restartBtn = this.add.text(0, 80, 'TENTAR NOVAMENTE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      backgroundColor: '#00f2fe',
      color: '#000000',
      padding: { x: 14, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      SaveSystem.clear();
      window.location.reload();
    });

    modal.add([bg, title, desc, restartBtn]);
  }
}
