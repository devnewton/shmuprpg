/// <reference path="../../typings/phaser.d.ts"/>
import {Controls} from "../utils/Controls";
import {ShmuprpgGame} from "../ShmuprpgGame";

export class Dialog extends Phaser.Group {
    private dialogText: Phaser.Text;
    onFinishCallback: () => void;
    controls: Controls;
    passButtonWasDown = false;

    constructor(game: Phaser.Game, text?: string) {
        super(game);
        let dialogBackground = game.add.image(0, 600, "dialog_bg", null, this);
        dialogBackground.alpha = 0.9;

        this.dialogText = game.add.text(game.world.centerX, 630, text,
            {
                font: "64px monospace"
                , fill: "white"
                , wordWrap: true
                , wordWrapWidth: 1900
            },
            this);
        this.dialogText.anchor.x = 0.5;

        game.add.existing(this);
        this.controls = (<ShmuprpgGame>game).controls;
    }

    set text(text: string) {
        this.dialogText.text = text;
    }

    static preload(game: Phaser.Game) {
        game.load.image('dialog_bg', 'dialog/dialog_bg.png');
    }

    update() {
        let passButtonIsDown = this.controls.isPassDialogButtonDown();
        if(this.passButtonWasDown && !passButtonIsDown) {
            this.passButtonWasDown = false;
            if (this.onFinishCallback) {
                this.onFinishCallback();
            }
        } else {
            this.passButtonWasDown = passButtonIsDown;
        }
    }
}