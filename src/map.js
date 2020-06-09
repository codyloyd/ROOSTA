/* eslint-disable max-classes-per-file */
import { Map as RotMap } from "rot-js";
import { random, shuffleArray, tryTo } from "./util";
import { spriteSheet, tileSize, game } from "./globals";

const hitallTrapSprite = spriteSheet.getSprite(12, 0);
const damageTrapSprite = spriteSheet.getSprite(13, 0);
const exitSprite = spriteSheet.getSprite(18, 0);
const coinSprite = spriteSheet.getSprite(16, 0);

class Tile {
  constructor({ isWalkable, sprite, x, y, map }) {
    this.isWalkable = isWalkable;
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.entity = null;
    this.trap = null;
    this.trapCallback = null;
    this.effectCounter = 0;
    this.exit = false;
    this.coin = false;
    this.map = map;
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

  setEffect(sprite) {
    this.effect = sprite;
    this.effectCounter = 1;
  }

  getNeighbor(dx, dy) {
    return this.map.getTile(this.x + dx, this.y + dy);
  }

  getAdjacentNeighbors() {
    return shuffleArray([
      this.getNeighbor(0, -1),
      this.getNeighbor(0, 1),
      this.getNeighbor(-1, 0),
      this.getNeighbor(1, 0),
    ]);
  }

  getAdjacentPassableNeighbors() {
    return this.getAdjacentNeighbors().filter((t) => t.isWalkable);
  }

  getConnectedTiles() {
    let connectedTiles = [this];
    let frontier = [this];
    while (frontier.length) {
      const neighbors = frontier
        .pop()
        .getAdjacentPassableNeighbors()
        .filter((t) => !connectedTiles.includes(t));
      connectedTiles = connectedTiles.concat(neighbors);
      frontier = frontier.concat(neighbors);
    }
    return connectedTiles;
  }

  update(dt) {
    if (this.effectCounter) {
      this.effectCounter = Math.max(this.effectCounter - dt, 0);
    }
  }

  drawEffect(x, y) {
    if (this.effectCounter) {
      game.context.globalAlpha = this.effectCounter / 1;
      this.effect.draw(x * tileSize, y * tileSize, tileSize, tileSize);
      game.context.globalAlpha = 1;
    }
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
    if (this.exit) {
      exitSprite.draw(x * tileSize, y * tileSize, tileSize, tileSize);
    }
    if (this.coin) {
      coinSprite.draw(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

class Map {
  constructor({ gridSize, tileSize }) {
    this.gridSize = gridSize;
    this.tileSize = tileSize;
    this.spriteSheet = spriteSheet;
    this.map = [];
    this.generateMap(gridSize);
    tryTo("generate map", () => {
      const passableTiles = this.generateMap(gridSize);
      const { x, y } = this.randomEmptyTile();
      return this.getTile(x, y).getConnectedTiles().length === passableTiles;
    });
    // set exit
    const { x, y } = this.randomEmptyTile();
    this.getTile(x, y).exit = true;
    // set coins
    for (let i = 0; i < 3; i++) {
      const { x, y } = this.randomEmptyTile();
      this.getTile(x, y).coin = true;
    }
  }

  generateMap(gridSize) {
    let passableTiles = 0;
    const wallSprite = this.spriteSheet.getSprite(2, 0);
    const floorSprite = this.spriteSheet.getSprite(1, 0);
    for (let i = 0; i < gridSize; i++) {
      this.map[i] = [];
      for (let j = 0; j < gridSize; j++) {
        if (Math.random() < 0.3) {
          this.map[i][j] = new Tile({
            isWalkable: false,
            sprite: wallSprite,
            x: i,
            y: j,
            map: this,
          });
        } else {
          passableTiles++;
          this.map[i][j] = new Tile({
            isWalkable: true,
            sprite: floorSprite,
            x: i,
            y: j,
            map: this,
          });
        }
      }
    }
    return passableTiles;
  }

  getTile(x, y) {
    if (this.isInBounds(x, y)) {
      return this.map[x][y];
    }
    return new Tile({ isWalkable: false });
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

  update(dt) {
    this.map.forEach((col, x) => {
      col.forEach((tile, y) => {
        tile.update(dt);
      });
    });
  }

  draw() {
    this.map.forEach((col, x) => {
      col.forEach((tile, y) => {
        tile.draw(x, y);
      });
    });
  }

  drawEffects() {
    this.map.forEach((col, x) => {
      col.forEach((tile, y) => {
        tile.drawEffect(x, y);
      });
    });
  }

  getAdjacentTiles(x, y) {
    const tiles = [];
    const x1 = x - 1;
    const x2 = x + 1;
    const y1 = y - 1;
    const y2 = y + 1;
    if (this.isInBounds(x1, y)) {
      tiles.push(this.getTile(x1, y));
    }
    if (this.isInBounds(x2, y)) {
      tiles.push(this.getTile(x2, y));
    }
    if (this.isInBounds(x, y1)) {
      tiles.push(this.getTile(x, y1));
    }
    if (this.isInBounds(x, y2)) {
      tiles.push(this.getTile(x, y2));
    }
    return tiles;
  }

  getAdjacentEmptyTiles(x, y) {
    return this.getAdjacentTiles(x, y).filter(
      (t) => t.isEmpty() && t.isWalkable
    );
  }

  randomEmptyTile() {
    const x = random(0, this.gridSize);
    const y = random(0, this.gridSize);
    if (
      this.map[x][y].isEmpty() &&
      this.map[x][y].isWalkable &&
      !this.map[x][y].exit &&
      !this.map[x][y].coin
    ) {
      return { x, y };
    }
    return this.randomEmptyTile();
  }
}

export { Map };
