/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts";
import { Hero } from "../entities/Hero.ts";
import {BirdFlock} from "../entities/BirdFlock.ts";
import {GrobelinHorde} from "../entities/GrobelinHorde.ts";
import {SpiderHorde} from "../entities/SpiderHorde.ts";
import {Grobelin} from "../entities/Grobelin.ts";
import {Vulnerable} from "../entities/features/Vulnerable.ts";

import {Pathfinder} from "../ia/services/Pathfinder.ts"

export class Level extends AbstractState {

    hero: Hero;
    collisionSprites: Phaser.Group;
    birdFlock: BirdFlock;
    grobelinHorde: GrobelinHorde;
    spiderHorde: SpiderHorde;
    pathfinder: Pathfinder;

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
        this.birdFlock = new BirdFlock(this.hero);
        this.game.add.existing(this.birdFlock);
        this.grobelinHorde = new GrobelinHorde(this.hero, this.pathfinder, 0);
        this.game.add.existing(this.grobelinHorde);
        this.spiderHorde = new SpiderHorde(this.hero, this.pathfinder, 1);
        this.game.add.existing(this.spiderHorde);
    }

    update() {
        this.pathfinder.update();
        this.hero.update();
        this.game.physics.arcade.collide(this.hero, this.collisionSprites);
        this.resolveWeaponsEffects();
    }

    resolveWeaponsEffects() {
        this.game.physics.arcade.overlap(this.birdFlock, this.hero.weapon, (bird: Phaser.Sprite, bullet: Phaser.Sprite) => {
            bird.kill();
            bullet.kill();
        });
        this.game.physics.arcade.overlap(this.hero, this.birdFlock, (hero: Phaser.Sprite, bird: Phaser.Sprite) => {
            bird.kill();
            this.hero.damage(1);
        });
        this.resolveBulletsVersusVulnerables(this.hero.weapon, this.grobelinHorde);
        this.resolveBulletsVersusVulnerables(this.hero.weapon, this.spiderHorde);
    }

    resolveBulletsVersusVulnerables(weapon: Phaser.Group, vulnerables: Phaser.Group) {
        for (let b of weapon.children) {
            const bullet = <Phaser.Sprite>b;
            if (bullet.exists) {
                const bulletRect = new Phaser.Rectangle(bullet.x, bullet.y, bullet.width, bullet.height);
                vulnerables_loop: for (let c of vulnerables.children) {
                    const vulnerable = c as Vulnerable & Phaser.Sprite;
                    if (vulnerable.exists) {
                        for (let v of vulnerable.getVulnerableRectangles()) {
                            if (bulletRect.intersects(v, 1)) {
                                bullet.kill();
                                vulnerable.damage(1);
                                break vulnerables_loop;
                            }
                        }
                    }
                }
            }
        }
    }

    render() {
    }
}
