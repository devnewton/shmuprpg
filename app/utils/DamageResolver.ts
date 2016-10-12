/// <reference path="../../typings/phaser.d.ts"/>
import {Vulnerable} from "../entities/features/Vulnerable.ts";

export class DamageResolver {
    game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    resolve(spriteOrGroupA: Phaser.Sprite | Phaser.Group, spriteOrGroupB: Phaser.Sprite | Phaser.Group) {
        this.game.physics.arcade.overlap(spriteOrGroupA, spriteOrGroupB, (a: Phaser.Sprite, b: Phaser.Sprite) => {
            const vulnerableA = a as (Phaser.Sprite & Vulnerable);
            if (DamageResolver.checkIfSpritesIntersect(a, b)) {
                a.damage(1);
                b.damage(1);
            }
        });
    }


    static checkIfSpritesIntersect(a: Phaser.Sprite, b: Phaser.Sprite): boolean {
        let vulnerableRectangleOfA = DamageResolver.getVulnerableRectanglesOf(a);
        let vulnerableRectangleOfB = DamageResolver.getVulnerableRectanglesOf(b);
        if (vulnerableRectangleOfA || vulnerableRectangleOfB) {
            vulnerableRectangleOfA = vulnerableRectangleOfA || [new Phaser.Rectangle(a.x, a.y, a.width, a.height)];
            vulnerableRectangleOfB = vulnerableRectangleOfB || [new Phaser.Rectangle(b.x, b.y, b.width, b.height)];
            return this.checkIfRectanglesIntersect(vulnerableRectangleOfA, vulnerableRectangleOfB);
        } else {
            return true;
        }
    }

    static checkIfRectanglesIntersect(rectanglesA: Array<Phaser.Rectangle>, rectanglesB: Array<Phaser.Rectangle>): boolean {
        for (let a of rectanglesA) {
            for (let b of rectanglesB) {
                if (a.intersects(b, 1)) {
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