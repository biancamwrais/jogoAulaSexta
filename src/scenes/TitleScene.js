import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Fundo Gradiente da Metrópole (Pôr do sol / Noite neon)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0e1a, 0x0a0e1a, 0x1e1b4b, 0x31102b, 1);
    bg.fillRect(0, 0, width, height);

    // 2. Silhuetas de Arranha-céus com Janelas Iluminadas no Horizonte
    this.createSkyline(width, height);

    // 3. Título Principal Estilizado
    const titleGlow = this.add.text(width / 2, 110, 'CITY RUT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '44px',
      color: '#00f2fe'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: titleGlow,
      alpha: { from: 0.8, to: 1 },
      scale: { from: 0.98, to: 1.02 },
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    const subTitle = this.add.text(width / 2, 160, 'ROTINA URBANA • LIFE SIM 2D', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#f9d423',
      letterSpacing: 2
    }).setOrigin(0.5);

    const desc = this.add.text(width / 2, 195, 'Equilibre trabalho, estudos noturnos, condução pública, aluguel e sanidade.', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '15px',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5);

    // 4. Botão Principal: [ ▶ COMEÇAR JOGO ]
    this.createStartButton(width / 2, 275);

    // 5. Botão: [ 💾 CONTINUAR JOGO ] (se houver save)
    if (SaveSystem.hasSave()) {
      this.createContinueButton(width / 2, 340);
    } else {
      this.createHelpButton(width / 2, 340);
    }

    // 6. Rodapé Informativo
    this.add.text(width / 2, height - 30, 'Inspirado em Stardew Valley & Persona • Use WASD e E para interagir', {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '13px',
      color: '#64748b'
    }).setOrigin(0.5);
  }

  createSkyline(width, height) {
    const skyline = this.add.graphics();
    // Prédios distantes escuros
    skyline.fillStyle(0x0f172a, 0.9);
    for (let x = 0; x < width; x += 55) {
      const bHeight = 120 + ((x * 37) % 110);
      skyline.fillRect(x, height - bHeight, 50, bHeight);

      // Janelinhas amarelas e cianas acesas
      for (let y = height - bHeight + 15; y < height - 20; y += 18) {
        if ((x + y) % 3 === 0) {
          skyline.fillStyle(0xfef08a, 0.7);
          skyline.fillRect(x + 10, y, 6, 8);
        } else if ((x + y) % 5 === 0) {
          skyline.fillStyle(0x38bdf8, 0.7);
          skyline.fillRect(x + 28, y, 6, 8);
        }
      }
      skyline.fillStyle(0x0f172a, 0.9);
    }
  }

  createStartButton(x, y) {
    const btnContainer = this.add.container(x, y);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x22c55e, 1); // Verde Stardew vivo
    btnBg.fillRoundedRect(-160, -25, 320, 50, 10);
    btnBg.lineStyle(3, 0xffffff, 0.9);
    btnBg.strokeRoundedRect(-160, -25, 320, 50, 10);

    const btnText = this.add.text(0, 0, '▶ COMEÇAR JOGO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    btnContainer.setSize(320, 50);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x16a34a, 1);
      btnBg.fillRoundedRect(-165, -27, 330, 54, 10);
      btnBg.lineStyle(3, 0xfacc15, 1);
      btnBg.strokeRoundedRect(-165, -27, 330, 54, 10);
      btnContainer.setScale(1.04);
    });

    btnContainer.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x22c55e, 1);
      btnBg.fillRoundedRect(-160, -25, 320, 50, 10);
      btnBg.lineStyle(3, 0xffffff, 0.9);
      btnBg.strokeRoundedRect(-160, -25, 320, 50, 10);
      btnContainer.setScale(1.0);
    });

    btnContainer.on('pointerdown', () => {
      this.startGame();
    });
  }

  createContinueButton(x, y) {
    const btnContainer = this.add.container(x, y);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x0284c7, 1);
    btnBg.fillRoundedRect(-140, -20, 280, 40, 8);
    btnBg.lineStyle(2, 0xffffff, 0.8);
    btnBg.strokeRoundedRect(-140, -20, 280, 40, 8);

    const btnText = this.add.text(0, 0, '💾 CONTINUAR SALVO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    btnContainer.setSize(280, 40);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => btnContainer.setScale(1.03));
    btnContainer.on('pointerout', () => btnContainer.setScale(1.0));
    btnContainer.on('pointerdown', () => this.startGame());
  }

  createHelpButton(x, y) {
    const btnContainer = this.add.container(x, y);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1e293b, 0.9);
    btnBg.fillRoundedRect(-140, -20, 280, 40, 8);
    btnBg.lineStyle(1.5, 0x64748b, 1);
    btnBg.strokeRoundedRect(-140, -20, 280, 40, 8);

    const btnText = this.add.text(0, 0, '❓ CONTROLES & DICAS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    btnContainer.setSize(280, 40);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      btnText.setColor('#00f2fe');
    });
    btnContainer.on('pointerout', () => {
      btnText.setColor('#94a3b8');
    });
    btnContainer.on('pointerdown', () => {
      alert('🎮 CONTROLES:\n\n• WASD ou Setas: Mover a personagem\n• E ou Espaço: Interagir com lojas, portas e objetos\n• M: Metrô / Mapa\n• Canto Superior: Energia, Sanidade e Relógio\n• Pague os boletos no dia certo para evitar o despejo!');
    });
  }

  startGame() {
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('StreetScene');
      this.scene.launch('UIScene');
      this.scene.launch('DialogueOverlay');
    });
  }
}
