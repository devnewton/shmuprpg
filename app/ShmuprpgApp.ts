/// <reference path="../typings/phaser.d.ts"/>
import {Intro} from "./Intro.ts";
import {Title} from "./Title.ts";

class ShmuprpgApp {

    game: Phaser.Game;

    constructor() {
        this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'game', {
            preload: () => this.preload()
            , create: () => this.create()
        });
        this.game.state.add('Intro', Intro);
        this.game.state.add('Title', Title);
    }

    preload() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
    }

    create() {
        this.game.state.start('Intro');
    }
}

export = new ShmuprpgApp
