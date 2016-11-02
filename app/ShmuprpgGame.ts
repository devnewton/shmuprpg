/// <reference path="../typings/phaser.d.ts"/>
import {Intro} from "./states/Intro.ts";
import {Title} from "./states/Title.ts";
import {DemoEnding} from "./states/DemoEnding.ts";
import {Help} from "./states/Help.ts";
import {Options} from "./states/Options.ts";
import {KeyboardOptions} from "./states/KeyboardOptions.ts";
import {GamepadOptions} from "./states/GamepadOptions.ts";
import {Level} from "./states/Level.ts";
import {GameOver} from "./states/GameOver.ts";
import {Controls} from "./utils/Controls.ts";

export class ShmuprpgGame extends Phaser.Game {

    controls: Controls;

    constructor() {
        super(1920, 1080, Phaser.CANVAS, 'game', {
            preload: () => this.preloadGame()
            , create: () => this.createGame()
        });
        this.state.add('Intro', Intro);
        this.state.add('Title', Title);
        this.state.add('Help', Help);
        this.state.add('Options', Options);
        this.state.add('KeyboardOptions', KeyboardOptions);
        this.state.add('GamepadOptions', GamepadOptions);
        this.state.add('Level', Level);
        this.state.add('GameOver', GameOver);
        this.state.add('DemoEnding', DemoEnding);
    }

    preloadGame() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
    }

    createGame() {
        this.controls = new Controls(this);
        this.state.start('Title');
    }

    addSpriteAnimation(sprite: Phaser.Sprite, animationName: string, frameCount: number): Phaser.Animation {
        return sprite.animations.add(animationName, this.genAnimArray(animationName, frameCount));
    }

    private genAnimArray(name: string, n: number) {
        let result = new Array<string>();
        for (let i = 0; i < n; ++i) {
            result.push(name + i);
        }
        return result;
    }

}