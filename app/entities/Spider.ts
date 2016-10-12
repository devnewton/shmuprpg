/// <reference path="../../typings/phaser.d.ts"/>
import {Level} from "../states/Level.ts";
import {Pathfinder} from "../ia/services/Pathfinder.ts";
import * as b3 from "../ia/decisions/b3.ts";
import {Vulnerable} from "./features/Vulnerable.ts";
import {MachineGun} from "./MachineGun.ts";

export class Spider extends Phaser.Sprite implements Vulnerable {

    spiderDeath: Phaser.Sprite;
    enemy: Phaser.Sprite;
    pathfinder: Pathfinder;
    private attackAnimation: Phaser.Animation;
    private attackDangerousOffset: Phaser.Point;
    private damageTween: Phaser.Tween;
    private blackboard: SpiderBlackboard;
    machineGun: MachineGun;

    constructor(game: Phaser.Game, pathfinder: Pathfinder) {
        super(game, 0, 0, 'spider');
        this.exists = false;
        this.pathfinder = pathfinder;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.spiderDeath = this.game.add.sprite(this.x, this.y, 'spider');
        this.spiderDeath.anchor.setTo(0.5, 0.5);
        this.spiderDeath.exists = false;
        this.machineGun = new MachineGun(this.game, 1);
    }

    getVulnerableRectangles(): Array<Phaser.Rectangle> {
        return [new Phaser.Rectangle(this.x, this.y, this.width, this.height)];
    }

    appears(fromX: number, fromY: number, target: Phaser.Sprite) {
        const beforeSpider = this.game.add.sprite(fromX, fromY, 'before-bird');
        beforeSpider.anchor.setTo(0.5, 0.5);
        const beforeSpiderAnimation = beforeSpider.animations.add('appears');
        beforeSpiderAnimation.onComplete.add(() => {
            beforeSpider.destroy();
            this.reset(fromX, fromY, 10);
            this.body.setSize(16, 16, 24, 48);
            this.body.collideWorldBounds = true;
            this.blackboard = new SpiderBlackboard();
            this.enemy = target;
        });
        beforeSpiderAnimation.play(4, false);
    }

    kill(): Phaser.Sprite {
        super.kill();
        this.damageTween.stop(true);
        this.tint = 0xFFFFFF;
        this.spiderDeath.reset(this.x, this.y);
        this.spiderDeath.animations.play("spider.hurt", 6, false).killOnComplete = true;
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
        SpiderB3.get().tick(this, this.blackboard);
    }

    attackEnemy(): boolean {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        if (!this.attackAnimation) {
            [this.attackAnimation, this.attackDangerousOffset] = this.playAttackEnemyAnimation();
        } else if (this.attackAnimation.isFinished) {
            this.attackAnimation = null;
            const enemyRectangle = new Phaser.Rectangle(this.enemy.left, this.enemy.top, this.enemy.width, this.enemy.height);
            if (Phaser.Rectangle.containsPoint(enemyRectangle, this.getAttackPoint())) {
                this.enemy.damage(1);
            }
        }
        return true;
    }

    fire(): boolean {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        let [_, fireOffset] = this.playFireAnimation();
        let angle = Phaser.Math.angleBetween(this.body.center.x, this.body.center.y, this.enemy.body.center.x, this.enemy.body.center.y);
        this.machineGun.fire(this.body.center.x + fireOffset.x, this.body.center.y + fireOffset.y, angle);
        return true;
    }

