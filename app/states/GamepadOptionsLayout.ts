/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";
import {ShmuprpgGame} from "../ShmuprpgGame";

export class GamepadOptionsLayout extends AbstractState {
    padIndex: number;

    constructor() {
        super();
    }

    preload() {
        MenuButton.preload(this.game);
    }

    init(padIndex : number) {
        this.padIndex = padIndex || 1;
    }

    create() {
        super.create();
        let title = this.game.add.text(this.game.world.centerX, 0, 'Choose gamepad layout', { font: "68px monospace", fill: 'white' });
        title.scale.x = 2;
        title.scale.y = 2;
        title.anchor.setTo(0.5, 0);

        new MenuButton(this.game, "Xbox", 500, 200, () => {
            (this.game as ShmuprpgGame).controls.useXboxLayout(this.padIndex);
            this.game.state.start('Options');
        });
        new MenuButton(this.game, "Custom", 500, 350, () => {
            this.game.state.start('GamepadOptionsBindAxis', true, false, this.padIndex);
        });
        new MenuButton(this.game, "Back", 500, 500, () => this.game.state.start('Options'));
    }
}

class GamepadMenuButton extends MenuButton {
    pad: Phaser.SinglePad;
    activePadTint: number;
    constructor(pad: Phaser.SinglePad, activePadTint: number, label: string, x: number, y: number, callback: Function) {
        super(pad.game, label, x, y, callback);
        this.pad = pad;
        this.activePadTint = activePadTint;
    }

    update() {
        super.update();

        if (this.isPadActive()) {
            this.tint = this.activePadTint;
        } else {
            this.tint = 0xFFFFFF;
        }
    }

    isPadActive(): boolean {
        for (let b = 0; b < 16; ++b) {
            let button = this.pad.getButton(b);
            if (button && button.isDown) {
                return true;
            }
        }
        for (let a = 0; a < 16; ++a) {
            if (Math.abs(this.pad.axis(a)) > this.pad.deadZone) {
                return true;
            }
        }
        return false;
    }

}
