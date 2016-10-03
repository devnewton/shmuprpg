/// <reference path="../../typings/phaser.d.ts"/>
import {Grobelin} from "./Grobelin.ts";
import { ShmuprpgGame } from "../ShmuprpgGame.ts";
import { Level } from "../states/Level.ts";
import { Pathfinder } from "../utils/Pathfinder.ts";


export class GrobelinHorde extends Phaser.Group {

    appearsRate = 1000;
    target: Phaser.Sprite;
    private nextAppearsTime = 0;
    private pathfinder: Pathfinder;

    constructor(target: Phaser.Sprite, pathFinder: Pathfinder, maxGrobelins: number = 1) {
        super(target.game);
        this.pathfinder = pathFinder;
        this.target = target;
        for (let i = 0; i < maxGrobelins; ++i) {
            this.add(this.createGrobelin());
        }
    }

    static preload(game: Phaser.Game) {
        game.load.atlasXML('grobelin', 'sprites/lpc/characters/grobelin.png', 'sprites/lpc/characters/lpc.xml');
    }

    update() {
        super.update();
        this.appears();
    }

    private createGrobelin(): Grobelin {
        const grobelin = new Grobelin(this.game, this.pathfinder);
        const game = <ShmuprpgGame>this.game;
        game.addSpriteAnimation(grobelin, 'lpc.hurt', 6);
        game.addSpriteAnimation(grobelin, 'lpc.walk.back', 9);
        game.addSpriteAnimation(grobelin, 'lpc.walk.front', 9);
        game.addSpriteAnimation(grobelin, 'lpc.walk.left', 9);
        game.addSpriteAnimation(grobelin, 'lpc.walk.right', 9);
        game.addSpriteAnimation(grobelin, 'lpc.thrust.back', 9);
        game.addSpriteAnimation(grobelin, 'lpc.thrust.front', 9);
        game.addSpriteAnimation(grobelin, 'lpc.thrust.left', 9);
        game.addSpriteAnimation(grobelin, 'lpc.thrust.right', 9);
        return grobelin;
    }

    private appears() {
        if (this.game.time.time >= this.nextAppearsTime) {
            const grobelin = <Grobelin>this.getFirstExists(false);
            if (grobelin) {
                const pos = this.pathfinder.randomWalkablePos();
                grobelin.appears(pos.x, pos.y, this.target);
                this.nextAppearsTime = this.game.time.time + this.appearsRate;
            }
        }
    }
}