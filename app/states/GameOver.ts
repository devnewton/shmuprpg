/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts"; // you import only AClass
import {MenuButton} from "../ui/MenuButton.ts";

export class GameOver extends AbstractState {

    constructor() {
        super();
    }

    preload() {
        this.game.load.image('gameover', 'gameover/gameover.png');
    }

    create() {
        super.create();
        this.game.add.image(0, 0, 'gameover');
        new MenuButton(this.game, "Main menu", 500, 900, () => this.game.state.start('Title'));
    }
}
