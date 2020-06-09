/* eslint-disable max-classes-per-file */
import { Path } from "rot-js";
import { random, randomFromArray } from "./util";
import { renderSpells, renderDom } from "./domController";
import {
  game,
  healthSprite,
  roostaSprite,
  coolDuckSprite,
  duckSprite,
  crabSprite,
  snakeSprite,
  waspSprite,
  starSprite,
  ouchDuckSprite,
  ouchCrabSprite,
  ouchSnakeSprite,
  ouchStarSprite,
  arrowUpSprite,
  arrowDownSprite,
  arrowRightSprite,
  arrowLeftSprite,
  spawningSprite,
  tileSize,
} from "./globals";
import { SpellsMixin } from "./spells";

class Entity {
  constructor({
    x,
    y,
    tileSize,
    map,
    doneCallback = () => {},
    noTile = false,
  }) {
    this.map = map;
    this.x = x;
    this.displayX = x;
    this.y = y;
    this.displayY = y;
    this.tileSize = tileSize;
    this.moving = false;
    this.sprite = coolDuckSprite;
    this.doneCallback = doneCallback;
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 10;

    if (!noTile) {
      const tile = this.map.getTileFromCanvasCoords(this.x, this.y);
      tile.entity = this;
    }
  }

  takeDamage(p = 1) {
    this.hp -= p;
    if (this.hp < 1) {
      this.getTile().entity = null;
      this.dead = true;
    }
  }

  getTile() {
    return this.map.getTileFromCanvasCoords(this.x, this.y);
  }

  takeTurn() {
    this.attackedThisTurn = false;
  }

  moveTo(x, y) {
    const newX = x * this.tileSize;
    const newY = y * this.tileSize;
    const coords = this.map.getMapCoordsFromCanvasCoords(newX, newY);
    if (!this.map.isInBounds(coords.x, coords.y)) return false;
    const newTile = this.map.getTileFromCanvasCoords(newX, newY);
    const oldTile = this.map.getTileFromCanvasCoords(this.x, this.y);
    if (newTile && newTile.isEmpty() && this.canWalkHere(coords.x, coords.y)) {
      this.displayX = this.x;
      this.displayY = this.y;
      this.x = newX;
      this.y = newY;
      newTile.entity = this;
      newTile.triggerTrap();
      oldTile.entity = null;
      this.moving = true;
      return true;
    }
    if (newTile && !newTile.isEmpty()) {
      const { entity } = newTile;
      if (entity.isRoosta || this.isRoosta) {
        this.displayX -= (this.displayX - entity.x) / 3;
        this.displayY -= (this.displayY - entity.y) / 3;
        entity.takeDamage();
        this.attackedThisTurn = true;
        return true;
      }
    }
    return false;
  }

  move(dx, dy, noAttack = false) {
    const newX = this.x + this.tileSize * dx;
    const newY = this.y + this.tileSize * dy;
    const coords = this.map.getMapCoordsFromCanvasCoords(newX, newY);
    if (!this.map.isInBounds(coords.x, coords.y)) return false;
    const newTile = this.map.getTileFromCanvasCoords(newX, newY);
    const oldTile = this.map.getTileFromCanvasCoords(this.x, this.y);
    if (newTile && newTile.isEmpty() && this.canWalkHere(coords.x, coords.y)) {
      this.displayX = this.x;
      this.displayY = this.y;
      this.x = newX;
      this.y = newY;
      newTile.entity = this;
      newTile.triggerTrap();
      oldTile.entity = null;
      this.moving = true;
      return true;
    }
    if (newTile && !newTile.isEmpty() && !noAttack) {
      const { entity } = newTile;
      if (entity.isRoosta || this.isRoosta) {
        this.displayX -= (this.displayX - entity.x) / 3;
        this.displayY -= (this.displayY - entity.y) / 3;
        entity.takeDamage();
        this.attackedThisTurn = true;
        return true;
      }
    }
    return false;
  }

  canWalkHere(x, y) {
    if (this.isBeingMoved) {
      this.isBeingMoved = false;
      return this.map.isInBounds(x, y);
    }
    return this.map.isPassable(x, y);
  }

  draw() {
    const { displayX, displayY, tileSize } = this;
    this.sprite.draw(displayX, displayY, tileSize, tileSize);
  }

  keydown() {}

  keyup() {}

