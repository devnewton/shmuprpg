export module nanim {

    interface Frame {
        image: string;
        duration: number;
        u1: number;
        v1: number;
        u2: number;
        v2: number;
    }

    interface Animation {
        name: string;
        frames: Frame[];
    }

    interface Nanim {
        animations: Animation[];
    }

    export class NanimLoader {

        game: Phaser.Game;

        constructor(game: Phaser.Game) {
            this.game = game;
        }

        load(key: string, jsonUrl: string, imageUrl: string) {
            this.game.load.image(key, imageUrl);
            this.game.load.json(key, jsonUrl);
        }

        sprite(x: number, y: number, key?: any, frame?: any, group?: Phaser.Group): Phaser.Sprite {
            const nanim = <Nanim>this.game.cache.getJSON(key);
            const image = this.game.cache.getImage(key);
            const frameData = new Phaser.FrameData();
            for (const animation of nanim.animations) {
                for (let f = 0; f < animation.frames.length; ++f) {
                    const frameIndex = frameData.total;
                    const frame = animation.frames[f];
                    const x = frame.u1 * image.width;
                    const y = frame.v1 * image.height;
                    const w = (frame.u2 - frame.u1) * image.width;
                    const h = (frame.v2 - frame.v1) * image.height;
                    const spriteFrame = new Phaser.Frame(frameIndex, x, y, w, h, animation.name + f);
                    frameData.addFrame(spriteFrame);
                }
            }
            const sprite = this.game.add.sprite(x, y, key, frame, group);
            sprite.data = sprite.animations.copyFrameData(frameData, 0);
            let frameIndex = 0;
            for (const animation of nanim.animations) {
                const frameIndexes = new Array<number>();
                for (const f of animation.frames) {
                    frameIndexes.push(frameIndex++);
                }
                if (frameIndexes.length > 0) {
                    sprite.animations.add(animation.name, frameIndexes);
                }
            }
            return sprite;
        }
    }

}