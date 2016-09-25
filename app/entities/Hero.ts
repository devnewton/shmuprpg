/// <reference path="../../typings/phaser.d.ts"/>
import { ShmuprpgGame } from "../ShmuprpgGame.ts";

export class Hero {

    game: ShmuprpgGame;
    sprite: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        this.game = <ShmuprpgGame>game;
        this.game.nanim.load('tobira', 'sprites/lpc.json', 'sprites/tobira.png')
    }

    create() {
        this.sprite = this.game.nanim.sprite(this.game.world.centerX, this.game.world.centerY, 'tobira')
        this.sprite.scale.x = 2;
        this.sprite.scale.y = 2;
        this.sprite.play("lpc.spellcast.front", 2, true);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    }

    update() {
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;

        if (this.game.controls.isGoingLeft()) {
            this.sprite.body.velocity.x = -300;
            this.sprite.play("lpc.walk.left", 8, false);
        } else if (this.game.controls.isGoingRight()) {
            this.sprite.body.velocity.x = 300;
            this.sprite.play("lpc.walk.right", 8, false);
        }

        if (this.game.controls.isGoingUp()) {
            this.sprite.body.velocity.y = -300;
            this.sprite.play("lpc.walk.back", 8, false);
        } else if (this.game.controls.isGoingDown()) {
            this.sprite.body.velocity.y = 300;
            this.sprite.play("lpc.walk.front", 8, false);
        }
        
        if(this.sprite.body.velocity.x == 0 && this.sprite.body.velocity.y == 0) {
            this.sprite.play("lpc.hurt", 0, false);
        }

    }
}
