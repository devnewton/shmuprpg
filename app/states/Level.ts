/// <reference path="../../typings/phaser.d.ts"/>
import { AbstractState } from "./AbstractState.ts";
import { Hero } from "../entities/Hero.ts";

export class Level extends AbstractState {

    hero: Hero;

    constructor() {
        super();
    }

    preload() {
        this.hero = new Hero(this.game);
    }

    create() {
        super.create();
        this.hero.create();
    }
    
    update() {
        this.hero.update();
    }
}
