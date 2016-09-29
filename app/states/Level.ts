/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts";
import { Hero } from "../entities/Hero.ts";
import {BirdFlock} from "../entities/BirdFlock.ts";


export class Level extends AbstractState {

    hero: Hero;
    collisionSprites: Phaser.Group;
    birdFlock: BirdFlock;

    constructor() {
        super();
    }

    preload() {
        this.hero = new Hero(this.game);
        BirdFlock.preload(this.game);
        this.game.load.tilemap('map', 'levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('terrains', 'sprites/lpc/terrains/terrains.png');
        this.game.load.image('cottage', 'sprites/lpc/thatched-roof-cottage/cottage.png');
        this.game.load.image('thatched-roof', 'sprites/lpc/thatched-roof-cottage/thatched-roof.png');
        this.game.load.image('doors', 'sprites/lpc/windows-doors/doors.png');
        this.game.load.image('windows', 'sprites/lpc/windows-doors/windows.png');
    }

    create() {
        super.create();
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        const map = this.game.add.tilemap('map');
        map.addTilesetImage('terrains');
        map.addTilesetImage('cottage');
        map.addTilesetImage('thatched-roof');
        map.addTilesetImage('doors');
        map.addTilesetImage('windows');

        const layer = map.createLayer('grounds');
        map.createLayer('plants');
        map.createLayer('walls');
        map.createLayer('doors_and_windows');
        map.createLayer('roofs');
        layer.resizeWorld();

        this.collisionSprites = this.game.add.physicsGroup(Phaser.Physics.ARCADE);;
        for (let o of map.objects['collision']) {
            if (o.rectangle) {
                const sprite = this.game.add.sprite(o.x, o.y);
                this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
                sprite.body.immovable = true;
                sprite.width = o.width;
                sprite.height = o.height;
                this.collisionSprites.add(sprite);
            }
        }

        this.hero.create();
        this.game.add
        this.birdFlock = new BirdFlock(this.hero.sprite);
        this.game.add.existing(this.birdFlock);
    }

    update() {
        this.hero.update();
        this.game.physics.arcade.collide(this.hero.sprite, this.collisionSprites);
        this.game.physics.arcade.overlap(this.birdFlock, this.hero.weapon, (bird: Phaser.Sprite, bullet: Phaser.Sprite) => {
            bird.kill();
            bullet.kill();
        });
        this.game.physics.arcade.overlap(this.hero.sprite, this.birdFlock, (hero: Phaser.Sprite, bird: Phaser.Sprite) => {
            bird.kill();
            this.hero.damage(1);
        });
    }

    render() {
        /*for (let s of this.collisionSprites.children) {
            this.game.debug.body(<Phaser.Sprite>s);
        }
        this.game.debug.body(this.hero.sprite);*/
    }
}
