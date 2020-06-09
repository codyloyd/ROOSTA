/* eslint-disable class-methods-use-this */
import { game, spriteSheet } from "./globals";
import colors from "./colors";
import { randomFromArray, random } from "./util";
import { renderSpells } from "./domController";

const healSprite = spriteSheet.getSprite(15, 0);
const splashSprite = spriteSheet.getSprite(14, 0);
const splashSpriteHoriz = spriteSheet.getSprite(17, 0);

const SpellsMixin = (superclass) =>
  class extends superclass {
    constructor(opts) {
      super(opts);
      this.spells = [
        {
          spell: this.push.bind(this),
          name: "push",
          desc: "push all enemies away from you",
        },
        {
          spell: this.pull.bind(this),
          name: "pull",
          desc: "pull all enemies toward you",
        },
      ];
      this.registeredSpells = [
        {
          spell: this.jump.bind(this),
          name: "jump",
          desc: "transport to a random empty tile",
        },
        {
          spell: this.hurricane.bind(this),
          name: "hurricane",
          desc: "shuffle the enemies on the board",
        },
        {
          spell: this.heal.bind(this),
          name: "heal",
          desc: "gain one health point",
        },
        {
          spell: this.col.bind(this),
          name: "column",
          desc: "damage all enemies in your column",
        },
        {
          spell: this.row.bind(this),
          name: "row",
          desc: "damage all enemies in your row",
        },
        {
          spell: this.push.bind(this),
          name: "push",
          desc: "push all enemies away from you",
        },
        {
          spell: this.pull.bind(this),
          name: "pull",
          desc: "pull all enemies toward you",
        },
        {
          spell: this.stun.bind(this),
          name: "stun",
          desc: "stuns all enemies for 1 turn",
        },
        {
          spell: this.beachBall.bind(this),
          name: "beach ball",
          desc: "throw beach ball",
        },
        {
          spell: this.dash.bind(this),
          name: "dash",
          desc: "dash in some direction, can damage enemies",
        },
        {
          spell: this.damageTrap.bind(this),
          name: "trap",
          desc: "set a trap, will harm enemies that step on it",
        },
        {
          spell: this.hitAllTrap.bind(this),
          name: "super trap",
          desc:
            "set a trap, will harm all enemies of the type that steps on it",
        },
        {
          spell: this.waterAttack.bind(this),
          name: "water attack",
          desc: "harms all enemies in water",
        },
        {
          spell: this.bugSpray.bind(this),
          name: "bug spray",
          desc: "harms all wasps",
        },
        {
          spell: this.wait.bind(this),
          name: "wait",
          desc: "wait a turn",
        },
      ];
      this.getRandomSpell();
    }

    resetSpells() {
      this.spells.forEach((s) => (s.used = false));
    }

    doSpell(spellObject) {
      if (!spellObject.used) {
        spellObject.used = true;
        renderSpells(this.spells);
        spellObject.spell();
      }
    }

    getRandomSpell() {
      const newSpell = randomFromArray(this.registeredSpells);
      if (this.spells.includes(newSpell)) {
        return this.getRandomSpell();
      }
      if (this.spells.length < 9) {
        this.spells.push(newSpell);
      }
    }

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

    heal(noEffect) {
      this.hp = Math.min(this.hp + 1, this.maxHp);
      if (!noEffect) {
        this.map.getTileFromCanvasCoords(this.x, this.y).setEffect(healSprite);
        document.dispatchEvent(
          new CustomEvent("splode", {
            detail: {
              x: this.x,
              y: this.y,
              noFall: true,
              life: 0.5,
              colorArray: [
                colors.green,
                colors.darkGreen,
                colors.lightGreen,
                colors.darkBlue,
              ],
            },
          })
        );
      }
    }

    // damage all in column
    col() {
      const mapCoords = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
      this.map.map[mapCoords.x].forEach((tile) => {
        if (!tile.entity || (tile.entity && !tile.entity.isRoosta)) {
          tile.setEffect(splashSprite);
        }
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
        if (!tile.entity || (tile.entity && !tile.entity.isRoosta)) {
          tile.setEffect(splashSpriteHoriz);
        }
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

    dispatchBeachBall(x1, y1, x2, y2) {
      document.dispatchEvent(
        new CustomEvent("beachBall", {
          detail: {
            x1,
            y1,
            x2,
            y2,
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
            const nextTile = this.map.getTile(mapCoords.x + 1, mapCoords.y);
            if (nextTile.entity || !nextTile.isWalkable) return false;
            for (let x = mapCoords.x + 1; x < mapLength; x++) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                this.dispatchBeachBall(
                  this.x,
                  this.y,
                  tile.entity.x,
                  tile.entity.y
                );
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          if (key === "ArrowLeft") {
            const nextTile = this.map.getTile(mapCoords.x - 1, mapCoords.y);
            if (nextTile.entity || !nextTile.isWalkable) return false;
            for (let x = mapCoords.x - 1; x >= 0; x--) {
              const tile = this.map.map[x][mapCoords.y];
              if (tile.entity) {
                this.dispatchBeachBall(
                  this.x,
                  this.y,
                  tile.entity.x,
                  tile.entity.y
                );
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          if (key === "ArrowUp") {
            const nextTile = this.map.getTile(mapCoords.x, mapCoords.y - 1);
            if (nextTile.entity || !nextTile.isWalkable) return false;
            for (let y = mapCoords.y - 1; y >= 0; y--) {
              const tile = this.map.map[mapCoords.x][y];
              if (tile.entity) {
                this.dispatchBeachBall(
                  this.x,
                  this.y,
                  tile.entity.x,
                  tile.entity.y
                );
                tile.entity.takeDamage();
                return true;
              }
            }
          }
          if (key === "ArrowDown") {
            const nextTile = this.map.getTile(mapCoords.x, mapCoords.y + 1);
            if (nextTile.entity || !nextTile.isWalkable) return false;
            for (let y = mapCoords.y + 1; y < mapLength; y++) {
              const tile = this.map.map[mapCoords.x][y];
              if (tile.entity) {
                this.dispatchBeachBall(
                  this.x,
                  this.y,
                  tile.entity.x,
                  tile.entity.y
                );
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
            const nextTile = this.map.getTile(mapCoords.x + 1, mapCoords.y);
            if (nextTile.entity || !nextTile.isWalkable) return false;
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
            const nextTile = this.map.getTile(mapCoords.x - 1, mapCoords.y);
            if (nextTile.entity || !nextTile.isWalkable) return false;
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
            const nextTile = this.map.getTile(mapCoords.x, mapCoords.y - 1);
            if (nextTile.entity || !nextTile.isWalkable) return false;
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
            const nextTile = this.map.getTile(mapCoords.x, mapCoords.y + 1);
            if (nextTile.entity || !nextTile.isWalkable) return false;
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
          this.entity.takeDamage(2);
        };
        const { x, y } = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            const tile = this.map.getTile(x + 1, y);
            if (tile.entity || !tile.isWalkable) return false;
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowLeft") {
            const tile = this.map.getTile(x - 1, y);
            if (tile.entity || !tile.isWalkable) return false;
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowUp") {
            const tile = this.map.getTile(x, y - 1);
            if (tile.entity || !tile.isWalkable) return false;
            tile.trap = "damage";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowDown") {
            const tile = this.map.getTile(x, y + 1);
            if (tile.entity || !tile.isWalkable) return false;
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
          if (this.entity) {
            this.entity.takeDamage(2);
          }
        };
        const { x, y } = this.map.getMapCoordsFromCanvasCoords(this.x, this.y);
        if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(key)) {
          if (key === "ArrowRight") {
            const tile = this.map.getTile(x + 1, y);
            if (tile.entity || !tile.isWalkable) return false;
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowLeft") {
            const tile = this.map.getTile(x - 1, y);
            if (tile.entity || !tile.isWalkable) return false;
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowUp") {
            const tile = this.map.getTile(x, y - 1);
            if (tile.entity || !tile.isWalkable) return false;
            tile.trap = "hitAll";
            tile.trapCallback = damageTrapFunction;
          }
          if (key === "ArrowDown") {
            const tile = this.map.getTile(x, y + 1);
            if (tile.entity || !tile.isWalkable) return false;
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
            tile.entity.takeDamage(2);
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
