/* eslint-disable max-classes-per-file */
import { Path } from "rot-js";
import { random, randomFromArray } from "./util";
import { renderSpells } from "./domController";
import {
  healthSprite,
  roostaSprite,
  coolDuckSprite,
  duckSprite,
  crabSprite,
  snakeSprite,
  waspSprite,
  starSprite,
  ouchDuckSprite,
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
      this.doneCallback();
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
      // this.col();
      this.doSpell(this.spells[key - 1]);
      renderSpells(this.spells);
    }
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
  takeTurn(roosta) {
    super.takeTurn();
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

  takeDamage(p) {
    super.takeDamage(p);
    this.stunned = true;
    if (this.hp < 1) {
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
  }

  update(dt) {
    super.update(dt);
    if (this.hp == 1) {
      this.sprite = ouchDuckSprite;
    }
  }
}
class Snake extends Monster {
  constructor(opts) {
    super(opts);
    this.sprite = snakeSprite;
    this.name = "snake";
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
  }

  takeTurn(roosta) {
    if (this.stunned) {
      this.stunned = !this.stunned;
      return;
    }
    super.takeTurn(roosta);
    this.stunned = true;
  }
}

export { Crab, Duck, Star, Snake, Wasp, Roosta, Entity };
