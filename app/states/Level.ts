/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts";
import { Hero } from "../entities/Hero.ts";
import {BirdFlock} from "../entities/BirdFlock.ts";
import {GrobelinHorde} from "../entities/GrobelinHorde.ts";
import {SpiderHorde} from "../entities/SpiderHorde.ts";
import {Spider} from "../entities/Spider.ts";

import {Vulnerable} from "../entities/features/Vulnerable.ts";


import {Pathfinder} from "../ia/services/Pathfinder.ts";
import {DamageResolver} from "../utils/DamageResolver.ts";

export class Level extends AbstractState {

    hero: Hero;
    collisionSprites: Phaser.Group;
    birdFlock: BirdFlock;
    grobelinHorde: GrobelinHorde;
    spiderHorde: SpiderHorde;
    pathfinder: Pathfinder;
    damageResolver: DamageResolver;

    constructor() {
        super();
    }

    preload() {
        BirdFlock.preload(this.game);
        GrobelinHorde.preload(this.game);
        SpiderHorde.preload(this.game);
        Hero.preload(this.game);
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

        this.damageResolver = new DamageResolver(this.game);

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

        this.hero = new Hero(this.game);
        this.game.add.existing(this.hero);
        this.birdFlock = new BirdFlock(this.hero, 0);
        this.game.add.existing(this.birdFlock);
        this.grobelinHorde = new GrobelinHorde(this.hero, this.pathfinder, 0);
        this.game.add.existing(this.grobelinHorde);
        this.spiderHorde = new SpiderHorde(this.hero, this.pathfinder, 0);
        this.game.add.existing(this.spiderHorde);

 this.game.time.events.add(1000, () => this.birdFlock.reset(this.hero, 10));
        /*
        this.game.time.events.add(1000, () => this.grobelinHorde.reset(this.hero, 3));
        this.game.time.events.add(60000, () => this.spiderHorde.reset(this.hero, 4));
        this.game.time.events.add(12000, () => this.birdFlock.reset(this.hero, 10));
        */
    }

    update() {
        this.pathfinder.update();
        this.hero.update();
        this.game.physics.arcade.collide(this.hero, this.collisionSprites);
        this.resolveWeaponsEffects();
    }

    resolveWeaponsEffects() {
        this.damageResolver.groupVersusGroup(this.hero.weapon, this.birdFlock);
        this.damageResolver.spriteVersusGroup(this.hero, this.birdFlock);
        this.damageResolver.groupVersusGroup(this.hero.weapon, this.grobelinHorde);
        this.damageResolver.groupVersusGroup(this.hero.weapon, this.spiderHorde);
        for (let spider of this.spiderHorde.children) {
            this.damageResolver.spriteVersusGroup(this.hero, (<Spider>spider).machineGun);
        }
    }

    render() {
        for(let b of this.birdFlock.children) {
            let vulnerable = <Vulnerable><any>b;
            for(let v of vulnerable.getVulnerableRectangles()) {
                this.game.debug.rectangle(v);
            }
         }
    }
}
