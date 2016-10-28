/// <reference path="../../typings/phaser.d.ts"/>
export class MenuButton extends Phaser.Button{

    constructor(game: Phaser.Game, label: string, x: number, y: number, callback: Function) {
        super(game, x, y, 'menu-buttons', callback, null, 'over', 'out', 'down');
        let labelText = new Phaser.Text(this.game, 140, 15, label, {font: "64px monospace", fill: 'white'});
        this.addChild(labelText);
        game.add.existing(this);
    }

    static preload(game: Phaser.Game) {
        game.load.atlasXML('menu-buttons', 'menu/buttons.png', 'menu/buttons.xml');
    }

}