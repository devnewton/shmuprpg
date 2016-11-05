/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState"; // you import only AClass

export class Intro extends AbstractState {

    constructor() {
        super();
    }

    preload() {
        this.game.load.video('intro', 'intro/intro.webm');
    }

    create() {
        super.create();
        var video = this.game.add.video('intro');
        video.play();
        video.addToWorld(this.game.world.centerX, this.game.world.centerY, 0.5, 0.5);
        video.onComplete.add(() => this.game.state.start('Title'));
    }
}
