import Phaser from 'phaser';
import { EVENTS } from '../utils/Constants.js';
import { eventBus, gameState } from '../state/gameState.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.gameEvents = eventBus;
    this.gameState = gameState;

    this.createTopLeftStatusBars();
    this.createPhoneWidget();
    this.createBottomHotbar();
    this.createNotificationsContainer();
    this.createBillsModal();

    // Ouvintes de eventos do sistema
    this.gameEvents.on(EVENTS.TIME_TICK, this.updateTimeDisplay, this);
    this.gameEvents.on(EVENTS.STATUS_CHANGED, this.updateStatusDisplay, this);
    this.gameEvents.on(EVENTS.SHOW_NOTIFICATION, this.showNotification, this);
    this.gameEvents.on(EVENTS.GAME_OVER, this.showGameOverModal, this);

    // Atualização inicial com dados atuais
    this.updateTimeDisplay(this.gameState.time.getTimeData());
    this.updateStatusDisplay(this.gameState.status.getStatusData());
  }

  createTopLeftStatusBars() {
    // 1. Barra de Sanidade / Saúde (Coração Vermelho - Imagem 1)
    const healthBg = this.add.graphics();
    healthBg.fillStyle(0xffffff, 0.95);
    healthBg.fillRoundedRect(16, 14, 150, 24, 6);
    healthBg.lineStyle(2, 0x334155, 1);
    healthBg.strokeRoundedRect(16, 14, 150, 24, 6);

    // Ícone de Coração
    this.add.text(22, 17, '❤️', { fontSize: '15px' });

    // Fundo da barra interna
    const healthInner = this.add.graphics();
    healthInner.fillStyle(0x334155, 0.3);
    healthInner.fillRoundedRect(46, 20, 112, 12, 4);

    this.healthBar = this.add.graphics();

    // 2. Barra de Energia / Bateria (Bateria Verde - Imagem 1)
    const energyBg = this.add.graphics();
    energyBg.fillStyle(0xffffff, 0.95);
    energyBg.fillRoundedRect(16, 44, 150, 24, 6);
    energyBg.lineStyle(2, 0x334155, 1);
    energyBg.strokeRoundedRect(16, 44, 150, 24, 6);

    // Ícone de Bateria
    this.add.text(22, 48, '🔋', { fontSize: '14px' });

    // Fundo da barra interna
    const energyInner = this.add.graphics();
    energyInner.fillStyle(0x334155, 0.3);
    energyInner.fillRoundedRect(46, 50, 112, 12, 4);

    this.energyBar = this.add.graphics();
  }

  createPhoneWidget() {
    const width = this.cameras.main.width;
    const px = width - 170;
    const py = 12;

    // Moldura do Celular / Widget estilo Imagem 1
    const phoneBg = this.add.graphics();
    phoneBg.fillStyle(0xeff6ff, 0.98);
    phoneBg.fillRoundedRect(px, py, 155, 88, 10);
    phoneBg.lineStyle(2, 0x94a3b8, 1);
    phoneBg.strokeRoundedRect(px, py, 155, 88, 10);

    // Topo verde do celular (barra de status)
    const phoneTop = this.add.graphics();
    phoneTop.fillStyle(0x4ade80, 1); // Verde lima suave
    phoneTop.fillRoundedRect(px + 2, py + 2, 151, 16, { tl: 8, tr: 8, bl: 0, br: 0 });

    this.add.text(px + 10, py + 4, 'METRÓPOLE • VER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#064e3b'
    });

    this.add.text(px + 130, py + 4, '📶🔋', {
      fontSize: '8px'
    });

    // Ícone do clima (Sol / Lua)
    this.weatherIcon = this.add.text(px + 10, py + 25, '☀️', {
      fontSize: '26px'
    });

    // Dia do mês em destaque com sublinhado (ex: "3 qua.")
    this.dayNumberText = this.add.text(px + 65, py + 24, '01', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b'
    });

    const underline = this.add.graphics();
    underline.fillStyle(0x64748b, 1);
    underline.fillRect(px + 65, py + 46, 26, 2);

    this.dayOfWeekText = this.add.text(px + 96, py + 28, 'seg.', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '13px',
      color: '#475569'
    });

    // Linha divisória horizontal
    const divider = this.add.graphics();
    divider.fillStyle(0xe2e8f0, 1);
    divider.fillRect(px + 8, py + 52, 139, 1);

    // Relógio com ícone analógico pequeno
    this.clockText = this.add.text(px + 10, py + 58, '🕒 07:00 am', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '12px',
      fontWeight: '600',
      color: '#334155'
    });

    // Carteira / Dinheiro
    this.moneyBadge = this.add.container(px + 10, py + 72);
    this.moneyText = this.add.text(0, 0, '💰 R$ 350,00', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#15803d'
    });
    this.moneyBadge.add(this.moneyText);
  }

  createBottomHotbar() {
    // Barra de Ferramentas / Itens Rápidos no rodapé esquerdo (Inspirado na Imagem 1)
    const hotbar = this.add.container(24, this.cameras.main.height - 48);

    // Botão circular amarelo (Ação rápida de trânsito/trabalho)
    const circleBtn = this.add.graphics();
    circleBtn.fillStyle(0xfacc15, 1);
    circleBtn.fillCircle(18, 18, 18);
    circleBtn.lineStyle(2, 0x854d0e, 1);
    circleBtn.strokeCircle(18, 18, 18);

    const hammerIcon = this.add.text(18, 18, '🚇', {
      fontSize: '16px'
    }).setOrigin(0.5);

    // Cartão 1: Bilhete Único / Cartão de Transporte
    const card1 = this.createHotbarSlot(48, '💳', 'Bilhete');
    
    // Cartão 2: Boletos Pendentes
    const card2 = this.createHotbarSlot(88, '📄', 'Boletos', () => this.toggleBillsModal());

    // Cartão 3: Salvar Jogo
    const card3 = this.createHotbarSlot(128, '💾', 'Salvar', () => {
      const res = SaveSystem.save(this.gameState);
      if (res.success) {
        this.showNotification({ text: 'Progresso salvo com sucesso no navegador!', type: 'success' });
      }
    });

    hotbar.add([circleBtn, hammerIcon, card1, card2, card3]);
  }

  createHotbarSlot(x, iconEmoji, label, onClick = null) {
    const slot = this.add.container(x, 0);
    const bg = this.add.rectangle(16, 18, 32, 36, 0xffffff, 0.95);
    bg.setStrokeStyle(1.5, 0x94a3b8);

    const icon = this.add.text(16, 18, iconEmoji, { fontSize: '15px' }).setOrigin(0.5);
    slot.add([bg, icon]);

    if (onClick) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0xe2e8f0));
      bg.on('pointerout', () => bg.setFillStyle(0xffffff));
      bg.on('pointerdown', onClick);
    }

    return slot;
  }

  updateTimeDisplay(timeData) {
    if (!this.clockText) return;

    this.weatherIcon.setText(timeData.isDaytime ? '☀️' : '🌙');
    this.dayNumberText.setText(String(timeData.day).padStart(2, '0'));

    const shortDays = ['seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.', 'dom.'];
    this.dayOfWeekText.setText(shortDays[timeData.dayOfWeekIndex ?? 0]);

    const period = timeData.hour < 12 ? 'am' : 'pm';
    this.clockText.setText(`🕒 ${timeData.timeString} ${period}`);
  }

  updateStatusDisplay(statusData) {
    if (!this.healthBar || !this.energyBar) return;

    // 1. Barra de Sanidade / Saúde (100 - Estresse)
    const sanity = Math.max(0, 100 - statusData.stress);
    const sanityWidth = Math.max(0, (sanity / 100) * 112);
    this.healthBar.clear();
    this.healthBar.fillStyle(0xef4444, 1); // Vermelho vibrante
    this.healthBar.fillRoundedRect(46, 20, sanityWidth, 12, 3);

    // 2. Barra de Energia (Verde vibrante)
    const energyWidth = Math.max(0, (statusData.energy / statusData.maxEnergy) * 112);
    this.energyBar.clear();
    let energyColor = 0x22c55e; // Verde Stardew
    if (statusData.energy < 30) energyColor = 0xf59e0b; // Laranja alerta
    this.energyBar.fillStyle(energyColor, 1);
    this.energyBar.fillRoundedRect(46, 50, energyWidth, 12, 3);

    // Saldo
    this.moneyText.setText(`💰 R$ ${statusData.money.toFixed(2).replace('.', ',')}`);
  }

  createNotificationsContainer() {
    this.notificationBox = this.add.container(this.cameras.main.width / 2, 60);
    this.notificationBox.setAlpha(0);
    this.notificationBox.setDepth(300);
  }

  showNotification({ text, type = 'info' }) {
    this.notificationBox.removeAll(true);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.fillRoundedRect(-220, -18, 440, 36, 8);
    bg.lineStyle(2, 0x38bdf8, 1);
    bg.strokeRoundedRect(-220, -18, 440, 36, 8);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 420 }
    }).setOrigin(0.5);

    this.notificationBox.add([bg, label]);

    this.tweens.add({
      targets: this.notificationBox,
      alpha: 1,
      y: 50,
      duration: 250,
      hold: 3000,
      yoyo: true,
      onComplete: () => {
        this.notificationBox.setY(60);
      }
    });
  }

  createBillsModal() {
    this.billsModal = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.billsModal.setVisible(false);
    this.billsModal.setDepth(500);
  }

  toggleBillsModal() {
    const isVisible = !this.billsModal.visible;
    this.billsModal.setVisible(isVisible);
    if (isVisible) this.refreshBillsModal();
  }

  refreshBillsModal() {
    this.billsModal.removeAll(true);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.96);
    bg.fillRoundedRect(-200, -140, 400, 280, 10);
    bg.lineStyle(2, 0x38bdf8, 1);
    bg.strokeRoundedRect(-200, -140, 400, 280, 10);

    const title = this.add.text(0, -110, 'CONTAS E BOLETOS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(175, -125, '✕', {
      fontSize: '18px',
      color: '#f43f5e'
    }).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleBillsModal());

    this.billsModal.add([bg, title, closeBtn]);

    const summary = this.gameState.economy.getBillsSummary();
    let yOffset = -60;

    summary.forEach(bill => {
      const card = this.add.graphics();
      card.fillStyle(bill.paid ? 0x1e293b : 0x334155, 0.9);
      card.fillRoundedRect(-180, yOffset, 360, 48, 6);

      const name = this.add.text(-165, yOffset + 10, `${bill.name} (Dia ${bill.dueDay})`, {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#ffffff'
      });

      const val = this.add.text(-165, yOffset + 28, `R$ ${bill.amount.toFixed(2)}`, {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '12px',
        color: '#facc15'
      });

      let btn;
      if (bill.paid) {
        btn = this.add.text(130, yOffset + 16, 'PAGO ✅', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#4ade80'
        }).setOrigin(0.5);
      } else {
        btn = this.add.text(130, yOffset + 16, 'PAGAR', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          backgroundColor: '#38bdf8',
          color: '#0f172a',
          padding: { x: 6, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
          const res = this.gameState.economy.payBill(bill.id);
          if (res.success) {
            this.refreshBillsModal();
          } else {
            this.showNotification({ text: res.message, type: 'warning' });
          }
        });
      }

      this.billsModal.add([card, name, val, btn]);
      yOffset += 56;
    });
  }

  showGameOverModal({ reason, message }) {
    const modal = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    modal.setDepth(600);

    const bg = this.add.graphics();
    bg.fillStyle(0x020617, 0.98);
    bg.fillRect(-280, -160, 560, 320);
    bg.lineStyle(2, 0xf43f5e, 1);
    bg.strokeRect(-280, -160, 560, 320);

    const title = this.add.text(0, -90, 'FIM DA ROTINA URBANA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#f43f5e'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -20, message, {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 480 }
    }).setOrigin(0.5);

    const restartBtn = this.add.text(0, 70, 'RECOMEÇAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      backgroundColor: '#38bdf8',
      color: '#0f172a',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      SaveSystem.clear();
      window.location.reload();
    });

    modal.add([bg, title, desc, restartBtn]);
  }
}