    private playFireAnimation(): [Phaser.Animation, Phaser.Point] {
        const dx = this.enemy.body.center.x - this.body.center.x;
        const dy = this.enemy.body.center.y - this.body.center.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                return [this.play("spider.stand.left", 6, false), new Phaser.Point(-24, -16)];
            } else if (dx > 0) {
                return [this.play("spider.stand.right", 6, false), new Phaser.Point(24, -16)];
            } else if (dy < 0) {
                return [this.play("spider.stand.back", 6, false), new Phaser.Point(8, -48)];
            } else if (dy > 0) {
                return [this.play("spider.stand.front", 6, false), new Phaser.Point(-8, 8)];
            } else {
                return [this.play("spider.stand.right", 6, false), new Phaser.Point(24, -16)];
            }
        } else {
            if (dy < 0) {
                return [this.play("spider.stand.back", 8, false), new Phaser.Point(8, -48)];
            } else if (dy > 0) {
                return [this.play("spider.stand.front", 8, false), new Phaser.Point(-8, 8)];
            } else if (dx < 0) {
                return [this.play("spider.stand.left", 8, false), new Phaser.Point(-24, -16)];
            } else if (dx > 0) {
                return [this.play("spider.stand.right", 8, false), new Phaser.Point(24, -16)];
            } else {
                return [this.play("spider.stand.back", 8, false), new Phaser.Point(8, -48)];
            }
        }
    }

    private getAttackPoint(): Phaser.Point {
        if (this.attackDangerousOffset) {
            return new Phaser.Point(this.body.center.x + this.attackDangerousOffset.x, this.body.center.y + this.attackDangerousOffset.y);
        } else {
            return null;
        }
    }

    private playAttackEnemyAnimation(): [Phaser.Animation, Phaser.Point] {
        const dx = this.enemy.body.center.x - this.body.center.x;
        const dy = this.enemy.body.center.y - this.body.center.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                return [this.play("spider.attack.left", 8, false), new Phaser.Point(-24, -16)];
            } else if (dx > 0) {
                return [this.play("spider.attack.right", 8, false), new Phaser.Point(24, -16)];
            } else if (dy < 0) {
                return [this.play("spider.attack.back", 8, false), new Phaser.Point(8, -48)];
            } else if (dy > 0) {
                return [this.play("spider.attack.front", 8, false), new Phaser.Point(-8, 8)];
            } else {
                return [this.play("spider.attack.right", 8, false), new Phaser.Point(24, -16)];
            }
        } else {
            if (dy < 0) {
                return [this.play("spider.attack.back", 8, false), new Phaser.Point(8, -48)];
            } else if (dy > 0) {
                return [this.play("spider.attack.front", 8, false), new Phaser.Point(-8, 8)];
            } else if (dx < 0) {
                return [this.play("spider.attack.left", 8, false), new Phaser.Point(-24, -16)];
            } else if (dx > 0) {
                return [this.play("spider.attack.right", 8, false), new Phaser.Point(24, -16)];
            } else {
                return [this.play("spider.attack.back", 8, false), new Phaser.Point(8, -48)];
            }
        }
    }
}

class SpiderBlackboard extends b3.Blackboard {
    currentPathPointTarget: Phaser.Point;
    path: Array<Phaser.Point>;
}

class SpiderB3 extends b3.Tree<Spider, SpiderBlackboard> {

    private static singleton: SpiderB3;
    static get() {
        return this.singleton || (this.singleton = new SpiderB3());
    }

    constructor() {
        super();
        this.root = this.selector(
            this.sequence(new ConditionIsNearEnemy(), new ActionAttackEnemy()),
            this.sequence(new ConditionIsEnemyInLineOfFire(), new ActionFire()),
            new ActionFollowPath(),
            new ActionSearchAPathToEnemy());
    }
}

class ActionFollowPath extends b3.Action<Spider, SpiderBlackboard> {
    tick(t: b3.Tick<Spider, SpiderBlackboard>): b3.NodeState {
        let me = t.me;
        let currentPathPointTarget = t.blackboard.currentPathPointTarget;
        if (currentPathPointTarget) {
            this.moveToXY(me, currentPathPointTarget.x, currentPathPointTarget.y, 300);
            if (Phaser.Math.distance(me.body.center.x, me.body.center.y, currentPathPointTarget.x, currentPathPointTarget.y) < me.body.halfWidth) {
                t.blackboard.currentPathPointTarget = null;
            }
        } else {
            let path = t.blackboard.path || [];
            t.blackboard.currentPathPointTarget = path.shift();
            if (path.length == 0) {
                me.body.velocity.x = 0;
                me.body.velocity.y = 0;
                return b3.NodeState.FAILURE;
            }
        }
        this.animate(me);
        return b3.NodeState.RUNNING;
    }

