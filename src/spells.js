/* eslint-disable class-methods-use-this */
import { game } from "./globals";

const SpellsMixin = (superclass) =>
  class extends superclass {
    jump() {
      // transport to random tile
      const newTileCoords = this.map.randomEmptyTile();
      const oldTile = this.map.getTileFromCanvasCoords(this.x, this.y);
      this.map.getTile(newTileCoords.x, newTileCoords.y).entity = this;
      oldTile.entity = null;
      this.x = newTileCoords.x * this.tileSize;
      this.y = newTileCoords.y * this.tileSize;
    }

    hurricane() {
      // transport all monsters
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

    col() {
      // damage all in column
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map[mapCoords.x].forEach((tile) => {
        if (tile.entity && !tile.entity.isRoosta) {
          tile.entity.takeDamage();
        }
      });
    }

    row() {
      // damage all in row
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map.forEach((col) => {
        const tile = col[mapCoords.y];
        if (tile.entity && !tile.entity.isRoosta) {
          tile.entity.takeDamage();
        }
      });
    }

    push() {
      // push monsters back
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

    pull() {
      // pull monsters close
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

    stun() {
      // stuns all monsters
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

    beachBall() {
      // throw ball in some direction
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

    dash() {
      // dash in some direction (and cause damage)
      this.dispatchDirectionFunction((key) => {
        const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        const mapLength = this.map.map.length;
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            for (let x = mapCoords.x + 1; x < mapLength; x++) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                tile.entity.takeDamage();
                this.x = (x - 1) * this.tileSize;
                this.speed = 30;
                return true;
              }
              if (!this.map.isPassable(x, mapCoords.y)) {
                this.x = (x - 1) * this.tileSize;
                this.speed = 30;
                return true;
              }
            }
            this.speed = 30;
            this.x = (mapLength - 1) * this.tileSize;
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

    damageTrap() {
      // set trap in some direction
    }

    confuseTrap() {
      // set confuse trap
    }

    allEnemiesTrap() {
      // damages all of whatever steps on it
    }

    waterAttack() {
      // damage enemies in water
      this.map.map.forEach((col) => {
        col.forEach((tile) => {
          if (!tile.isWalkable && tile.entity) {
            tile.entity.takeDamage();
          }
        });
      });
    }

    bugSpray() {
      // damage wasps
      game.enemies
        .filter((e) => e.name === "wasp")
        .forEach((e) => e.takeDamage());
    }

    wait() {
      // ... wait for it...
      this.doneCallback();
    }
  };

export { SpellsMixin };
