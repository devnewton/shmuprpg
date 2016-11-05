/// <reference path="../../typings/phaser.d.ts"/>
import {Spider} from "./Spider";
import { ShmuprpgGame } from "../ShmuprpgGame";
import { Level } from "../states/Level";
import { Pathfinder } from "../ia/services/Pathfinder";

export class SpiderHorde extends Phaser.Group {

    appearsRate = 10000;
    target: Phaser.Sprite;
    private nextAppearsTime = 0;
    private pathfinder: Pathfinder;

    constructor(target: Phaser.Sprite, pathFinder: Pathfinder, maxSpiders: number = 4) {
        super(target.game);
        this.pathfinder = pathFinder;
        this.reset(target, maxSpiders);

    }

    reset(target: Phaser.Sprite, maxSpiders: number = 4) {
        this.target = target;
        this.removeAll();
        for (let i = 0; i < maxSpiders; ++i) {
            this.add(this.createSpider());
        }
    }

    static preload(game: Phaser.Game) {
        game.load.atlasXML('spider', 'sprites/lpc/spiders/spider01.png', 'sprites/lpc/spiders/spider.xml');
    }

    update() {
        super.update();
        this.appears();
    }

    private createSpider(): Spider {
        const spider = new Spider(this.game, this.pathfinder);
        const game = <ShmuprpgGame>this.game;
        game.addSpriteAnimation(spider.spiderDeath, 'spider.hurt', 6);
        game.addSpriteAnimation(spider, 'spider.stand.back', 6);
        game.addSpriteAnimation(spider, 'spider.stand.front', 6);
        game.addSpriteAnimation(spider, 'spider.stand.left', 6);
        game.addSpriteAnimation(spider, 'spider.stand.right', 6);
        game.addSpriteAnimation(spider, 'spider.walk.back', 9);
        game.addSpriteAnimation(spider, 'spider.walk.front', 9);
        game.addSpriteAnimation(spider, 'spider.walk.left', 9);
        game.addSpriteAnimation(spider, 'spider.walk.right', 9);
        game.addSpriteAnimation(spider, 'spider.attack.back', 9);
        game.addSpriteAnimation(spider, 'spider.attack.front', 9);
        game.addSpriteAnimation(spider, 'spider.attack.left', 9);
        game.addSpriteAnimation(spider, 'spider.attack.right', 9);
        return spider;
    }

    private appears() {
        if (this.game.time.time >= this.nextAppearsTime) {
            const spider = <Spider>this.getFirstExists(false);
            if (spider) {
                const pos = this.pathfinder.randomWalkablePos();
                spider.appears(pos.x, pos.y, this.target);
                this.nextAppearsTime = this.game.time.time + this.appearsRate;
            }
        }
    }
}