/// <reference path="../../typings/phaser.d.ts"/>
import {Level} from "../states/Level.ts";
import { Pathfinder } from "../utils/Pathfinder.ts";

export class Grobelin extends Phaser.Sprite {

    birdExplosion: Phaser.Sprite;
    enemy: Phaser.Sprite;
    path = new Array<Phaser.Point>();
    currentPathPointTarget: Phaser.Point;
    thinking = false;
    private pathfinder: Pathfinder;
    private attackAnimation: Phaser.Animation;
    private attackDangerousOffset: Phaser.Point;

    constructor(game: Phaser.Game, pathfinder: Pathfinder) {
        super(game, 0, 0, 'grobelin');
        this.pathfinder = pathfinder;
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
            this.executeBehaviorTree();
        }
    }

    private executeBehaviorTree() {
        this.priority_Root();
    }

    private priority_Root() {
        this.sequence_Attack() || this.action_FollowPath() || this.action_SearchAPathToEnemy();
    }

    private sequence_Attack() {
        return this.condition_IsNearEnemy() && this.action_AttackEnemy();
    }

    private condition_IsNearEnemy(): boolean {
        return this.enemy && Phaser.Math.distance(this.body.center.x, this.body.center.y, this.enemy.body.center.x, this.enemy.body.center.y) < this.body.width * 2;
    }

    private action_AttackEnemy(): boolean {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        if (!this.attackAnimation) {
            [this.attackAnimation, this.attackDangerousOffset] = this.action_AttackEnemy_PlayAnimation();
        } else if (this.attackAnimation.isFinished) {
            this.attackAnimation = null;
            const enemyRectangle = new Phaser.Rectangle(this.enemy.left, this.enemy.top, this.enemy.width, this.enemy.height);
            if (Phaser.Rectangle.containsPoint(enemyRectangle, this.getAttackPoint())) {
                this.enemy.damage(1);
            }
        }
        return true;
    }

    getAttackPoint(): Phaser.Point {
        if (this.attackDangerousOffset) {
            return new Phaser.Point(this.body.center.x + this.attackDangerousOffset.x, this.body.center.y + this.attackDangerousOffset.y);
        } else {
            return null;
        }
    }

    private action_AttackEnemy_PlayAnimation(): [Phaser.Animation, Phaser.Point] {
        const dx = this.enemy.body.center.x - this.body.center.x;
        const dy = this.enemy.body.center.y - this.body.center.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                return [this.play("lpc.thrust.left", 8, false), new Phaser.Point(-24, -16)];
            } else if (dx > 0) {
                return [this.play("lpc.thrust.right", 8, false), new Phaser.Point(24, -16)];
            } else if (dy < 0) {
                return [this.play("lpc.thrust.back", 8, false), new Phaser.Point(8, -48)];
            } else if (dy > 0) {
                return [this.play("lpc.thrust.front", 8, false), new Phaser.Point(-8, 8)];
            } else {
                return [this.play("lpc.thrust.right", 8, false), new Phaser.Point(24, -16)];
            }
        } else {
            if (dy < 0) {
                return [this.play("lpc.thrust.back", 8, false), new Phaser.Point(8, -48)];
            } else if (dy > 0) {
                return [this.play("lpc.thrust.front", 8, false), new Phaser.Point(-8, 8)];
            } else if (dx < 0) {
                return [this.play("lpc.thrust.left", 8, false), new Phaser.Point(-24, -16)];
            } else if (dx > 0) {
                return [this.play("lpc.thrust.right", 8, false), new Phaser.Point(24, -16)];
            } else {
                return [this.play("lpc.thrust.back", 8, false), new Phaser.Point(8, -48)];
            }
        }
    }

    private action_FollowPath(): boolean {
        if (this.currentPathPointTarget) {
            this.action_FollowPath_MoveToXY(this.currentPathPointTarget.x, this.currentPathPointTarget.y, 300);
            if (Phaser.Math.distance(this.body.center.x, this.body.center.y, this.currentPathPointTarget.x, this.currentPathPointTarget.y) < this.body.halfWidth) {
                this.currentPathPointTarget = null;
            }
        } else {
            this.currentPathPointTarget = this.path.shift();
            if (this.path.length == 0) {
                this.body.velocity.x = 0;
                this.body.velocity.y = 0;
                return false;
            }
        }
        this.action_FollowPath_Animate();
        return true;
    }

    private action_FollowPath_Animate() {
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

    private action_FollowPath_MoveToXY(x: number, y: number, speed: number = 60) {
        var angle = Math.atan2(y - this.body.center.y, x - this.body.center.x);
        /*var distance = Phaser.Math.distance(this.body.center.x, this.body.center.y, x, y);
        speed = Math.max(distance, speed);*/
        this.body.velocity.x = Math.cos(angle) * speed;
        this.body.velocity.y = Math.sin(angle) * speed;
    }

    private action_SearchAPathToEnemy(): boolean {
        if (!this.thinking) {
            this.thinking = true;
            this.pathfinder.findPath(this.body.center.x, this.body.center.y, this.enemy.body.center.x, this.enemy.body.center.y, (path: Phaser.Point[]) => {
                this.path = path || new Array<Phaser.Point>();
                this.thinking = false;
            });
        }
        return this.path.length == 0;
    }
}
