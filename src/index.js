/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
import { machine, state } from "fn-machine";
import { Roosta, Crab, Duck, Snake, Wasp, Star } from "./entity";
import { Map } from "./map";
import { game } from "./globals";
import { randomFromArray } from "./util";
import { Sploder } from "./particles";
import "./sounds";
import colors from "./colors";

let currentGameState = "menu";
let stateContext = {};
const onStateChange = function (state) {
  currentGameState = state.state;
  stateContext = state.context;
};

const initialContext = {
  faderOpacity: 0,
};

const gameStates = machine(
  [
    state("menu", {
      start: (detail, context) => {
        document.dispatchEvent(
          new CustomEvent("sound", {
            detail: {
              sound: "background",
            },
          })
        );
        return {
          state: "fadeIn",
          context: { ...context, ...{ faderOpacity: 1 } },
        };
      },
    }),
    state("fadeIn", {
      transitionEnd: () => {
        return {
          state: "play",
        };
      },
    }),
    state("play", {
      die: () => {
        return {
          state: "dying",
        };
      },
    }),
    state("dying", {
      transitionEnd: (detail, context) => {
        return {
          state: "fadeToBlack",
          context: { ...context, ...{ faderOpacity: 0 } },
        };
      },
    }),
    state("fadeToBlack", {
      transitionEnd: () => {
        return {
          state: "gameOver",
        };
      },
    }),
    state("gameOver", {
      restart: () => {
        return {
          state: "menu",
        };
      },
    }),
  ],
  "menu",
  initialContext,
  onStateChange
);

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

document.addEventListener("die", ({ detail }) => {
  gameStates("die");
});

let shakeAmount;
document.addEventListener("screenShake", ({ detail }) => {
  shakeAmount = 10;
});

document.addEventListener("keydown", ({ key }) => {
  if (currentGameState === "menu") {
    gameStates("start");
  }
  if (currentGameState === "gameOver") {
    gameStates("restart");
  }
  if (!playerLock) {
    roosta.keydown(key);
  }
  if (key === "Escape") {
    gameStates("die");
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (!playerLock) {
    roosta.keyup(key);
  }
});

game.update = function (dt) {
  if (currentGameState === "menu") {
    return;
  }
  roosta.update(dt);
  enemies = enemies.filter((e) => !e.dead);
  enemies.forEach((e) => e.update(dt));
  sploder.update(dt);
  if (currentGameState === "fadeToBlack") {
    playerLock = true;
    stateContext.faderOpacity += 0.04;
    if (stateContext.faderOpacity >= 1.7) {
      gameStates("transitionEnd");
      shakeAmount = 0;
    }
  }
  if (currentGameState === "fadeIn") {
    playerLock = true;
    stateContext.faderOpacity -= 0.08;
    if (stateContext.faderOpacity <= 0) {
      gameStates("transitionEnd");
      playerLock = false;
    }
  }
  if (currentGameState === "dying") {
    shakeAmount += 0.2;
    if (shakeAmount > 20) {
      gameStates("transitionEnd");
    }
  } else if (shakeAmount && currentGameState === "play") {
    shakeAmount = Math.max(shakeAmount - 80 * dt, 0);
  }
};

game.draw = function () {
  // this fillRect covers the entire screen and is the 'background' for our game
  game.context.fillStyle = "#b2bcc2";
  game.context.fillRect(0, 0, game.width, game.height);
  if (currentGameState === "menu") {
    game.context.font = "50px serif";
    game.context.fillStyle = colors.black;
    game.context.fillText("ROOSTA", 100, 100);
    return;
  }
  if (currentGameState === "gameOver") {
    game.context.font = "50px serif";
    game.context.fillStyle = colors.black;
    game.context.fillText("dead", 100, 100);
    return;
  }
  if (["play", "fadeToBlack", "fadeIn", "dying"].includes(currentGameState)) {
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
  }
  if (currentGameState === "fadeToBlack" || currentGameState === "fadeIn") {
    game.context.fillStyle = `rgba(23, 17, 26, ${stateContext.faderOpacity})`;
    game.context.fillRect(
      -game.width,
      -game.height,
      game.width * 3,
      game.height * 3
    );
  }
};

// call game.start() to start the game loop!
game.start();
