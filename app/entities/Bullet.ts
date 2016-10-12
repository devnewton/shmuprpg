/// <reference path="../../typings/phaser.d.ts"/>
import { ShmuprpgGame } from "../ShmuprpgGame";
import {Vulnerable} from "./features/Vulnerable.ts";

export class Bullet extends Phaser.Sprite implements Vulnerable {

    constructor(game: Phaser.Game) {
        super(game, 0, 0, 'bullets');
        (<ShmuprpgGame>game).addSpriteAnimation(this, 'bullet.red', 4);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
    }

    getVulnerableRectangles(): Array<Phaser.Rectangle> {
        return [new Phaser.Rectangle(this.x, this.y, this.width, this.height)];
    }

    fire(fromX: number, fromY: number, angle: number, speed: number, gravityX: number, gravityY: number) {
        this.reset(fromX, fromY, 1);
        this.scale.set(1);
        this.game.physics.arcade.velocityFromRotation(angle, speed, this.body.velocity);
        this.angle = angle;
        this.body.gravity.set(gravityX, gravityY);
        this.play('bullet.red', 4, true);
    }
}
