/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";

export class Help extends AbstractState {

    constructor() {
        super();
    }

    preload() {
        this.game.load.image('help', 'help/help.png');
        MenuButton.preload(this.game);
    }

    create() {
        super.create();
        let logo = this.game.add.sprite(0, 0, 'help');
        new MenuButton(this.game, "Back", 500, 900, () => this.game.state.start('Title'));
    }
}
