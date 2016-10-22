/// <reference path="../../typings/phaser.d.ts"/>
import { ShmuprpgGame } from "../ShmuprpgGame.ts";
import { CircularGun } from "./MachineGun.ts";
import { Controls } from "../utils/Controls.ts";
import {Bullet} from "./Bullet.ts";

export class Hero extends Phaser.Sprite {

    weapon: HeroMachineGun;
    controls: Controls;

    constructor(game: Phaser.Game) {
        super(game, game.world.centerX, game.world.centerY, 'tobira');
        this.health = 3;
        this.controls = (<ShmuprpgGame>game).controls;
        (<ShmuprpgGame>game).addSpriteAnimation(this, 'lpc.hurt', 6);
        (<ShmuprpgGame>game).addSpriteAnimation(this, 'lpc.walk.back', 9);
        (<ShmuprpgGame>game).addSpriteAnimation(this, 'lpc.walk.front', 9);
        (<ShmuprpgGame>game).addSpriteAnimation(this, 'lpc.walk.left', 9);
        (<ShmuprpgGame>game).addSpriteAnimation(this, 'lpc.walk.right', 9);
        this.play("lpc.hurt", 0, false);
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.setSize(16, 16, 24, 48);
        this.body.collideWorldBounds = true;
        this.weapon = new HeroMachineGun(this.game);
        this.game.add.existing(this.weapon);
    }

    static preload(game: Phaser.Game) {
        game.load.atlasXML('tobira', 'sprites/lpc/characters/tobira.png', 'sprites/lpc/characters/lpc.xml');
        game.load.atlasXML('bullets', 'sprites/lpc/shootemup/effects01.png', 'sprites/lpc/shootemup/bullets.xml');
    }

    update() {
        super.update();
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (this.controls.isGoingLeft()) {
            this.body.velocity.x = -300;
        } else if (this.controls.isGoingRight()) {
            this.body.velocity.x = 300;
        }

        if (this.controls.isGoingUp()) {
            this.body.velocity.y = -300;
        } else if (this.controls.isGoingDown()) {
            this.body.velocity.y = 300;
        }

        if (this.body.velocity.y < 0) {
            this.play("lpc.walk.back", 8, false);
        } else if (this.body.velocity.y > 0) {
            this.play("lpc.walk.front", 8, false);
        } else if (this.body.velocity.x < 0) {
            this.play("lpc.walk.left", 8, false);
        } else if (this.body.velocity.x > 0) {
            this.play("lpc.walk.right", 8, false);
        } else {
            this.play("lpc.hurt", 0, false);
        }

        const shootingAngle = this.controls.shootingAngle(this.x, this.y);
        if (shootingAngle != null) {
            this.weapon.fire(this.x, this.y, shootingAngle);
        }

    }

    invincible = false;

    damage(amount: number): Phaser.Sprite {
        if (!this.invincible) {
            this.invincible = true;
            this.game.add.tween(this).from({ tint: 0xFF0000 }).to({ tint: 0xFFFFFF }, 1000, Phaser.Easing.Linear.None, true, 0, 4, false).onComplete.add(() => this.invincible = false);
            super.damage(amount);
            if (!this.alive) {
                this.game.state.start('GameOver')
            }
        }
        return this;
    }
}

class HeroMachineGun extends CircularGun {
    createBullet(): Bullet {
        return new Bullet(this.game, 'bullet.blue');
    }
}