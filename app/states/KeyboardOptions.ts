/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";
import { ShmuprpgGame } from "../ShmuprpgGame";


export class KeyboardOptions extends AbstractState {

    constructor() {
        super();
    }

    preload() {
        MenuButton.preload(this.game);
    }

    create() {
        super.create();
        let logo = this.game.add.text(this.game.world.centerX, 0, 'Choose keyboard layout',{font: "68px monospace", fill: 'white'});
        logo.scale.x = 2;
        logo.scale.y = 2;
        logo.anchor.setTo(0.5, 0);

        new MenuButton(this.game, "Azerty zsqd ikjl", 500, 300, () => {
            (<ShmuprpgGame>this.game).controls.useAzertyLayout();
            this.game.state.start('Options');
        });
        new MenuButton(this.game, "Qwerty wsad ikjl", 500, 450, () => {
            (<ShmuprpgGame>this.game).controls.useQwertyLayout();
            this.game.state.start('Options');
        });
        new MenuButton(this.game, "Others ⬆⬇⬅➡ ikjl", 500, 600, () => {
            (<ShmuprpgGame>this.game).controls.useOtherLayout();
            this.game.state.start('Options');
        });
        new MenuButton(this.game, "Back", 500, 750, () => this.game.state.start('Options'));
    }
}
