/// <reference path="../../typings/phaser.d.ts"/>
import { ShmuprpgGame } from "../ShmuprpgGame.ts";
import { MachineGun } from "./MachineGun.ts";

export class Hero {

    game: ShmuprpgGame;
    sprite: Phaser.Sprite;
    weapon: MachineGun;

    constructor(game: Phaser.Game) {
        this.game = <ShmuprpgGame>game;
        this.game.load.atlasXML('tobira', 'sprites/lpc/characters/tobira.png', 'sprites/lpc/characters/lpc.xml')
        this.game.load.spritesheet('bullet', 'sprites/lpc/shootemup/effects01.png', 16, 16, 4);
    }

    create() {
        this.sprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'tobira');
        this.game.addSpriteAnimation(this.sprite, 'lpc.hurt', 6);
        this.game.addSpriteAnimation(this.sprite, 'lpc.walk.back', 9);
        this.game.addSpriteAnimation(this.sprite, 'lpc.walk.front', 9);
        this.game.addSpriteAnimation(this.sprite, 'lpc.walk.left', 9);
        this.game.addSpriteAnimation(this.sprite, 'lpc.walk.right', 9);
        this.sprite.play("lpc.hurt", 0, false);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.setSize(16, 16, 24, 48);
        this.sprite.body.collideWorldBounds = true;
        this.weapon = new MachineGun(this.game);
        this.game.add.existing(this.weapon);
    }

    update() {
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;

        if (this.game.controls.isGoingLeft()) {
            this.sprite.body.velocity.x = -300;
        } else if (this.game.controls.isGoingRight()) {
            this.sprite.body.velocity.x = 300;
        }

        if (this.game.controls.isGoingUp()) {
            this.sprite.body.velocity.y = -300;
        } else if (this.game.controls.isGoingDown()) {
            this.sprite.body.velocity.y = 300;
        }

        if (this.sprite.body.velocity.y < 0) {
            this.sprite.play("lpc.walk.back", 8, false);
        } else if (this.sprite.body.velocity.y > 0) {
            this.sprite.play("lpc.walk.front", 8, false);
        } else if (this.sprite.body.velocity.x < 0) {
            this.sprite.play("lpc.walk.left", 8, false);
        } else if (this.sprite.body.velocity.x > 0) {
            this.sprite.play("lpc.walk.right", 8, false);
        } else {
            this.sprite.play("lpc.hurt", 0, false);
        }

        const shootingAngle = this.game.controls.shootingAngle(this.sprite.x, this.sprite.y);
        if (shootingAngle != null) {
            this.weapon.fire(this.sprite.x, this.sprite.y, shootingAngle);
        }

    }
}
