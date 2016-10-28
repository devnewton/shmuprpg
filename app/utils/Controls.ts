/// <reference path="../../typings/phaser.d.ts"/>

export class Controls {
    kb: Phaser.Keyboard;
    pad: Phaser.SinglePad;
    game: Phaser.Game;
    keyCodeZ: number;
    keyCodeS: number;
    keyCodeQ: number;
    keyCodeD: number;
    keyCodeI: number;
    keyCodeK: number;
    keyCodeJ: number;
    keyCodeL: number;

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
        this.keyCodeZ = Phaser.KeyCode.Z;
        this.keyCodeS = Phaser.KeyCode.S;
        this.keyCodeQ = Phaser.KeyCode.Q;
        this.keyCodeD = Phaser.KeyCode.D;
        this.keyCodeI = Phaser.KeyCode.I;
        this.keyCodeK = Phaser.KeyCode.K;
        this.keyCodeJ = Phaser.KeyCode.J;
        this.keyCodeL = Phaser.KeyCode.L;
        localStorage.setItem('keyboard.layout', 'azerty');
    }

    useQwertyLayout() {
        this.keyCodeZ = Phaser.KeyCode.W;
        this.keyCodeS = Phaser.KeyCode.S;
        this.keyCodeQ = Phaser.KeyCode.A;
        this.keyCodeD = Phaser.KeyCode.D;
        this.keyCodeI = Phaser.KeyCode.I;
        this.keyCodeK = Phaser.KeyCode.K;
        this.keyCodeJ = Phaser.KeyCode.J;
        this.keyCodeL = Phaser.KeyCode.L;
        localStorage.setItem('keyboard.layout', 'qwerty');
    }

    shootingAngle(shooterX: number, shooterY: number): number {
        return this.firstNonNull(this.shootingAngleFromPointer(shooterX, shooterY)
            , this.shootingAngleFromPad(),
            this.shootingFromKeyboard());
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
            return this.shootingFromKeyboard();
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

    private shootingFromKeyboard(): number {
        let dx = 0;
        if (this.kb.isDown(this.keyCodeJ)) {
            dx = -1;
        } else if (this.kb.isDown(this.keyCodeL)) {
            dx = 1;
        }
        let dy = 0;
        if (this.kb.isDown(this.keyCodeI)) {
            dy = -1;
        } else if (this.kb.isDown(this.keyCodeK)) {
            dy = 1;
        }
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
            || this.kb.isDown(this.keyCodeZ);
    }
    isGoingDown(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.DOWN)
            || this.kb.isDown(this.keyCodeS);
    }

    isGoingLeft(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.LEFT)
            || this.kb.isDown(this.keyCodeQ);
    }

    isGoingRight(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.RIGHT)
            || this.kb.isDown(this.keyCodeD);
    }
}