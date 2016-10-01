/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts";
import { Hero } from "../entities/Hero.ts";
import {BirdFlock} from "../entities/BirdFlock.ts";
import {GrobelinHorde} from "../entities/GrobelinHorde.ts";
import {Grobelin} from "../entities/Grobelin.ts";

import {Pathfinder} from "../utils/Pathfinder.ts"

export class Level extends AbstractState {

    hero: Hero;
    collisionSprites: Phaser.Group;
    birdFlock: BirdFlock;
    grobelinHorde: GrobelinHorde;
    pathfinder: Pathfinder;

    constructor() {
        super();
    }

    preload() {
        this.hero = new Hero(this.game);
        BirdFlock.preload(this.game);
        GrobelinHorde.preload(this.game);
        this.game.load.tilemap('map', 'levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('terrains', 'sprites/lpc/terrains/terrains.png');
        this.game.load.image('cottage', 'sprites/lpc/thatched-roof-cottage/cottage.png');
        this.game.load.image('thatched-roof', 'sprites/lpc/thatched-roof-cottage/thatched-roof.png');
        this.game.load.image('doors', 'sprites/lpc/windows-doors/doors.png');
        this.game.load.image('windows', 'sprites/lpc/windows-doors/windows.png');
        this.game.load.image('obj_misk_atlas', 'sprites/lpc/tile-atlas2/obj_misk_atlas.png');
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
        map.addTilesetImage('obj_misk_atlas');

        const layer = map.createLayer('grounds');
        map.createLayer('plants');
        map.createLayer('walls');
        map.createLayer('bridges');
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
        
        this.pathfinder = new Pathfinder(map);

        this.hero.create();
        this.birdFlock = new BirdFlock(this.hero.sprite, 0);
        this.game.add.existing(this.birdFlock);
        this.grobelinHorde = new GrobelinHorde(this.hero.sprite);
        this.game.add.existing(this.grobelinHorde);
    }

    update() {
        this.pathfinder.update();
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
     /* for(let c of this.grobelinHorde.children) {
            const s = <Grobelin>c;
            this.game.debug.body(s);
            this.game.debug.geom(new Phaser.Point(s.body.center.x, s.body.center.y), '#ff0000');
            for (let p of s.path) {
                this.game.debug.geom(new Phaser.Point(p.x, p.y), '#0000FF');
            }
        }*/
    }
}
