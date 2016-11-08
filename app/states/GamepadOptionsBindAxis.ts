/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";
import {ShmuprpgGame} from "../ShmuprpgGame";


export class GamepadOptionsBindAxis extends AbstractState {

    bindings = [
        { label: 'Pull move X axis', localStorageKeySuffix: 'moveXAxis' },
        { label: 'Pull move Y axis', localStorageKeySuffix: 'moveYAxis' },
        { label: 'Pull shoot X axis', localStorageKeySuffix: 'shootXAxis' },
        { label: 'Pull shoot Y axis', localStorageKeySuffix: 'shootYAxis' }
    ];

    currentBinding: number = 0;
    pad: Phaser.SinglePad;
    padIndex = 1;
    waitForNoInput: number;

    constructor() {
        super();
    }

    preload() {
        MenuButton.preload(this.game);
    }

    init(padIndex: number, binding: number = 0) {
        padIndex = padIndex || 1;
        this.padIndex = 1;
        this.pad = this.input.gamepad['pad' + this.padIndex];
        if (binding >= this.bindings.length) {
            this.currentBinding = 0;
            (this.game as ShmuprpgGame).controls.useCustomGamepadLayout(padIndex);
            this.game.state.start('GamepadOptions');
        } else {
            this.currentBinding = binding;
        }
        this.waitForNoInput = 60;
    }

    create() {
        super.create();
        let logo = this.game.add.text(this.game.world.centerX, 0, this.bindings[this.currentBinding].label, { font: "68px monospace", fill: 'white' });
        logo.scale.x = 2;
        logo.scale.y = 2;
        logo.anchor.setTo(0.5, 0);
        new MenuButton(this.game, "Back", 500, 900, () => this.game.state.start('GamepadOptions'));
    }

    update() {
        super.update();
        let activationZone = Math.max(0.99, Math.min(0.8, 4 * this.pad.deadZone));
        for (var k in Phaser.Gamepad) {
            if (k.startsWith('AXIS_')) {
                let axisCode = Phaser.Gamepad[k];
                if (Math.abs(this.pad.axis(axisCode)) >= activationZone) {
                    if (this.waitForNoInput > 0) {
                        return;
                    } else {
                        localStorage.setItem('gamepad' + this.padIndex + '.layout.custom.' + this.bindings[this.currentBinding].localStorageKeySuffix, axisCode);
                        this.game.state.start('GamepadOptionsBindAxis', true, false, this.padIndex, this.currentBinding + 1);
                        return;
                    }
                }
            }
        }
        this.waitForNoInput--;
    }
}
