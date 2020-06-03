/* eslint-disable max-classes-per-file */
import { Path } from "rot-js";
import { random } from "./util";
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

class Entity {
  constructor({ x, y, tileSize, map, doneCallback = () => {} }) {
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

    const tile = this.map.getTileFromCanvasCoords(this.x, this.y);
    tile.entity = this;
  }

  takeDamage(p = 1) {
    this.hp -= p;
    if (this.hp < 1) {
      this.getTile().entity = null;
      this.dead = true;
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
      if (this.isRoosta) {
        document.dispatchEvent(new CustomEvent("die", {}));
      }
    }
    if (this.duck && this.hp > 0) {
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "quack",
          },
        })
      );
    }
    if (this.isRoosta) {
      document.dispatchEvent(
        new CustomEvent("sound", {
          detail: {
            sound: "cluck",
          },
        })
      );
      document.dispatchEvent(new CustomEvent("screenShake", {}));
    }
  }

  getTile() {
    return this.map.getTileFromCanvasCoords(this.x, this.y);
  }

  takeTurn() {}

  move(dx, dy) {
    const newX = this.x + this.tileSize * dx;
    const newY = this.y + this.tileSize * dy;
    const newTile = this.map.getTileFromCanvasCoords(newX, newY);
    const oldTile = this.map.getTileFromCanvasCoords(this.x, this.y);
    if (newTile.isEmpty()) {
      this.displayX = this.x;
      this.displayY = this.y;
      this.x = newX;
      this.y = newY;
      newTile.entity = this;
      oldTile.entity = null;
      this.moving = true;
      return true;
    }
    if (!newTile.isEmpty()) {
      const { entity } = newTile;
      if (entity.isRoosta || this.isRoosta) {
        this.displayX -= (this.displayX - entity.x) / 3;
        this.displayY -= (this.displayY - entity.y) / 3;
        entity.takeDamage();
        return true;
      }
    }
    return false;
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
      this.displayX -= (this.displayX - this.x) * 10 * dt;
    } else {
      this.displayX = this.x;
      movingX = false;
    }
    if (Math.abs(this.displayY - this.y) > 2) {
      this.displayY -= (this.displayY - this.y) * 10 * dt;
    } else {
      this.displayY = this.y;
      if (!movingX) {
        this.moving = false;
      }
    }
  }
}

class Roosta extends Entity {
  constructor(opts) {
    super(opts);
    this.isRoosta = true;
    this.hp = 3;
    this.sprite = roostaSprite;
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
    if (this.dead) return;
    const RoostaPos = this.map.getMapCoordsFromCanvasCoords(roosta.x, roosta.y);
    const astar = new Path.AStar(
      RoostaPos.x,
      RoostaPos.y,
      this.map.isPassable.bind(this.map),
      { topology: 4 }
    );
    const gridPos = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
    const coords = [];
    astar.compute(gridPos.x, gridPos.y, (x, y) => coords.push({ x, y }));
    const dx = coords[1].x - gridPos.x;
    const dy = coords[1].y - gridPos.y;
    this.move(dx, dy);
  }
}
class Crab extends Monster {
  // can do water
  constructor(opts) {
    super(opts);
    this.sprite = crabSprite;
  }

  takeTurn(roosta) {
    if (this.dead) return;
    const RoostaPos = this.map.getMapCoordsFromCanvasCoords(roosta.x, roosta.y);
    const astar = new Path.AStar(RoostaPos.x, RoostaPos.y, () => true, {
      topology: 4,
    });
    const gridPos = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
    const coords = [];
    astar.compute(gridPos.x, gridPos.y, (x, y) => coords.push({ x, y }));
    const dx = coords[1].x - gridPos.x;
    const dy = coords[1].y - gridPos.y;
    this.move(dx, dy);
  }
}
class Duck extends Monster {
  // hass 2hp
  constructor(opts) {
    super(opts);
    this.sprite = Math.random() < 0.8 ? duckSprite : coolDuckSprite;
    this.hp = 2;
    this.duck = true;
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
  }
}
class Wasp extends Monster {
  // is fast
  constructor(opts) {
    super(opts);
    this.sprite = waspSprite;
  }

  takeTurn(roosta) {
    super.takeTurn(roosta);
    super.takeTurn(roosta);
  }
}
class Star extends Monster {
  // is slow
  constructor(opts) {
    super(opts);
    this.sprite = starSprite;
    this.stunned = false;
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
