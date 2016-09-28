/// <reference path="../../typings/phaser.d.ts"/>

export class Bullet extends Phaser.Sprite {

    constructor(game: Phaser.Game) {
        super(game, 0, 0, 'bullet');
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
    }
    
    fire(fromX: number, fromY: number, angle: number, speed: number, gravityX: number, gravityY: number) {
        this.reset(fromX, fromY);
        this.scale.set(1);
        this.game.physics.arcade.velocityFromRotation(angle, speed, this.body.velocity);
        this.angle = angle;
        this.body.gravity.set(gravityX, gravityY);
    }
}
