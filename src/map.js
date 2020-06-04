/* eslint-disable max-classes-per-file */
import { Map as RotMap } from "rot-js";
import { random } from "./util";
import { spriteSheet, tileSize, game } from "./globals";

const hitallTrapSprite = spriteSheet.getSprite(12, 0);
const damageTrapSprite = spriteSheet.getSprite(13, 0);

class Tile {
  constructor({ isWalkable, sprite }) {
    this.isWalkable = isWalkable;
    this.sprite = sprite;
    this.entity = null;
    this.trap = null;
    this.trapCallback = null;
  }

  triggerTrap() {
    if (this.trapCallback) {
      this.trapCallback();
      this.trap = null;
      this.trapCallback = null;
    }
  }

  isEmpty() {
    return !this.entity;
  }

  draw(x, y) {
    this.sprite.draw(x * tileSize, y * tileSize, tileSize, tileSize);
    if (this.trap) {
      if (this.trap === "damage") {
        damageTrapSprite.draw(x * tileSize, y * tileSize, tileSize, tileSize);
      }
      if (this.trap === "hitAll") {
        hitallTrapSprite.draw(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}

class Map {
  constructor({ gridSize, tileSize }) {
    this.gridSize = gridSize;
    this.tileSize = tileSize;
    this.spriteSheet = spriteSheet;
    this.map = [];

    const localMap = new RotMap.Cellular(gridSize, gridSize, {
      born: [4, 5],
      survive: [2, 3, 4, 5],
      connected: true,
    });
    localMap.randomize(0.4);
    localMap.create();
    localMap.create();
    localMap.connect(this.createMapCallback.bind(this));
  }

  createMapCallback(x, y, z) {
    const wallSprite = this.spriteSheet.getSprite(2, 0);
    const wallTile = new Tile({ isWalkable: false, sprite: wallSprite });

    const floorSprite = this.spriteSheet.getSprite(1, 0);
    const floorTile = new Tile({ isWalkable: true, sprite: floorSprite });
    if (!this.map[x]) {
      this.map[x] = [];
    }
    if (z) {
      this.map[x][y] = wallTile;
    } else {
      this.map[x][y] = floorTile;
    }
  }

  getTile(x, y) {
    return this.map[x][y];
  }

  getTileFromCanvasCoords(x, y) {
    const tileX = Math.ceil(x / this.tileSize);
    const tileY = Math.ceil(y / this.tileSize);
    return this.map[tileX][tileY];
  }

  getMapCoordsFromCanvasCoords(x, y) {
    const tileX = Math.ceil(x / this.tileSize);
    const tileY = Math.ceil(y / this.tileSize);
    return { x: tileX, y: tileY };
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  isPassable(x, y) {
    let isPassable = false;
    if (this.map[x] && this.map[x][y]) {
      isPassable = this.isInBounds(x, y) && this.map[x][y].isWalkable;
    }

    return isPassable;
  }

  isEmpty(x, y) {
    if (this.map[x] && this.map[x][y]) {
      return this.isInBounds(x, y) && this.map[x][y].isEmpty();
    }
    return false;
  }

  draw() {
    this.map.forEach((col, x) => {
      col.forEach((tile, y) => {
        tile.draw(x, y);
      });
    });
  }

  randomEmptyTile() {
    const x = random(0, this.gridSize);
    const y = random(0, this.gridSize);
    if (this.map[x][y].isEmpty() && this.map[x][y].isWalkable) {
      return { x, y };
    }
    return this.randomEmptyTile();
  }
}

export { Map };
