/// <reference path="../../typings/phaser.d.ts"/>
import {ShmuprpgGame} from "../ShmuprpgGame.ts";
import {CircularGun} from "./CircularGun.ts";
import {Pathfinder} from "../ia/services/Pathfinder.ts";
import * as b3 from "../ia/decisions/b3.ts";

export class Bunny extends Phaser.Sprite {

    birdExplosion: Phaser.Sprite;
    pathfinder: Pathfinder;
    blackboard: BunnyBlackboard;
    weapon: CircularGun;
    private damageTween: Phaser.Tween;

    constructor(game: Phaser.Game, pathfinder: Pathfinder) {
        super(game, 0, 0, 'bunny');
        this.pathfinder = pathfinder;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.walk.front', 7);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.walk.back', 7);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.walk.right', 7);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.walk.left', 7);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.stand.front', 1);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.stand.back', 1);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.stand.right', 1);
        (<ShmuprpgGame>this.game).addSpriteAnimation(this, 'bunny.stand.left', 1);
        this.birdExplosion = this.game.add.sprite(this.x, this.y, 'bird-explosion');
        this.birdExplosion.anchor.setTo(0.5, 0.5);
        this.birdExplosion.exists = false;
        const explodeAnimation = this.birdExplosion.animations.add('explode');
        explodeAnimation.killOnComplete = true;
        this.weapon = new CircularGun(this.game);
    }

    static preload(game: Phaser.Game) {
        game.load.atlasXML('bunny', 'sprites/lpc/bunny/bunny.png', 'sprites/lpc/bunny/bunny.xml');
    }

    appears(fromX: number, fromY: number) {
        const beforeBunny = this.game.add.sprite(fromX, fromY, 'before-bird');
        beforeBunny.anchor.setTo(0.5, 0.5);
        const beforeBunnyAnimation = beforeBunny.animations.add('appears');
        beforeBunnyAnimation.onComplete.add(() => {
            beforeBunny.destroy();
            this.reset(fromX, fromY, 10);
            this.blackboard = new BunnyBlackboard();
        });
        beforeBunnyAnimation.play(4, false);
    }

    update() {
        super.update();
        if (this.exists) {
            this.executeBehaviorTree();
        }
    }

    private executeBehaviorTree() {
        BunnyB3.get().tick(this, this.blackboard);
    }

    damage(amount: number): Phaser.Sprite {
        super.damage(amount);
        if (!this.damageTween) {
            this.damageTween = this.game.add.tween(this).from({ tint: 0xFF0000 }).to({ tint: 0xFFFFFF }, 500, Phaser.Easing.Linear.None, true, 0, 4, false);
            this.damageTween.onComplete.add((): void => this.damageTween = null);
        }
        this.blackboard.fearLevel = 60;
        return this;
    }

    kill(): Phaser.Sprite {
        super.kill();
        if(this.damageTween) {
            this.damageTween.stop(true);
        }
        this.birdExplosion.reset(this.x, this.y);
        this.birdExplosion.play('explode', 8, false);
        return this;
    }
}

class BunnyBlackboard extends b3.Blackboard {
    currentPathPointTarget: Phaser.Point;
    path: Array<Phaser.Point>;
    fearLevel = 60;
}

class BunnyB3 extends b3.Tree<Bunny, BunnyBlackboard> {

    private static singleton: BunnyB3;
    static get() {
        return this.singleton || (this.singleton = new BunnyB3());
    }

    constructor() {
        super();
        this.root = this.selector(
            new ActionFollowPath(),
            this.sequence(new ConditionFeelSafe(), new ActionAttack()),
            new ActionSearchAPath());
    }
}


class ActionFollowPath extends b3.Action<Bunny, BunnyBlackboard> {
    tick(t: b3.Tick<Bunny, BunnyBlackboard>): b3.NodeState {
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

    animate(me: Bunny) {
        if (Math.abs(me.body.velocity.x) > Math.abs(me.body.velocity.y)) {
            if (me.body.velocity.x < 0) {
                me.play("bunny.walk.left", 8, false);
            } else if (me.body.velocity.x > 0) {
                me.play("bunny.walk.right", 8, false);
            } else if (me.body.velocity.y < 0) {
                me.play("bunny.walk.back", 8, false);
            } else if (me.body.velocity.y > 0) {
                me.play("bunny.walk.front", 8, false);
            } else {
                me.play("bunny.stand.front", 0, false);
            }
        } else {
            if (me.body.velocity.y < 0) {
                me.play("bunny.walk.back", 8, false);
            } else if (me.body.velocity.y > 0) {
                me.play("bunny.walk.front", 8, false);
            } else if (me.body.velocity.x < 0) {
                me.play("bunny.walk.left", 8, false);
            } else if (me.body.velocity.x > 0) {
                me.play("bunny.walk.right", 8, false);
            } else {
                me.play("bunny.stand.front", 0, false);
            }
        }
    }

    moveToXY(me: Bunny, x: number, y: number, speed: number = 60) {
        var angle = Math.atan2(y - me.body.center.y, x - me.body.center.x);
        me.body.velocity.x = Math.cos(angle) * speed;
        me.body.velocity.y = Math.sin(angle) * speed;
    }
}

class ActionSearchAPath extends b3.Action<Bunny, BunnyBlackboard> {

    thinking = new b3.BlackboardKey<boolean>();

    tick(t: b3.Tick<Bunny, BunnyBlackboard>): b3.NodeState {
        let thinking = t.blackboard.get(this.thinking) || false;
        let me = t.me;
        if (!thinking) {
            t.blackboard.set(this.thinking, true);
            let targetPos = me.pathfinder.randomWalkablePos();
            me.pathfinder.findPath(me.body.center.x, me.body.center.y, targetPos.x, targetPos.y, (path: Phaser.Point[]) => {
                t.blackboard.path = path || [];
                t.blackboard.set(this.thinking, false);
            });
        }
        let path = t.blackboard.path || [];
        return path.length > 0 ? b3.NodeState.SUCCESS : b3.NodeState.RUNNING;
    }
}

class ConditionFeelSafe extends b3.Action<Bunny, BunnyBlackboard>  {
    tick(t: b3.Tick<Bunny, BunnyBlackboard>): b3.NodeState {
        let fearLevel = t.blackboard.fearLevel > 0 ? t.blackboard.fearLevel-- : 0;
        if (fearLevel == 0) {
            return b3.NodeState.SUCCESS;
        }
        if (fearLevel == 60) {
            return b3.NodeState.FAILURE;
        }
        return b3.NodeState.RUNNING;
    }
}

class ActionAttack extends b3.Action<Bunny, BunnyBlackboard> {
    tick(t: b3.Tick<Bunny, BunnyBlackboard>): b3.NodeState {
        t.me.weapon.fire(t.me.centerX, t.me.centerY);
        return b3.NodeState.RUNNING;
    }
}