/// <reference path="../../typings/phaser.d.ts"/>
import { ShmuprpgGame } from "../ShmuprpgGame";

export class Bullet extends Phaser.Sprite {

    bulletAnimation: string;

    constructor(game: Phaser.Game, animation = 'bullet.red', atlas = 'bullets') {
        super(game, 0, 0, atlas);
        this.bulletAnimation = animation;
        (<ShmuprpgGame>game).addSpriteAnimation(this, this.bulletAnimation, 4);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
    }

    fire(fromX: number, fromY: number, angle: number, speed: number, gravityX: number, gravityY: number) {
        this.reset(fromX, fromY, 1);
        this.scale.set(1);
        this.game.physics.arcade.velocityFromRotation(angle, speed, this.body.velocity);
        this.angle = angle;
        this.body.gravity.set(gravityX, gravityY);
        this.play(this.bulletAnimation, 4, true);
    }
}