  update(dt) {
    let movingX = true;
    if (Math.abs(this.displayX - this.x) > 2) {
      this.displayX -= (this.displayX - this.x) * this.speed * dt;
    } else {
      this.displayX = this.x;
      movingX = false;
    }
    if (Math.abs(this.displayY - this.y) > 2) {
      this.displayY -= (this.displayY - this.y) * this.speed * dt;
    } else {
      this.displayY = this.y;
      if (!movingX) {
        this.moving = false;
        this.speed = 10;
      }
    }
  }
}

class Roosta extends SpellsMixin(Entity) {
  constructor(opts) {
    super(opts);
    this.isRoosta = true;
    this.hp = 3;
    this.maxHp = 3;
    this.sprite = roostaSprite;
    this.coins = 0;
  }

  takeDamage() {
    super.takeDamage();
    document.dispatchEvent(
      new CustomEvent("sound", {
        detail: {
          sound: "cluck",
        },
      })
    );
    document.dispatchEvent(new CustomEvent("screenShake", {}));
    if (this.hp < 1) {
      document.dispatchEvent(new CustomEvent("die", {}));
    }
  }

  wait() {
    this.doneCallback();
  }

  move(dx, dy) {
    if (super.move(dx, dy)) {
      const tile = this.map.getTileFromCanvasCoords(this.x, this.y);
      if (tile.coin) {
        tile.coin = false;
        this.coins++;
        document.dispatchEvent(
          new CustomEvent("sound", {
            detail: {
              sound: "coin",
            },
          })
        );
        renderDom(game.level, this.coins);
        if (this.coins % 3 === 0) {
          this.getRandomSpell();
          renderSpells(this.spells);
        }
      }
      if (tile.exit) {
        document.dispatchEvent(new CustomEvent("exit"));
      } else {
        this.doneCallback();
      }
    }
  }

  moveTo(x, y) {
    if (super.moveTo(x, y)) {
      const tile = this.map.getTileFromCanvasCoords(this.x, this.y);
      if (tile.coin) {
        tile.coin = false;
        this.coins++;
        document.dispatchEvent(
          new CustomEvent("sound", {
            detail: {
              sound: "coin",
            },
          })
        );
        renderDom(game.level, this.coins);
        if (this.coins % 3 === 0) {
          this.getRandomSpell();
          renderSpells(this.spells);
        }
      }
      if (tile.exit) {
        document.dispatchEvent(new CustomEvent("exit"));
      } else {
        this.doneCallback();
      }
    }
  }

  keydown(key) {
    if (key === "ArrowRight") {
      this.move(1, 0);
    }
    if (key === "ArrowLeft") {
      this.move(-1, 0);
    }
    if (key === "ArrowUp") {
      this.move(0, -1);
    }
    if (key === "ArrowDown") {
      this.move(0, 1);
    }
    if (key >= 1 && key <= 9) {
      this.doSpell(this.spells[key - 1]);
    }
  }

  drawAvailableDirections() {
    const size = tileSize / 2;
    const midX = this.x + tileSize / 2 - size / 2;
    const midY = this.y + tileSize / 2 - size / 2;
    const { x, y } = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
    const tiles = this.map.getAdjacentEmptyTiles(x, y);
    tiles.forEach((tile) => {
      if (tile.y - y === -1) {
        arrowUpSprite.draw(midX, this.y - tileSize / 4, size, size);
      }
      if (tile.y - y === 1) {
        arrowDownSprite.draw(
          midX,
          this.y + tileSize - tileSize / 4,
          size,
          size
        );
      }
      if (tile.x - x === -1) {
        arrowLeftSprite.draw(this.x - tileSize / 4, midY, size, size);
      }
      if (tile.x - x === 1) {
        arrowRightSprite.draw(
          this.x + tileSize - tileSize / 4,
          midY,
          size,
          size
        );
      }
    });
  }

  draw() {
    super.draw();
    const { displayX, displayY, tileSize } = this;
    for (let i = 0; i < this.hp; i++) {
      healthSprite.draw(
        8 + displayX + 24 * i,
        displayY + 64,
        tileSize,
        tileSize
      );
    }
  }
}

class Monster extends Entity {
  constructor(opts) {
    super(opts);
    this.spawning = true;
  }

