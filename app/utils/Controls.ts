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
    moveXAxis: number;
    moveYAxis: number;
    shootXAxis: number;
    shootYAxis: number;

    constructor(game: Phaser.Game) {
        this.game = game;
        game.input.gamepad.start();
        this.kb = game.input.keyboard;
        this.setupKeyboardLayout();
        this.setupGamepadLayout();
    }

    setupKeyboardLayout() {
        let layout = localStorage.getItem('keyboard.layout');
        if (null == layout || layout == 'azerty') {
            this.useAzertyLayout();
        } else if (layout == 'qwerty') {
            this.useQwertyLayout();
        } else if (layout == 'other') {
            this.useOtherKeyboardLayout();
        } else if (layout == 'custom') {
            this.useCustomKeyboardLayout();
        }
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

    useOtherKeyboardLayout() {
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

    useCustomKeyboardLayout() {
        this.keyCodeMoveUp = this.readNumberFromLocalStorage('keyboard.layout.custom.moveUp', Phaser.KeyCode.UP);
        this.keyCodeMoveDown = this.readNumberFromLocalStorage('keyboard.layout.custom.moveDown', Phaser.KeyCode.DOWN);
        this.keyCodeMoveLeft = this.readNumberFromLocalStorage('keyboard.layout.custom.moveLeft', Phaser.KeyCode.LEFT);
        this.keyCodeMoveRight = this.readNumberFromLocalStorage('keyboard.layout.custom.moveRight', Phaser.KeyCode.RIGHT);
        this.keyCodeShootUp = this.readNumberFromLocalStorage('keyboard.layout.custom.shootUp', Phaser.KeyCode.I);
        this.keyCodeShootDown = this.readNumberFromLocalStorage('keyboard.layout.custom.shootDown', Phaser.KeyCode.K);
        this.keyCodeShootLeft = this.readNumberFromLocalStorage('keyboard.layout.custom.shootLeft', Phaser.KeyCode.J);
        this.keyCodeShootRight = this.readNumberFromLocalStorage('keyboard.layout.custom.shootRight', Phaser.KeyCode.L);
        localStorage.setItem('keyboard.layout', 'custom');
    }

    setupGamepadLayout() {
        let padIndex = parseInt(localStorage.getItem('gamepad')) || 1;
        let layout = localStorage.getItem('gamepad' + padIndex + '.layout');
        if (null == layout || layout == 'xbox') {
            this.useXboxLayout(padIndex);
        } else if (layout == 'custom') {
            this.useCustomGamepadLayout(padIndex);
        }
    }

    useXboxLayout(padIndex: number) {
        padIndex = padIndex || 1;
        this.pad = this.game.input.gamepad['pad' + padIndex];
        this.moveXAxis = Phaser.Gamepad.XBOX360_STICK_LEFT_X;
        this.moveYAxis = Phaser.Gamepad.XBOX360_STICK_LEFT_Y;
        this.shootXAxis = Phaser.Gamepad.XBOX360_STICK_RIGHT_X;
        this.shootYAxis = Phaser.Gamepad.XBOX360_STICK_RIGHT_Y;
        localStorage.setItem('gamepad', padIndex.toString());
        localStorage.setItem('gamepad' + padIndex + '.layout', 'xbox');
    }

    useCustomGamepadLayout(padIndex: number) {
        padIndex = padIndex || 1;
        this.pad = this.game.input.gamepad['pad' + padIndex];
        this.moveXAxis = this.readNumberFromLocalStorage('gamepad' + padIndex + '.layout.custom.moveXAxis', Phaser.Gamepad.XBOX360_STICK_LEFT_X);
        this.moveYAxis = this.readNumberFromLocalStorage('gamepad' + padIndex + '.layout.custom.moveYAxis', Phaser.Gamepad.XBOX360_STICK_LEFT_Y);
        this.shootXAxis = this.readNumberFromLocalStorage('gamepad' + padIndex + '.layout.custom.shootXAxis', Phaser.Gamepad.XBOX360_STICK_RIGHT_X);
        this.shootYAxis = this.readNumberFromLocalStorage('gamepad' + padIndex + '.layout.custom.shootYAxis', Phaser.Gamepad.XBOX360_STICK_RIGHT_Y);
        localStorage.setItem('gamepad', padIndex.toString());
        localStorage.setItem('gamepad' + padIndex + '.layout', 'custom');
    }

    readNumberFromLocalStorage(key: string, defaultValue: number) {
        let i = parseInt(localStorage.getItem(key));
        if (isNaN(i)) {
            return defaultValue;
        } else {
            return i;
        }
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
        let dx = this.pad.axis(this.shootXAxis);
        let dy = this.pad.axis(this.shootYAxis);
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
        return this.pad.axis(this.moveYAxis) < -this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveUp);
    }
    isGoingDown(): boolean {
        return this.pad.axis(this.moveYAxis) > this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveDown);
    }

    isGoingLeft(): boolean {
        return this.pad.axis(this.moveXAxis) < -this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveLeft);
    }

    isGoingRight(): boolean {
        return this.pad.axis(this.moveXAxis) > this.pad.deadZone
            || this.kb.isDown(this.keyCodeMoveRight);
    }

    isPassDialogButtonDown(): boolean {
        return this.game.input.activePointer.isDown
            || this.pad.isDown(Phaser.Gamepad.XBOX360_A);
    }
}