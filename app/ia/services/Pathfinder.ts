/// <reference path="../../../typings/easystarjs.d.ts" />
/// <reference path="../../../typings/brunch-require.d.ts" />
import EasyStar = require('easystarjs');

export class Pathfinder {

    private easystar: EasyStar.js;
    private map: Phaser.Tilemap;

    constructor(map: Phaser.Tilemap) {
        this.map = map;
        const pathfindLayer = map.getLayerIndex('pathfind');
        const grid = new Array<Array<number>>();
        for (let row = 0; row < map.height; ++row) {
            var gridRow = new Array<number>(map.width);
            for (let column = 0; column < map.width; ++column) {
                const tile = map.getTile(column, row, pathfindLayer);
                gridRow[column] = this.isTileWalkable(tile) ? 1 : 0;
            }
            grid[row] = gridRow;
        }
        this.easystar = new EasyStar.js();
        this.easystar.setGrid(grid);
        this.easystar.enableDiagonals();
        this.easystar.setAcceptableTiles([1]);
    }

    randomWalkablePos(): Phaser.Point {
        const pathfindLayer = this.map.getLayerIndex('pathfind');
        const rnd = this.map.game.rnd;
        const maxChances = this.map.width * this.map.height;
        for (let i = 0; i < maxChances; ++i) {
            const x = rnd.integerInRange(0, this.map.width - 1);
            const y = rnd.integerInRange(0, this.map.height - 1);
            const tile = this.map.getTile(x, y, pathfindLayer);
            if (this.isTileWalkable(tile)) {
                return new Phaser.Point(tile.worldX, tile.worldY);
            }
        }
        return null;
    }

    isTileWalkable(tile: Phaser.Tile) {
        return tile && tile.properties['walkable'] == 1;
    }

    findPath(startX: number, startY: number, endX: number, endY: number, callback: (path: Phaser.Point[]) => void) {
        const tileStart = this.map.getTileWorldXY(startX, startY);
        const tileEnd = this.findNearestWalkableTile(endX, endY);
        if (!tileStart) {
            console.log('cannot find path starting out of the map: (' + startX + ';' + startY + ')');
            return;
        }
        if (tileEnd) {
            this.easystar.findPath(tileStart.x, tileStart.y, tileEnd.x, tileEnd.y, (path: { x: number, y: number }[]) => {
                let worldPath: Array<Phaser.Point>;
                if (path && path.length > 1) {
                    worldPath = new Array<Phaser.Point>(path.length - 1);
                    for (let i = 1; i < path.length; ++i) {
                        const tile = this.map.getTile(path[i].x, path[i].y);
                        worldPath[i - 1] = new Phaser.Point(tile.worldX + tile.width / 2, tile.worldY + tile.height / 2);
                    }
                } else {
                    worldPath = new Array<Phaser.Point>();
                }
                callback(worldPath);
            });
        } else {
            callback(new Array<Phaser.Point>());
        }
    }
    findNearestWalkableTile(endX: number, endY: number) {
        const pathfindLayer = this.map.getLayerIndex('pathfind');
        const tile = this.map.getTileWorldXY(endX, endY, this.map.tileWidth, this.map.tileHeight, pathfindLayer);
        if (this.isTileWalkable(tile)) {
            return tile;
        }
        let minTile = null;
        let minTileDistance = null;
        for (let dx = -10; dx < 10; ++dx) {
            for (let dy = -10; dy < 10; ++dy) {
                const t = this.map.getTile(tile.x + dx, tile.y + dy, pathfindLayer);
                if (this.isTileWalkable(t)) {
                    const tileDistance = Phaser.Math.distanceSq(0, 0, dx, dy);
                    if (!minTileDistance || tileDistance < minTileDistance) {
                        minTileDistance = tileDistance;
                        minTile = t;
                    }
                }
            }
        }
        return minTile;
    }
    update() {
        this.easystar.calculate();
    }

}