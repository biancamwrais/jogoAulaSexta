import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 130;
    this.isLocked = false;
    this.currentInteractable = null;

    // Configuração do corpo de colisão (ajustado para a base dos pés)
    this.body.setSize(18, 14);
    this.body.setOffset(3, 18);
    this.setCollideWorldBounds(true);

    // Controles por teclado
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // Balão flutuante de interação
    this.promptText = scene.add.text(x, y - 24, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#1b2234',
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setDepth(100).setVisible(false);
  }

  update() {
    this.promptText.setPosition(this.x, this.y - 24);

    if (this.isLocked) {
      this.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Normalização para velocidade constante nas diagonais
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.setVelocity(vx * this.speed, vy * this.speed);

    // Verificação da tecla de interação (E ou Espaço)
    const justPressedInteract = Phaser.Input.Keyboard.JustDown(this.wasd.interact) ||
                                 Phaser.Input.Keyboard.JustDown(this.wasd.space);

    if (justPressedInteract && this.currentInteractable) {
      this.currentInteractable.trigger(this);
    }
  }

  setInteractable(interactable) {
    this.currentInteractable = interactable;
    if (interactable) {
      this.promptText.setText(`[E] ${interactable.prompt}`);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }
  }

  lock() {
    this.isLocked = true;
    this.setVelocity(0, 0);
    this.promptText.setVisible(false);
  }

  unlock() {
    this.isLocked = false;
  }
}
