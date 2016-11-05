/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";

export class Options extends AbstractState {

    constructor() {
        super();
    }

    preload() {
        MenuButton.preload(this.game);
    }

    create() {
        super.create();
        let logo = this.game.add.text(this.game.world.centerX, 0, 'Options', { font: "120px monospace", fill: 'white' });
        logo.scale.x = 2;
        logo.scale.y = 2;
        logo.anchor.setTo(0.5, 0);

        let y = 150;
        new MenuButton(this.game, "Keyboard", 500, y += 150, () => this.game.state.start('KeyboardOptions'));
        if (this.input.gamepad.supported) {
            new MenuButton(this.game, "Gamepad", 500, y += 150, () => this.game.state.start('GamepadOptions'));
        }
        new MenuButton(this.game, "Back", 500, y += 150, () => this.game.state.start('Title'));
    }
}
