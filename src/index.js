/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
import { Game } from "@codyloyd/minotaur-base";
import { Roosta, Crab, Duck, Snake, Wasp, Star } from "./entity";
import { Map } from "./map";
import { game } from "./globals";
import { randomFromArray } from "./util";
import { Sploder } from "./particles";
import "./sounds";

const gridSize = 7;
const tileSize = game.width / gridSize;
const pixelSize = tileSize / 32;

const sploder = new Sploder(pixelSize * 2);

const map = new Map({
  gridSize,
  tileSize,
});

let enemies = [];
const enemyConstructors = [Star, Duck, Crab, Snake, Wasp];
for (let i = 0; i < 8; i++) {
  const enemy = randomFromArray(enemyConstructors);
  const position = map.randomEmptyTile();
  enemies.push(
    new enemy({
      x: position.x * tileSize,
      y: position.y * tileSize,
      tileSize,
      map,
    })
  );
}

const gameTick = function () {
  playerLock = true;
  const enemyMovements = [];
  enemies.forEach((e, i) => {
    enemyMovements.push(
      new Promise((res) => {
        setTimeout(() => {
          e.takeTurn(roosta);
          res();
        }, 50 + 50 * i);
      })
    );
  });
  Promise.all(enemyMovements).then(() => (playerLock = false));
};

const startingPos = map.randomEmptyTile();
const roosta = new Roosta({
  x: startingPos.x * tileSize,
  y: startingPos.y * tileSize,
  tileSize,
  map,
  doneCallback: gameTick,
});

let playerLock = false;

document.addEventListener("splode", ({ detail }) => {
  sploder.splode(detail.x + tileSize / 2, detail.y + tileSize / 2);
});

let shakeAmount;
document.addEventListener("screenShake", ({ detail }) => {
  shakeAmount = 10;
});

document.addEventListener("keydown", ({ key }) => {
  if (!playerLock) {
    roosta.keydown(key);
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (!playerLock) {
    roosta.keyup(key);
  }
});

game.update = function (dt) {
  // update game state here
  roosta.update(dt);
  enemies = enemies.filter((e) => !e.dead);
  enemies.forEach((e) => e.update(dt));
  sploder.update(dt);
  if (shakeAmount) {
    shakeAmount = Math.max(shakeAmount - 80 * dt, 0);
  }
};

game.draw = function () {
  // this fillRect covers the entire screen and is the 'background' for our game
  game.context.fillStyle = "#b2bcc2";
  game.context.fillRect(0, 0, game.width, game.height);
  const shakeAngle = Math.random() * Math.PI * 2;
  const shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
  const shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
  game.context.setTransform(1, 0, 0, 1, shakeX, shakeY);
  map.draw();
  enemies.forEach((e) => {
    if (!e.dead) {
      e.draw();
    }
  });
  roosta.draw();
  sploder.draw(game.context);
};

// call game.start() to start the game loop!
game.start();
