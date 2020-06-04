/* eslint-disable class-methods-use-this */
import { game } from "./globals";

const SpellsMixin = (superclass) =>
  class extends superclass {
    // transport to random tile
    jump() {
      const newTileCoords = this.map.randomEmptyTile();
      const oldTile = this.map.getTileFromCanvasCoords(this.x, this.y);
      this.map.getTile(newTileCoords.x, newTileCoords.y).entity = this;
      oldTile.entity = null;
      this.x = newTileCoords.x * this.tileSize;
      this.y = newTileCoords.y * this.tileSize;
    }

    // transport all monsters
    hurricane() {
      game.enemies.forEach((e) => {
        const newTileCoords = this.map.randomEmptyTile();
        const oldTile = this.map.getTileFromCanvasCoords(e.x, e.y);
        this.map.getTile(newTileCoords.x, newTileCoords.y).entity = e;
        oldTile.entity = null;
        e.x = newTileCoords.x * e.tileSize;
        e.y = newTileCoords.y * e.tileSize;
      });
    }

    heal() {
      this.hp = Math.min(this.hp + 1, this.maxHp);
    }

    // damage all in column
    col() {
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map[mapCoords.x].forEach((tile) => {
        if (tile.entity && !tile.entity.isRoosta) {
          tile.entity.takeDamage();
        }
      });
    }

    // damage all in row
    row() {
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map.forEach((col) => {
        const tile = col[mapCoords.y];
        if (tile.entity && !tile.entity.isRoosta) {
          tile.entity.takeDamage();
        }
      });
    }

    // push monsters back
    push() {
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map.forEach((col) =>
        col.forEach((tile) => {
          const { entity } = tile;
          if (entity && !entity.isRoosta && !entity.hasBeenPushed) {
            const eCoords = this.map.getMapCoordsFromCanvasCoords(
              entity.x,
              entity.y
            );
            const xdiff = eCoords.x - mapCoords.x;
            const ydiff = eCoords.y - mapCoords.y;
            if (Math.abs(xdiff) >= Math.abs(ydiff)) {
              // move X
              const xdir = xdiff > 0 ? 1 : -1;
              entity.isBeingMoved = true;
              entity.hasBeenPushed = true;
              entity.move(xdir, 0);
            } else {
              // move y
              const ydir = ydiff > 0 ? 1 : -1;
              entity.isBeingMoved = true;
              entity.move(0, ydir);
              entity.hasBeenPushed = true;
            }
          }
        })
      );
      game.enemies.forEach((e) => (e.hasBeenPushed = false));
    }

    // pull monsters close
    pull() {
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map.forEach((col) =>
        col.forEach((tile) => {
          const { entity } = tile;
          if (entity && !entity.isRoosta && !entity.hasBeenPushed) {
            const eCoords = this.map.getMapCoordsFromCanvasCoords(
              entity.x,
              entity.y
            );
            const xdiff = eCoords.x - mapCoords.x;
            const ydiff = eCoords.y - mapCoords.y;
            if (Math.abs(xdiff) >= Math.abs(ydiff)) {
              // move X
              const xdir = xdiff < 0 ? 1 : -1;
              entity.isBeingMoved = true;
              entity.hasBeenPushed = true;
              entity.move(xdir, 0, true);
            } else {
              // move y
              const ydir = ydiff < 0 ? 1 : -1;
              entity.isBeingMoved = true;
              entity.move(0, ydir, true);
              entity.hasBeenPushed = true;
            }
          }
        })
      );
      game.enemies.forEach((e) => (e.hasBeenPushed = false));
    }

    // stuns all monsters
    stun() {
      game.enemies.forEach((e) => (e.stunned = true));
    }

    dispatchDirectionFunction(callback) {
      document.dispatchEvent(
        new CustomEvent("directionFunction", {
          detail: {
            callback,
          },
        })
      );
    }

    // throw ball in some direction
    beachBall() {
      this.dispatchDirectionFunction((key) => {
        const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        const mapLength = this.map.map.length;
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            for (let x = mapCoords.x + 1; x < mapLength; x++) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          if (key === "ArrowLeft") {
            for (let x = mapCoords.x - 1; x >= 0; x--) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          if (key === "ArrowUp") {
            for (let y = mapCoords.y - 1; y >= 0; y--) {
              const tile = this.map.map[mapCoords.x][y];
              if (tile.entity) {
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          if (key === "ArrowDown") {
            for (let y = mapCoords.y + 1; y < mapLength; y++) {
              const tile = this.map.map[mapCoords.x][y];
              if (tile.entity) {
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          return true;
        }
        return false;
      });
    }

    // dash in some direction (and cause damage)
    dash() {
      this.dispatchDirectionFunction((key) => {
        const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        const mapLength = this.map.map.length;
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            for (let x = mapCoords.x + 1; x < mapLength; x++) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                tile.entity.takeDamage();
                this.speed = 30;
                this.moveTo(x - 1, mapCoords.y);
                return true;
              }
              if (!this.map.isPassable(x, mapCoords.y)) {
                this.moveTo(x - 1, mapCoords.y);
                this.speed = 30;
                return true;
              }
            }
            this.speed = 30;
            this.moveTo(mapLength - 1, mapCoords.y);
          }
          if (key === "ArrowLeft") {
            for (let x = mapCoords.x - 1; x >= 0; x--) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                tile.entity.takeDamage();
                this.speed = 30;
                this.moveTo(x + 1, mapCoords.y);
                return true;
              }
              if (!this.map.isPassable(x, mapCoords.y)) {
                this.moveTo(x + 1, mapCoords.y);
                this.speed = 30;
                return true;
              }
            }
            this.speed = 30;
            this.moveTo(0, mapCoords.y);
          }
          if (key === "ArrowUp") {
            for (let y = mapCoords.y - 1; y >= 0; y--) {
              const tile = this.map.map[mapCoords.x][y];
              if (tile.entity) {
                tile.entity.takeDamage();
                this.speed = 30;
                this.moveTo(mapCoords.x, y + 1);
                return true;
              }
              if (!this.map.isPassable(mapCoords.x, y)) {
                this.speed = 30;
                this.moveTo(mapCoords.x, y + 1);
                return true;
              }
            }
            this.speed = 30;
            this.moveTo(mapCoords.x, 0);
          }
          if (key === "ArrowDown") {
            for (let y = mapCoords.y + 1; y < mapLength; y++) {
              const tile = this.map.map[mapCoords.x][y];
              if (tile.entity) {
                tile.entity.takeDamage();
                this.speed = 30;
                this.moveTo(mapCoords.x, y - 1);
                return true;
              }
              if (!this.map.isPassable(mapCoords.x, y)) {
                this.speed = 30;
                this.moveTo(mapCoords.x, y - 1);
                return true;
              }
            }
            this.speed = 30;
            this.moveTo(mapCoords.x, mapLength - 1);
          }
          return true;
        }
        return false;
      });
    }

    // set trap in some direction
    damageTrap() {
      this.dispatchDirectionFunction((key) => {
        const damageTrapFunction = function () {
          this.entity.takeDamage();
        };
        const { x, y } = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            const tile = this.map.getTile(x + 1, y);
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowLeft") {
            const tile = this.map.getTile(x - 1, y);
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowUp") {
            const tile = this.map.getTile(x, y - 1);
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowDown") {
            const tile = this.map.getTile(x, y + 1);
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          return true;
        }
        return false;
      });
    }

    // damages all of whatever steps on it
    hitAllTrap() {
      this.dispatchDirectionFunction((key) => {
        const damageTrapFunction = function () {
          game.enemies
            .filter((e) => e.name === this.entity.name)
            .forEach((e) => e.takeDamage());
        };
        const { x, y } = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            const tile = this.map.getTile(x + 1, y);
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowLeft") {
            const tile = this.map.getTile(x - 1, y);
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowUp") {
            const tile = this.map.getTile(x, y - 1);
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowDown") {
            const tile = this.map.getTile(x, y + 1);
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          return true;
        }
        return false;
      });
    }

    // damage enemies in water
    waterAttack() {
      this.map.map.forEach((col) => {
        col.forEach((tile) => {
          if (!tile.isWalkable && tile.entity) {
            tile.entity.takeDamage();
          }
        });
      });
    }

    // damage wasps
    bugSpray() {
      game.enemies
        .filter((e) => e.name === "wasp")
        .forEach((e) => e.takeDamage());
    }

    // ... wait for it...
    wait() {
      this.doneCallback();
    }
  };

export { SpellsMixin };
