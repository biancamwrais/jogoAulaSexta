import Phaser from 'phaser';

export class Interactable extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, prompt, onInteract) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Corpo estático

    this.prompt = prompt;
    this.onInteract = onInteract;

    // Área de detecção de proximidade ligeiramente maior que o sprite
    this.interactionZone = scene.add.zone(x, y, this.width + 24, this.height + 24);
    scene.physics.add.existing(this.interactionZone, true);
  }

  trigger(player) {
    if (this.onInteract) {
      this.onInteract(player);
    }
  }
}
