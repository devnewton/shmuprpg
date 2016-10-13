/// <reference path="../../typings/phaser.d.ts"/>
import {Vulnerable} from "../entities/features/Vulnerable.ts";

export class DamageResolver {
    game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    groupVersusGroup(groupA: Phaser.Group, groupB: Phaser.Group) {
        for (let spriteA of groupA.children) {
            if (spriteA instanceof Phaser.Sprite) {
                this.spriteVersusGroup(spriteA, groupB);
            }
        }
    }

    spriteVersusGroup(spriteA: Phaser.Sprite, groupB: Phaser.Group) {
        if (spriteA.exists) {
            for (let spriteB of groupB.children) {
                if (spriteB instanceof Phaser.Sprite) {
                    this.spriteVersusSprite(spriteA, spriteB);
                }
            }
        }
    }

    spriteVersusSprite(spriteA: Phaser.Sprite, spriteB: Phaser.Sprite) {
        if (spriteA.exists && spriteB.exists && DamageResolver.checkIfSpritesIntersect(spriteA, spriteB)) {
            spriteA.damage(1);
            spriteB.damage(1);
        }
    }

    static checkIfSpritesIntersect(a: Phaser.Sprite, b: Phaser.Sprite): boolean {
        let vulnerableRectangleOfA = DamageResolver.getVulnerableRectanglesOf(a);
        let vulnerableRectangleOfB = DamageResolver.getVulnerableRectanglesOf(b);
        if (vulnerableRectangleOfA && vulnerableRectangleOfB) {
            return this.checkIfRectanglesIntersect(vulnerableRectangleOfA, vulnerableRectangleOfB);
        } else {
            return false;
        }
    }

    static checkIfRectanglesIntersect(rectanglesA: Array<Phaser.Rectangle>, rectanglesB: Array<Phaser.Rectangle>): boolean {
        for (let a of rectanglesA) {
            for (let b of rectanglesB) {
                if (a.intersects(b, 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    static getVulnerableRectanglesOf(s: Phaser.Sprite | (Phaser.Sprite & Vulnerable)) {
        let result: Array<Phaser.Rectangle>;
        if (DamageResolver.isVulnerable(s)) {
            result = (s as Vulnerable).getVulnerableRectangles();
        }
        return result;
    }

    static isVulnerable(s: any): s is Vulnerable {
        return s.getVulnerableRectangles != undefined;
    }
}