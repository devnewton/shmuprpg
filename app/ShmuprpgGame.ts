/// <reference path="../typings/phaser.d.ts"/>
import {Intro} from "./states/Intro.ts";
import {Title} from "./states/Title.ts";
import {Level} from "./states/Level.ts";
import {Controls} from "./utils/Controls.ts";
import { nanim } from "./utils/nanim.ts";

export class ShmuprpgGame extends Phaser.Game {
    
    nanim: nanim.NanimLoader;
    controls: Controls;

    constructor() {
        super(1920, 1080, Phaser.CANVAS, 'game', {
            preload: () => this.preloadGame()
            , create: () => this.createGame()
        });
        this.nanim = new nanim.NanimLoader(this);
        this.state.add('Intro', Intro);
        this.state.add('Title', Title);
        this.state.add('Level', Level);
    }

    preloadGame() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
    }

    createGame() {
        this.controls = new Controls(this);
        this.state.start('Level');
    }
}