/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";

export class DemoEnding extends AbstractState {

    constructor() {
        super();
    }

    preload() {
        this.game.load.image('demo_ending', 'help/demo_ending.png');
        MenuButton.preload(this.game);
    }

    create() {
        super.create();
        let logo = this.game.add.sprite(0, 0, 'demo_ending');
        new MenuButton(this.game, "Back", 500, 900, () => this.game.state.start('Title'));
    }
}
