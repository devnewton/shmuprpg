/// <reference path="../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts"; // you import only AClass

export class Title extends AbstractState {

    game: Phaser.Game;

    constructor() {
        super();
    }

    preload() {
        this.game.load.image('logo', 'logo.png');
    }

    create() {
        super.create();
        var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);
    }
}
