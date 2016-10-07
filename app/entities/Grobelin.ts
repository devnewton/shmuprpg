/// <reference path="../../typings/phaser.d.ts"/>
import {Level} from "../states/Level.ts";
import {Pathfinder} from "../ia/services/Pathfinder.ts";
import * as b3 from "../ia/decisions/b3.ts";
import {Vulnerable} from "./features/Vulnerable.ts";

export class Grobelin extends Phaser.Sprite implements Vulnerable {

    grobelinDeath: Phaser.Sprite;
    enemy: Phaser.Sprite;
    pathfinder: Pathfinder;
    private attackAnimation: Phaser.Animation;
    private attackDangerousOffset: Phaser.Point;
    private damageTween: Phaser.Tween;
    private blackboard: GrobelinBlackboard;

    constructor(game: Phaser.Game, pathfinder: Pathfinder) {
        super(game, 0, 0, 'grobelin');
        this.exists = false;
        this.pathfinder = pathfinder;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.grobelinDeath = this.game.add.sprite(this.x, this.y, 'grobelin');
        this.grobelinDeath.anchor.setTo(0.5, 0.5);
        this.grobelinDeath.exists = false;
    }

    getVulnerableRectangles(): Array<Phaser.Rectangle> {
        return [new Phaser.Rectangle(this.x, this.y, this.width, this.height)];
    }

    appears(fromX: number, fromY: number, target: Phaser.Sprite) {
        const beforeGrobelin = this.game.add.sprite(fromX, fromY, 'before-bird');
        beforeGrobelin.anchor.setTo(0.5, 0.5);
        const beforeGrobelinAnimation = beforeGrobelin.animations.add('appears');
        beforeGrobelinAnimation.onComplete.add(() => {
            beforeGrobelin.destroy();
            this.reset(fromX, fromY, 50);
            this.body.setSize(16, 16, 24, 48);
            this.body.collideWorldBounds = true;
            this.blackboard = new GrobelinBlackboard();
            this.enemy = target;
        });
        beforeGrobelinAnimation.play(4, false);
    }

    kill(): Phaser.Sprite {
        super.kill();
        this.damageTween.stop(true);
        this.tint = 0xFFFFFF;
        this.grobelinDeath.reset(this.x, this.y);
        this.grobelinDeath.animations.play("lpc.hurt", 6, false).killOnComplete = true;
        return this;
    }

    update() {
        super.update();
        if (this.exists) {
            this.executeBehaviorTree();
        }
    }

    damage(amount: number): Phaser.Sprite {
        if (!this.damageTween) {
            this.damageTween = this.game.add.tween(this).from({ tint: 0xFF0000 }).to({ tint: 0xFFFFFF }, 500, Phaser.Easing.Linear.None, true, 0, 4, false);
            this.damageTween.onComplete.add((): void => this.damageTween = null);
        }
        super.damage(amount);
        return this;
    }

    private executeBehaviorTree() {
        GrobelinB3.get().tick(this, this.blackboard);
    }

    action_AttackEnemy(): boolean {
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
}

class GrobelinBlackboard extends b3.Blackboard {
    currentPathPointTarget: Phaser.Point;
    path: Array<Phaser.Point>;
}

class GrobelinB3 extends b3.Tree<Grobelin, GrobelinBlackboard> {

    private static singleton: GrobelinB3;
    static get() {
        return this.singleton || (this.singleton = new GrobelinB3());
    }

    constructor() {
        super();
        this.root = this.selector(
            this.sequence(new ConditionIsNearEnemy(), new ActionAttackEnemy()),
            new ActionFollowPath(),
            new ActionSearchAPathToEnemy());
    }
}

class ActionFollowPath extends b3.Action<Grobelin, GrobelinBlackboard> {
    tick(t: b3.Tick<Grobelin, GrobelinBlackboard>): b3.NodeState {
        let me = t.me;
        let currentPathPointTarget = t.blackboard.currentPathPointTarget;
        if (currentPathPointTarget) {
            this.moveToXY(me, currentPathPointTarget.x, currentPathPointTarget.y, 300);
            if (Phaser.Math.distance(me.body.center.x, me.body.center.y, currentPathPointTarget.x, currentPathPointTarget.y) < me.body.halfWidth) {
                t.blackboard.currentPathPointTarget = null;
            }
        } else {
            let path = t.blackboard.path || [];
           t.blackboard.currentPathPointTarget =  path.shift();
            if (path.length == 0) {
                me.body.velocity.x = 0;
                me.body.velocity.y = 0;
                return b3.NodeState.FAILURE;
            }
        }
        this.animate(me);
        return b3.NodeState.RUNNING;
    }

    animate(me: Grobelin) {
        if (Math.abs(me.body.velocity.x) > Math.abs(me.body.velocity.y)) {
            if (me.body.velocity.x < 0) {
                me.play("lpc.walk.left", 8, false);
            } else if (me.body.velocity.x > 0) {
                me.play("lpc.walk.right", 8, false);
            } else if (me.body.velocity.y < 0) {
                me.play("lpc.walk.back", 8, false);
            } else if (me.body.velocity.y > 0) {
                me.play("lpc.walk.front", 8, false);
            } else {
                me.play("lpc.hurt", 0, false);
            }
        } else {
            if (me.body.velocity.y < 0) {
                me.play("lpc.walk.back", 8, false);
            } else if (me.body.velocity.y > 0) {
                me.play("lpc.walk.front", 8, false);
            } else if (me.body.velocity.x < 0) {
                me.play("lpc.walk.left", 8, false);
            } else if (me.body.velocity.x > 0) {
                me.play("lpc.walk.right", 8, false);
            } else {
                me.play("lpc.hurt", 0, false);
            }
        }
    }

    moveToXY(me: Grobelin, x: number, y: number, speed: number = 60) {
        var angle = Math.atan2(y - me.body.center.y, x - me.body.center.x);
        me.body.velocity.x = Math.cos(angle) * speed;
        me.body.velocity.y = Math.sin(angle) * speed;
    }
}

class ActionSearchAPathToEnemy extends b3.Action<Grobelin, GrobelinBlackboard> {
    
    thinking = new b3.BlackboardKey<boolean>();

    tick(t: b3.Tick<Grobelin, GrobelinBlackboard>): b3.NodeState {
        let thinking = t.blackboard.get(this.thinking) || false;
        let me = t.me;
        if (!thinking) {
            t.blackboard.set(this.thinking, true);
            me.pathfinder.findPath(me.body.center.x, me.body.center.y, me.enemy.body.center.x, me.enemy.body.center.y, (path: Phaser.Point[]) => {
                t.blackboard.path = path || [];
                t.blackboard.set(this.thinking, false);
            });
        }
        let path = t.blackboard.path || [];
        return path.length > 0 ? b3.NodeState.SUCCESS : b3.NodeState.RUNNING;
    }
}

class ConditionIsNearEnemy extends b3.Condition<Grobelin, GrobelinBlackboard> {
    check(t: b3.Tick<Grobelin, GrobelinBlackboard>): boolean {
        let me = t.me;
        return me.enemy && Phaser.Math.distance(me.body.center.x, me.body.center.y, me.enemy.body.center.x, me.enemy.body.center.y) < me.body.width * 2;
    }
}

class ActionAttackEnemy extends b3.Action<Grobelin, GrobelinBlackboard> {
    tick(t: b3.Tick<Grobelin, GrobelinBlackboard>): b3.NodeState {
        if (t.me.action_AttackEnemy()) {
            return b3.NodeState.SUCCESS;
        } else {
            return b3.NodeState.RUNNING;
        }
    }
}