/// <reference path="../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts"; // you import only AClass

export class Level extends AbstractState {


    constructor() {
        super();
    }

    preload() {
        this.game.load.image('grobelin', 'sprites/grobelin.png');
        this.game.load.image('tobira', 'sprites/tobira.png');
        this.game.load.json('lpc', 'sprites/lpc.json');
    }

    loadAnimations(sprite: Phaser.Sprite, nanimJson: any) {
        const imageWidth = 832;
        const imageHeight = 1344;
        const frameData = new Phaser.FrameData();
        for (const animation of nanimJson.animations) {
            for (let f = 0; f < animation.frames.length; ++f) {
                const frameIndex = frameData.total;
                const frame = animation.frames[f];
                const x = frame.u1 * imageWidth;
                const y = frame.v1 * imageHeight;
                const w = (frame.u2 - frame.u1) * imageWidth;
                const h = (frame.v2 - frame.v1) * imageHeight;
                const spriteFrame = new Phaser.Frame(frameIndex, x, y, w, h, animation.name + f);
                frameData.addFrame(spriteFrame);
            }
        }
        sprite.data = 
        sprite.animations.copyFrameData(frameData, 0);
        let frameIndex = 0;
        for (const animation of nanimJson.animations) {
            const frameIndexes = new Array<number>();
            for (const f of animation.frames) {
                frameIndexes.push(frameIndex++);
            }
            if (frameIndexes.length > 0) {
                sprite.animations.add(animation.name, frameIndexes);
            }
        }
    }

    create() {
        super.create();
        const sprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'tobira');
        sprite.scale.x = 2;
        sprite.scale.y = 2;
        this.loadAnimations(sprite, this.cache.getJSON('lpc'));
        sprite.play("lpc.spellcast.front", 2, true);
        sprite.anchor.setTo(0.5, 0.5);
    }
}
