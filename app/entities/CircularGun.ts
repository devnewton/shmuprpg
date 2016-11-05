/// <reference path="../../typings/phaser.d.ts"/>
import {Bullet} from "./Bullet";

export class CircularGun extends Phaser.Group {

    bulletSpeed = 300;
    fireRate = 800;
    nextFireTime = 0;
    bulletsByShots: number;

    constructor(game: Phaser.Game, maxBullets: number = 64, bulletsByShots = 8) {
        super(game);
        this.bulletsByShots = bulletsByShots;
        for (let i = 0; i < maxBullets; ++i) {
            this.add(this.createBullet());
        }
    }

    createBullet(): Bullet {
        return new Bullet(this.game);
    }

    fire(fromX: number, fromY: number) {
        if (this.game.time.time >= this.nextFireTime) {
            for (let b = 1; b <= this.bulletsByShots; ++b) {
                const bullet = <Bullet>this.getFirstExists(false);
                if (bullet) {
                    bullet.fire(fromX, fromY, b * 2 * Math.PI / this.bulletsByShots, this.bulletSpeed, 0, 0);
                }
            }
            this.nextFireTime = this.game.time.time + this.fireRate;
        }
    }
}