    animate(me: Spider) {
        if (Math.abs(me.body.velocity.x) > Math.abs(me.body.velocity.y)) {
            if (me.body.velocity.x < 0) {
                me.play("spider.walk.left", 8, false);
            } else if (me.body.velocity.x > 0) {
                me.play("spider.walk.right", 8, false);
            } else if (me.body.velocity.y < 0) {
                me.play("spider.walk.back", 8, false);
            } else if (me.body.velocity.y > 0) {
                me.play("spider.walk.front", 8, false);
            } else {
                me.play("spider.hurt", 0, false);
            }
        } else {
            if (me.body.velocity.y < 0) {
                me.play("spider.walk.back", 8, false);
            } else if (me.body.velocity.y > 0) {
                me.play("spider.walk.front", 8, false);
            } else if (me.body.velocity.x < 0) {
                me.play("spider.walk.left", 8, false);
            } else if (me.body.velocity.x > 0) {
                me.play("spider.walk.right", 8, false);
            } else {
                me.play("lpc.hurt", 0, false);
            }
        }
    }

    moveToXY(me: Spider, x: number, y: number, speed: number = 60) {
        var angle = Math.atan2(y - me.body.center.y, x - me.body.center.x);
        me.body.velocity.x = Math.cos(angle) * speed;
        me.body.velocity.y = Math.sin(angle) * speed;
    }
}

class ActionSearchAPathToEnemy extends b3.Action<Spider, SpiderBlackboard> {

    thinking = new b3.BlackboardKey<boolean>();

    tick(t: b3.Tick<Spider, SpiderBlackboard>): b3.NodeState {
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

class ConditionIsEnemyInLineOfFire extends b3.Condition<Spider, SpiderBlackboard> {
    check(t: b3.Tick<Spider, SpiderBlackboard>): boolean {
        let me = t.me;
        if (me.enemy) {
            const epsilon = 10 * Phaser.Math.PI2 / 360;
            let angle = Phaser.Math.angleBetween(me.body.center.x, me.body.center.y, me.enemy.body.center.x, me.enemy.body.center.y);
            angle = Phaser.Math.normalizeAngle(angle);
            if (Phaser.Math.fuzzyEqual(angle, Phaser.Math.PI2, epsilon)) {
                return true;
            }
            if (Phaser.Math.fuzzyEqual(angle, Math.PI / 2, epsilon)) {
                return true;
            }
            if (Phaser.Math.fuzzyEqual(angle, Math.PI, epsilon)) {
                return true;
            }
            if (Phaser.Math.fuzzyEqual(angle, 3 * Math.PI / 2, epsilon)) {
                return true;
            }

        }
        return false;
    }
}

class ActionFire extends b3.Action<Spider, SpiderBlackboard> {
    tick(t: b3.Tick<Spider, SpiderBlackboard>): b3.NodeState {
        t.me.fire();
        return b3.NodeState.RUNNING;
    }
}

class ConditionIsNearEnemy extends b3.Condition<Spider, SpiderBlackboard> {
    check(t: b3.Tick<Spider, SpiderBlackboard>): boolean {
        let me = t.me;
        return me.enemy && Phaser.Math.distance(me.body.center.x, me.body.center.y, me.enemy.body.center.x, me.enemy.body.center.y) < me.body.width * 2;
    }
}

class ActionAttackEnemy extends b3.Action<Spider, SpiderBlackboard> {
    tick(t: b3.Tick<Spider, SpiderBlackboard>): b3.NodeState {
        if (t.me.attackEnemy()) {
            return b3.NodeState.SUCCESS;
        } else {
            return b3.NodeState.RUNNING;
        }
    }
}

