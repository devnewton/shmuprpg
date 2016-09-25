/// <reference path="../../typings/phaser.d.ts"/>

export class Controls {
    kb: Phaser.Keyboard;
    pad: Phaser.SinglePad;

    constructor(game: Phaser.Game) {
        game.input.gamepad.start();
        this.kb = game.input.keyboard;
        this.pad = game.input.gamepad.pad1;
    }

    isGoingUp() {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.UP)
            || this.kb.isDown(Phaser.KeyCode.Z);
    }
    isGoingDown() {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.DOWN)
            || this.kb.isDown(Phaser.KeyCode.S);
    }

    isGoingLeft() {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.LEFT)
            || this.kb.isDown(Phaser.KeyCode.Q);
    }

    isGoingRight() {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.RIGHT)
            || this.kb.isDown(Phaser.KeyCode.D);
    }
}