/// <reference path="../../typings/phaser.d.ts"/>
import {Bird} from "./Bird.ts";

export class BirdFlock extends Phaser.Group {

    flyRate = 1000;
    target: Phaser.Sprite;
    private nextFlyTime = 0;

    constructor(target: Phaser.Sprite, maxBirds: number = 8) {
        super(target.game);
        this.target = target;
        for (let i = 0; i < maxBirds; ++i) {
            this.add(this.createBird());
        }
    }

    static preload(game: Phaser.Game) {
        game.load.spritesheet('bird', 'sprites/oga/tower-defense-prototyping-assets-4-monsters-some-tiles-a-background-image/bird.png', 48, 48, 5);
        game.load.spritesheet('before-bird', 'sprites/oga/rpg-special-move-effects/VioletSlash.png', 64, 64, 4);
        game.load.spritesheet('bird-explosion', 'sprites/oga/space_shooter_pack/explosion.png', 16, 16, 5);
    }

    update() {
        super.update();
        const x = this.game.world.randomX;
        const y = this.game.world.randomY;
        const angle = Phaser.Math.angleBetween(x, y, this.target.x, this.target.y);
        this.fly(x, y, angle);
    }

    private createBird(): Bird {
        return new Bird(this.game);
    }

    private fly(fromX: number, fromY: number, angle: number) {
        if (this.game.time.time >= this.nextFlyTime) {
            const bird = this.getFirstExists(false);
            if (bird) {
                bird.fly(fromX, fromY, angle);
                this.nextFlyTime = this.game.time.time + this.flyRate;
            }
        }
    }
}