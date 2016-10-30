/// <reference path="../../typings/phaser.d.ts"/>

export class Controls {
    kb: Phaser.Keyboard;
    pad: Phaser.SinglePad;
    game: Phaser.Game;
    keyCodeUP: number;
    keyCodeDOWN: number;
    keyCodeLEFT: number;
    keyCodeRIGHT: number;

    constructor(game: Phaser.Game) {
        this.game = game;
        game.input.gamepad.start();
        this.kb = game.input.keyboard;
        this.pad = game.input.gamepad.pad1;
        if (localStorage.getItem('keyboard.layout') == 'qwerty') {
            this.useQwertyLayout();
        } else {
            this.useAzertyLayout();
        }
    }

    useAzertyLayout() {
        this.keyCodeUP = Phaser.KeyCode.Z;
        this.keyCodeDOWN = Phaser.KeyCode.S;
        this.keyCodeLEFT = Phaser.KeyCode.Q;
        this.keyCodeRIGHT = Phaser.KeyCode.D;
        localStorage.setItem('keyboard.layout', 'azerty');
    }

    useQwertyLayout() {
        this.keyCodeUP = Phaser.KeyCode.W;
        this.keyCodeDOWN = Phaser.KeyCode.S;
        this.keyCodeLEFT = Phaser.KeyCode.A;
        this.keyCodeRIGHT = Phaser.KeyCode.D;
        localStorage.setItem('keyboard.layout', 'qwerty');
    }

    useOtherLayout() {
        this.keyCodeUP = Phaser.KeyCode.UP;
        this.keyCodeDOWN = Phaser.KeyCode.DOWN;
        this.keyCodeLEFT = Phaser.KeyCode.LEFT;
        this.keyCodeRIGHT = Phaser.KeyCode.RIGHT;
        localStorage.setItem('keyboard.layout', 'other');
    }

    shootingAngle(shooterX: number, shooterY: number): number {
        return this.firstNonNull(this.shootingAngleFromPointer(shooterX, shooterY)
            , this.shootingAngleFromPad());
    }

    private firstNonNull<T>(...values: T[]): T {
        for (let value of values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private shootingAngleFromPointer(shooterX: number, shooterY: number): number {
        const pointer = this.game.input.activePointer;
        if (pointer.isDown) {
            return Phaser.Math.angleBetween(shooterX, shooterY, pointer.worldX, pointer.worldY);
        } else {
            return null;
        }
    }

    private shootingAngleFromPad(): number {
        let dx = this.pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
        let dy = this.pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
        dx = Math.abs(dx) <= this.pad.deadZone ? 0 : dx;
        dy = Math.abs(dy) <= this.pad.deadZone ? 0 : dy;
        if (dx != 0 || dy != 0) {
            return Phaser.Math.angleBetween(0, 0, dx, dy);
        } else {
            return null;
        }
    }

    isGoingUp(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.UP)
            || this.kb.isDown(this.keyCodeUP);
    }
    isGoingDown(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.DOWN)
            || this.kb.isDown(this.keyCodeDOWN);
    }

    isGoingLeft(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.LEFT)
            || this.kb.isDown(this.keyCodeLEFT);
    }

    isGoingRight(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.RIGHT)
            || this.kb.isDown(this.keyCodeRIGHT);
    }
}