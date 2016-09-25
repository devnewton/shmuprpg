/// <reference path="../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts";
import { nanim } from "./nanim.ts";

export class Level extends AbstractState {
    
    nanimLoader: nanim.NanimLoader;

    constructor() {
        super();
    }

    preload() {
        this.nanimLoader = new nanim.NanimLoader(this.game);
        this.nanimLoader.load('tobira','sprites/lpc.json', 'sprites/tobira.png')
    }

    create() {
        super.create();
        const sprite = this.nanimLoader.sprite(this.game.world.centerX, this.game.world.centerY, 'tobira')
        sprite.scale.x = 2;
        sprite.scale.y = 2;
        sprite.play("lpc.spellcast.front", 2, true);
        sprite.anchor.setTo(0.5, 0.5);
    }
}
