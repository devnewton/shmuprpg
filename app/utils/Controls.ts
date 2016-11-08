/// <reference path="../../typings/phaser.d.ts"/>

export class Controls {
    kb: Phaser.Keyboard;
    pad: Phaser.SinglePad;
    game: Phaser.Game;
    keyCodeMoveUp: number;
    keyCodeMoveDown: number;
    keyCodeMoveLeft: number;
    keyCodeMoveRight: number;
    keyCodeShootUp: number;
    keyCodeShootDown: number;
    keyCodeShootLeft: number;
    keyCodeShootRight: number;

    constructor(game: Phaser.Game) {
        this.game = game;
        game.input.gamepad.start();
        this.kb = game.input.keyboard;
        this.pad = game.input.gamepad.pad1;
        this.setupKeyboardLayout();
    }

    setupKeyboardLayout() {
        let layout = localStorage.getItem('keyboard.layout');
        if (null == layout || layout == 'azerty') {
            this.useAzertyLayout();
        } else if (layout == 'qwerty') {
            this.useQwertyLayout();
        } else if (layout == 'other') {
            this.useOtherLayout();
        } else if (layout == 'custom') {
            this.useCustomLayout();
        }
    }

    usePad(pad: Phaser.SinglePad) {
        this.pad = pad;
    }

    useAzertyLayout() {
        this.keyCodeMoveUp = Phaser.KeyCode.Z;
        this.keyCodeMoveDown = Phaser.KeyCode.S;
        this.keyCodeMoveLeft = Phaser.KeyCode.Q;
        this.keyCodeMoveRight = Phaser.KeyCode.D;
        this.keyCodeShootUp = Phaser.KeyCode.I;
        this.keyCodeShootDown = Phaser.KeyCode.K;
        this.keyCodeShootLeft = Phaser.KeyCode.J;
        this.keyCodeShootRight = Phaser.KeyCode.L;
        localStorage.setItem('keyboard.layout', 'azerty');
    }

    useQwertyLayout() {
        this.keyCodeMoveUp = Phaser.KeyCode.W;
        this.keyCodeMoveDown = Phaser.KeyCode.S;
        this.keyCodeMoveLeft = Phaser.KeyCode.A;
        this.keyCodeMoveRight = Phaser.KeyCode.D;
        this.keyCodeShootUp = Phaser.KeyCode.I;
        this.keyCodeShootDown = Phaser.KeyCode.K;
        this.keyCodeShootLeft = Phaser.KeyCode.J;
        this.keyCodeShootRight = Phaser.KeyCode.L;
        localStorage.setItem('keyboard.layout', 'qwerty');
    }

    useOtherLayout() {
        this.keyCodeMoveUp = Phaser.KeyCode.UP;
        this.keyCodeMoveDown = Phaser.KeyCode.DOWN;
        this.keyCodeMoveLeft = Phaser.KeyCode.LEFT;
        this.keyCodeMoveRight = Phaser.KeyCode.RIGHT;
        this.keyCodeShootUp = Phaser.KeyCode.I;
        this.keyCodeShootDown = Phaser.KeyCode.K;
        this.keyCodeShootLeft = Phaser.KeyCode.J;
        this.keyCodeShootRight = Phaser.KeyCode.L;
        localStorage.setItem('keyboard.layout', 'other');
    }

    useCustomLayout() {
        this.keyCodeMoveUp = parseInt(localStorage.getItem('keyboard.layout.custom.moveUp')) || Phaser.KeyCode.UP;
        this.keyCodeMoveDown = parseInt(localStorage.getItem('keyboard.layout.custom.moveDown')) || Phaser.KeyCode.DOWN;
        this.keyCodeMoveLeft = parseInt(localStorage.getItem('keyboard.layout.custom.moveLeft')) || Phaser.KeyCode.LEFT;
        this.keyCodeMoveRight = parseInt(localStorage.getItem('keyboard.layout.custom.moveRight')) || Phaser.KeyCode.RIGHT;
        this.keyCodeShootUp = parseInt(localStorage.getItem('keyboard.layout.custom.shootUp')) || Phaser.KeyCode.I;
        this.keyCodeShootDown = parseInt(localStorage.getItem('keyboard.layout.custom.shootDown')) || Phaser.KeyCode.K;
        this.keyCodeShootLeft = parseInt(localStorage.getItem('keyboard.layout.custom.shootLeft')) || Phaser.KeyCode.J;
        this.keyCodeShootRight = parseInt(localStorage.getItem('keyboard.layout.custom.shootRight')) || Phaser.KeyCode.L;
        localStorage.setItem('keyboard.layout', 'custom');
    }

    shootingAngle(shooterX: number, shooterY: number): number {
        return this.firstNonNull(this.shootingAngleFromPointer(shooterX, shooterY)
            , this.shootingAngleFromPad(), this.shootingFromKeyboard());
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

    private shootingFromKeyboard(): number {
        let dx = 0;
        if (this.kb.isDown(this.keyCodeShootLeft)) {
            dx = -1;
        } else if (this.kb.isDown(this.keyCodeShootRight)) {
            dx = 1;
        }
        let dy = 0;
        if (this.kb.isDown(this.keyCodeShootUp)) {
            dy = -1;
        } else if (this.kb.isDown(this.keyCodeShootDown)) {
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
            || this.kb.isDown(this.keyCodeMoveUp);
    }
    isGoingDown(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveDown);
    }

    isGoingLeft(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveLeft);
    }

    isGoingRight(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveRight);
    }

    isPassDialogButtonDown(): boolean {
        return this.game.input.activePointer.isDown
            || this.pad.isDown(Phaser.Gamepad.XBOX360_A);
    }
}