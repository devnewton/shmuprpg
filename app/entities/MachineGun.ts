/// <reference path="../../typings/phaser.d.ts"/>
import {Bullet} from "./Bullet.ts";

export class CircularGun extends Phaser.Group {

    bulletSpeed = 600;
    fireRate = 200;
    nextFireTime = 0;

    constructor(game: Phaser.Game, maxBullets: number = 64) {
        super(game);
        for (let i = 0; i < maxBullets; ++i) {
            this.add(this.createBullet());
        }
    }

    createBullet(): Bullet {
        return new Bullet(this.game);
    }

    fire(fromX: number, fromY: number, angle: number) {
        if (this.game.time.time >= this.nextFireTime) {
            const bullet = <Bullet>this.getFirstExists(false);
            if (bullet) {
                bullet.fire(fromX, fromY, angle, this.bulletSpeed, 0, 0);
                this.nextFireTime = this.game.time.time + this.fireRate;
            }
        }
    }
}