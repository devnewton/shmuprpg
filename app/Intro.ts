/// <reference path="../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts"; // you import only AClass

export class Intro extends AbstractState {

    game: Phaser.Game;

    constructor() {
        super();
    }

    preload() {
        this.game.load.video('intro', 'intro.webm');
        //this.game.load.image('logo', 'logo.png');
    }

    create() {
        super.create();
        /*var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);*/
        var video = this.game.add.video('intro', );
        video.play();
        video.addToWorld(this.game.world.centerX, this.game.world.centerY, 0.5, 0.5);
        video.onComplete.add(() => this.game.state.start('Title'));
    }
}
