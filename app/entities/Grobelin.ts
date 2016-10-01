/// <reference path="../../typings/phaser.d.ts"/>
import {Level} from "../states/Level.ts";

export class Grobelin extends Phaser.Sprite {

    birdExplosion: Phaser.Sprite;
    enemy: Phaser.Sprite;
    path = new Array<Phaser.Point>();
    currentPathPointTarget: Phaser.Point;
    attack = false;
    thinking = false;

    constructor(game: Phaser.Game) {
        super(game, 0, 0, 'grobelin');
        this.animations.add('fly');
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.body.setSize(16, 16, 24, 48);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        this.birdExplosion = this.game.add.sprite(this.x, this.y, 'bird-explosion');
        this.birdExplosion.anchor.setTo(0.5, 0.5);
        this.birdExplosion.exists = false;
        const explodeAnimation = this.birdExplosion.animations.add('explode');
        explodeAnimation.killOnComplete = true;
    }

    appears(fromX: number, fromY: number, target: Phaser.Sprite) {
        const beforeGrobelin = this.game.add.sprite(fromX, fromY, 'before-bird');
        beforeGrobelin.anchor.setTo(0.5, 0.5);
        const beforeGrobelinAnimation = beforeGrobelin.animations.add('appears');
        beforeGrobelinAnimation.onComplete.add(() => {
            beforeGrobelin.destroy();
            this.reset(fromX, fromY);
            this.enemy = target;
        });
        beforeGrobelinAnimation.play(4, false);
    }

    kill(): Phaser.Sprite {
        super.kill();
        this.birdExplosion.reset(this.x, this.y);
        this.birdExplosion.play('explode', 8, false);
        return this;
    }

    update() {
        super.update();
        if (this.exists) {
            this.attackIfNearTarget();
            this.walk();
            this.think();
            this.animate();
        }
    }

    walk() {
        if (this.attack) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        } else {
            if (this.currentPathPointTarget) {
                this.moveToXY(this.currentPathPointTarget.x, this.currentPathPointTarget.y, 300);
                if (Phaser.Math.distance(this.body.center.x, this.body.center.y, this.currentPathPointTarget.x, this.currentPathPointTarget.y) < this.body.halfWidth) {
                    this.currentPathPointTarget = null;
                }
            } else {
                this.currentPathPointTarget = this.path.shift();
                if (this.path.length == 0) {
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                }
            }
        }
    }

    moveToXY(x: number, y: number, speed: number = 60) {
        var angle = Math.atan2(y - this.body.center.y, x - this.body.center.x);
        /*var distance = Phaser.Math.distance(this.body.center.x, this.body.center.y, x, y);
        speed = Math.max(distance, speed);*/
        this.body.velocity.x = Math.cos(angle) * speed;
        this.body.velocity.y = Math.sin(angle) * speed;
    }

    attackIfNearTarget() {
        this.attack = this.enemy && Phaser.Math.distance(this.body.center.x, this.body.center.y, this.enemy.body.center.x, this.enemy.body.center.y) < this.body.width * 2;
    }

    think() {
        if (!this.attack && !this.thinking && !this.currentPathPointTarget && this.path.length == 0) {
            this.thinking = true;
            const pathfinder = (<Level>this.game.state.getCurrentState()).pathfinder;
            pathfinder.findPath(this.body.center.x, this.body.center.y, this.enemy.body.center.x, this.enemy.body.center.y, (path: Phaser.Point[]) => {
                this.path = path || new Array<Phaser.Point>();
                this.thinking = false;
            });
        }
    }

    animate() {
        if (this.attack) {
            const dx = this.enemy.body.center.x - this.body.center.x;
            const dy = this.enemy.body.center.y - this.body.center.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) {
                    this.play("lpc.thrust.left", 8, false);
                } else if (dx > 0) {
                    this.play("lpc.thrust.right", 8, false);
                } else if (dy < 0) {
                    this.play("lpc.thrust.back", 8, false);
                } else if (dy > 0) {
                    this.play("lpc.thrust.front", 8, false);
                } else {
                    this.play("lpc.thrust.right", 8, false);
                }
            } else {
                if (dy < 0) {
                    this.play("lpc.thrust.back", 8, false);
                } else if (dy > 0) {
                    this.play("lpc.thrust.front", 8, false);
                } else if (dx < 0) {
                    this.play("lpc.thrust.left", 8, false);
                } else if (dx > 0) {
                    this.play("lpc.thrust.right", 8, false);
                } else {
                    this.play("lpc.thrust.back", 8, false);
                }
            }
        } else {
            if (Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)) {
                if (this.body.velocity.x < 0) {
                    this.play("lpc.walk.left", 8, false);
                } else if (this.body.velocity.x > 0) {
                    this.play("lpc.walk.right", 8, false);
                } else if (this.body.velocity.y < 0) {
                    this.play("lpc.walk.back", 8, false);
                } else if (this.body.velocity.y > 0) {
                    this.play("lpc.walk.front", 8, false);
                } else {
                    this.play("lpc.hurt", 0, false);
                }
            } else {
                if (this.body.velocity.y < 0) {
                    this.play("lpc.walk.back", 8, false);
                } else if (this.body.velocity.y > 0) {
                    this.play("lpc.walk.front", 8, false);
                } else if (this.body.velocity.x < 0) {
                    this.play("lpc.walk.left", 8, false);
                } else if (this.body.velocity.x > 0) {
                    this.play("lpc.walk.right", 8, false);
                } else {
                    this.play("lpc.hurt", 0, false);
                }
            }
        }
    }
}