  takeTurn(roosta) {
    super.takeTurn();
    if (this.spawning) {
      this.spawning = false;
      return;
    }
    if (this.stunned) {
      this.stunned = false;
      return;
    }
    if (this.dead) return;
    const RoostaPos = this.map.getMapCoordsFromCanvasCoords(roosta.x, roosta.y);
    const astar = new Path.AStar(
      RoostaPos.x,
      RoostaPos.y,
      this.aStarCallback.bind(this),
      {
        topology: 4,
      }
    );
    const gridPos = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
    const coords = [];
    astar.compute(gridPos.x, gridPos.y, (x, y) => coords.push({ x, y }));
    if (coords[1]) {
      const dx = coords[1].x - gridPos.x;
      const dy = coords[1].y - gridPos.y;
      this.move(dx, dy);
    }
  }

  aStarCallback(x, y) {
    return this.map.isPassable(x, y);
  }

  update(dt) {
    super.update(dt);
    this.shakeTimer -= dt;
  }

  draw() {
    const { displayX, displayY, tileSize } = this;
    let offsetX = 0;
    let offsetY = 0;
    if (this.shakeTimer > 0) {
      offsetX = random(-50, 50) * this.shakeTimer;
      offsetY = random(-50, 50) * this.shakeTimer;
    }
    if (this.spawning) {
      spawningSprite.draw(displayX, displayY, tileSize, tileSize);
      return;
    }
    this.sprite.draw(
      displayX + offsetX,
      displayY + offsetY,
      tileSize,
      tileSize
    );
  }

  takeDamage(p) {
    super.takeDamage(p);
    this.stunned = true;
    this.spawning = false;
    this.shakeTimer = 0.2;
    if (this.hp < 1) {
      const tile = this.map.getTileFromCanvasCoords(this.x, this.y);
      if (Math.random() < 0.15) {
        tile.coin = true;
      }
      document.dispatchEvent(
        new CustomEvent("splode", {
          detail: {
            x: this.x,
            y: this.y,
          },
        })
      );
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "pop",
          },
        })
      );
    }
  }
}
class Crab extends Monster {
  // can do water
  constructor(opts) {
    super(opts);
    this.sprite = crabSprite;
    this.name = "crab";
    this.hp = 2;
  }

  canWalkHere(x, y) {
    return this.map.isInBounds(x, y);
  }

  aStarCallback(x, y) {
    return this.map.isInBounds(x, y);
  }

  takeTurn(roosta) {
    if (this.dead) return;
    super.takeTurn(roosta);
  }

  move(dx, dy) {
    super.move(dx, dy);
  }

  takeDamage(p) {
    super.takeDamage(p);
    if (this.hp > 0) {
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "snap",
          },
        })
      );
    }
    if (this.hp === 1) {
      this.sprite = ouchCrabSprite;
    }
  }
}
class Duck extends Monster {
  // hass 2hp
  constructor(opts) {
    super(opts);
    this.sprite = Math.random() < 0.8 ? duckSprite : coolDuckSprite;
    this.hp = 2;
    this.duck = true;
    this.name = "duck";
  }

  takeDamage(p) {
    super.takeDamage(p);
    if (this.hp > 0) {
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "quack",
          },
        })
      );
    }
    if (this.hp === 1) {
      this.sprite = ouchDuckSprite;
    }
  }

  update(dt) {
    super.update(dt);
  }
}
class Snake extends Monster {
  constructor(opts) {
    super(opts);
    this.sprite = snakeSprite;
    this.name = "snake";
    this.hp = 2;
  }

  takeDamage(p) {
    super.takeDamage(p);
    if (this.hp > 0) {
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "snap",
          },
        })
      );
    }
    if (this.hp === 1) {
      this.sprite = ouchSnakeSprite;
    }
  }
}
class Wasp extends Monster {
  // is fast
  constructor(opts) {
    super(opts);
    this.sprite = waspSprite;
    this.name = "wasp";
  }

  takeTurn(roosta) {
    super.takeTurn(roosta);
    if (!this.attackedThisTurn) {
      super.takeTurn(roosta);
    }
  }
}
class Star extends Monster {
  // is slow
  constructor(opts) {
    super(opts);
    this.sprite = starSprite;
    this.stunned = false;
    this.name = "star";
    this.hp = 2;
  }

  takeTurn(roosta) {
    if (this.stunned) {
      this.stunned = !this.stunned;
      return;
    }
    super.takeTurn(roosta);
    this.stunned = true;
  }

  takeDamage(p) {
    super.takeDamage(p);
    if (this.hp > 0) {
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "oof",
          },
        })
      );
    }
    if (this.hp === 1) {
      this.sprite = ouchStarSprite;
    }
  }
}

export { Crab, Duck, Star, Snake, Wasp, Roosta, Entity };
