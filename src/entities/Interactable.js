import Phaser from 'phaser';

export class Interactable extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, prompt, onInteract, radius = 42) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Corpo físico estático para colisão

    this.prompt = prompt;
    this.onInteract = onInteract;
    this.interactionRadius = radius;
  }

  isNear(player) {
    if (!player) return false;
    return Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) <= this.interactionRadius;
  }

  trigger(player) {
    if (this.onInteract) {
      this.onInteract(player);
    }
  }
}
