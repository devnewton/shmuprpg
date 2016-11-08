/// <reference path="../../typings/phaser.d.ts"/>
import {AbstractState} from "./AbstractState";
import {MenuButton} from "../ui/MenuButton";
import { ShmuprpgGame } from "../ShmuprpgGame";


export class KeyboardOptionsBindKey extends AbstractState {

    bindings = [
        { label: 'Press move up key', localStorageKey: 'keyboard.layout.custom.moveUp' },
        { label: 'Press move down key', localStorageKey: 'keyboard.layout.custom.moveDown' },
        { label: 'Press move left key', localStorageKey: 'keyboard.layout.custom.moveLeft' },
        { label: 'Press move right key', localStorageKey: 'keyboard.layout.custom.moveRight' },
        { label: 'Press shoot up key', localStorageKey: 'keyboard.layout.custom.shootUp' },
        { label: 'Press shoot down key', localStorageKey: 'keyboard.layout.custom.shootDown' },
        { label: 'Press shoot left key', localStorageKey: 'keyboard.layout.custom.shootLeft' },
        { label: 'Press shoot right key', localStorageKey: 'keyboard.layout.custom.shootRight' }
     ];

    currentBinding: number = 0;

    constructor() {
        super();
    }

    preload() {
        MenuButton.preload(this.game);
    }

    init(binding: number = 0) {
        if (binding >= this.bindings.length) {
            this.currentBinding = 0;
            (this.game as ShmuprpgGame).controls.useCustomLayout();
            this.game.state.start('KeyboardOptions');
        } else {
            this.currentBinding = binding;
        }
    }

    create() {
        super.create();
        let logo = this.game.add.text(this.game.world.centerX, 0, this.bindings[this.currentBinding].label, { font: "68px monospace", fill: 'white' });
        logo.scale.x = 2;
        logo.scale.y = 2;
        logo.anchor.setTo(0.5, 0);
        new MenuButton(this.game, "Back", 500, 900, () => this.game.state.start('KeyboardOptions'));
    }

    update() {
        for (var k in Phaser.KeyCode) {
            let keycode = Phaser.KeyCode[k];
            if (this.input.keyboard.isDown(keycode)) {
                localStorage.setItem(this.bindings[this.currentBinding].localStorageKey, keycode);
                this.game.state.start('KeyboardOptionsBindKey', true, false, this.currentBinding + 1);
                break;
            }
        }
    }
}
