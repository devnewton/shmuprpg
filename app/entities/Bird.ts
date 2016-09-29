/// <reference path="../../typings/phaser.d.ts"/>

export class Bird extends Phaser.Sprite {

    birdExplosion: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        super(game, 0, 0, 'bird');
        this.animations.add('fly');
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.setTo(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        this.birdExplosion = this.game.add.sprite(this.x, this.y, 'bird-explosion');
        this.birdExplosion.anchor.setTo(0.5, 0.5);
        this.birdExplosion.exists = false;
        const explodeAnimation = this.birdExplosion.animations.add('explode');
        explodeAnimation.killOnComplete = true;
    }

    fly(fromX: number, fromY: number, angle: number) {
        const beforeBird = this.game.add.sprite(fromX, fromY, 'before-bird');
        beforeBird.anchor.setTo(0.5, 0.5);
        const beforeBirdAnimation = beforeBird.animations.add('appears');
        beforeBirdAnimation.onComplete.add(() => {
            beforeBird.destroy();
            this.reset(fromX, fromY);
            this.play('fly', 8, true);
            this.game.physics.arcade.velocityFromRotation(angle, 300, this.body.velocity);
            this.scale.set(this.body.velocity.x < 0 ? -1 : 1, 1);
        });
        beforeBirdAnimation.play(4, false);
    }

    kill(): Phaser.Sprite {
        super.kill();
        this.birdExplosion.reset(this.x, this.y);
        this.birdExplosion.play('explode', 8, false);
        return this;
    }
}
