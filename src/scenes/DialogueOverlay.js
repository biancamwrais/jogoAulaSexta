import Phaser from 'phaser';
import { EVENTS } from '../utils/Constants.js';

export class DialogueOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'DialogueOverlay' });
  }

  create() {
    this.gameEvents = this.game.registry.get('events');
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.container = this.add.container(width / 2, height - 90);
    this.container.setVisible(false);
    this.container.setDepth(150);

    // Fundo da caixa de diálogo
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x0c101c, 0.95);
    boxBg.fillRoundedRect(-380, -60, 760, 120, 10);
    boxBg.lineStyle(2, 0x00f2fe, 0.8);
    boxBg.strokeRoundedRect(-380, -60, 760, 120, 10);

    // Nome do personagem / Emissor
    this.speakerBg = this.add.graphics();
    this.speakerBg.fillStyle(0x1d3557, 1);
    this.speakerBg.fillRoundedRect(-360, -82, 180, 26, 4);

    this.speakerText = this.add.text(-350, -78, 'PENSAMENTO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00f2fe'
    });

    // Texto do diálogo
    this.dialogueText = this.add.text(-350, -35, '', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      lineSpacing: 4,
      wordWrap: { width: 700 }
    });

    // Container de opções/escolhas
    this.optionsContainer = this.add.container(0, 15);

    this.container.add([boxBg, this.speakerBg, this.speakerText, this.dialogueText, this.optionsContainer]);

    // Ouvintes
    this.gameEvents.on(EVENTS.SHOW_DIALOGUE, this.showDialogue, this);
    this.gameEvents.on(EVENTS.HIDE_DIALOGUE, this.hideDialogue, this);
  }

  showDialogue({ speaker = 'PENSAMENTO', text = '', options = [], onOptionSelected = null }) {
    this.speakerText.setText(speaker.toUpperCase());
    this.dialogueText.setText(text);
    this.optionsContainer.removeAll(true);

    if (options && options.length > 0) {
      let xOffset = -320;
      options.forEach((opt, index) => {
        const btn = this.add.text(xOffset, 0, `[${index + 1}] ${opt.label}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px',
          backgroundColor: '#16233b',
          color: '#00f2fe',
          padding: { x: 8, y: 6 }
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#00f2fe', color: '#000000' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#16233b', color: '#00f2fe' }));
        btn.on('pointerdown', () => {
          this.hideDialogue();
          if (opt.action) opt.action();
          if (onOptionSelected) onOptionSelected(opt);
        });

        this.optionsContainer.add(btn);
        xOffset += 240;
      });
    } else {
      // Botão padrão de continuar
      const closePrompt = this.add.text(320, 32, 'Clique para continuar ▶', {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '12px',
        color: '#8b949e'
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

      closePrompt.on('pointerdown', () => this.hideDialogue());
      this.optionsContainer.add(closePrompt);
    }

    this.container.setVisible(true);
  }

  hideDialogue() {
    this.container.setVisible(false);
    const player = this.game.registry.get('player');
    if (player) player.unlock();
  }
}
