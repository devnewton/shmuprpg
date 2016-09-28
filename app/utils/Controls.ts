/// <reference path="../../typings/phaser.d.ts"/>

export class Controls {
    kb: Phaser.Keyboard;
    pad: Phaser.SinglePad;
    game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
        game.input.gamepad.start();
        this.kb = game.input.keyboard;
        this.pad = game.input.gamepad.pad1;
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
        if (this.kb.isDown(Phaser.KeyCode.J)) {
            dx = -1;
        } else if (this.kb.isDown(Phaser.KeyCode.L)) {
            dx = 1;
        }
        let dy = 0;
        if (this.kb.isDown(Phaser.KeyCode.I)) {
            dy = -1;
        } else if (this.kb.isDown(Phaser.KeyCode.K)) {
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
            || this.kb.isDown(Phaser.KeyCode.Z);
    }
    isGoingDown(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.DOWN)
            || this.kb.isDown(Phaser.KeyCode.S);
    }

    isGoingLeft(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.LEFT)
            || this.kb.isDown(Phaser.KeyCode.Q);
    }

    isGoingRight(): boolean {
        return this.pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)
            || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > this.pad.deadZone
            || this.kb.isDown(Phaser.KeyCode.RIGHT)
            || this.kb.isDown(Phaser.KeyCode.D);
    }
}