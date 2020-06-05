/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
import { machine, state } from "fn-machine";
import { Roosta, Crab, Duck, Snake, Wasp, Star, Entity } from "./entity";
import { game, gridSize, tileSize, pixelSize, spriteSheet } from "./globals";
import { Map } from "./map";
import { randomFromArray } from "./util";
import { Sploder } from "./particles";
import "./sounds";
import colors from "./colors";
import { renderSpells } from "./domController";

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
        generateLevel();
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
      receiveDirectionFunction: () => {
        return {
          state: "waitingForInput",
        };
      },
    }),
    state("waitingForInput", {
      resumePlaying: () => {
        return {
          state: "play",
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

const sploder = new Sploder(pixelSize * 2);

game.level = 1;
let map;
let roosta;
const generateLevel = function () {
  // setup map
  map = new Map({
    gridSize,
    tileSize,
  });

  // generate enemies
  game.enemies = [];
  const enemyConstructors = [Star, Duck, Crab, Snake, Wasp];
  for (let i = 0; i < 8; i++) {
    const enemy = randomFromArray(enemyConstructors);
    const position = map.randomEmptyTile();
    game.enemies.push(
      new enemy({
        x: position.x * tileSize,
        y: position.y * tileSize,
        tileSize,
        map,
      })
    );
  }

  const startingPos = map.randomEmptyTile();
  roosta = new Roosta({
    x: startingPos.x * tileSize,
    y: startingPos.y * tileSize,
    tileSize,
    map,
    doneCallback: gameTick,
  });
  renderSpells(roosta.spells);
};

const gameTick = function () {
  playerLock = true;
  const enemyMovements = [];
  game.enemies.forEach((e, i) => {
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

// const startingPos = map.randomEmptyTile();
// const roosta = new Roosta({
//   x: startingPos.x * tileSize,
//   y: startingPos.y * tileSize,
//   tileSize,
//   map,
//   doneCallback: gameTick,
// });

let playerLock = false;

document.addEventListener("splode", ({ detail }) => {
  sploder.splode(
    detail.x + tileSize / 2,
    detail.y + tileSize / 2,
    detail.noFall,
    detail.colorArray,
    detail.life
  );
});

document.addEventListener("die", ({ detail }) => {
  playerLock = true;
  gameStates("die");
});

let shakeAmount;
document.addEventListener("screenShake", ({ detail }) => {
  shakeAmount = 10;
});

let beachBall = null;
document.addEventListener("beachBall", ({ detail: { x1, y1, x2, y2 } }) => {
  beachBall = new Entity({ x: x2, y: y2, tileSize, map, noTile: true });
  beachBall.sprite = spriteSheet.getSprite(11, 0);
  beachBall.displayX = x1;
  beachBall.displayY = y1;
});

let directionCallback = null;
document.addEventListener("directionFunction", ({ detail }) => {
  gameStates("receiveDirectionFunction");
  directionCallback = detail.callback;
});

document.addEventListener("keydown", ({ key }) => {
  if (currentGameState === "menu") {
    gameStates("start");
  }
  if (currentGameState === "gameOver") {
    gameStates("restart");
  }
  if (currentGameState === "waitingForInput") {
    if (key === "Escape") {
      gameStates("resumePlaying");
      return;
    }
    if (directionCallback(key)) {
      gameStates("resumePlaying");
    }
    return;
  }
  if (!playerLock) {
    roosta.keydown(key);
  }
  // if (key === "Escape") {
  //   gameStates("die");
  // }
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
  this.enemies = this.enemies.filter((e) => !e.dead);
  this.enemies.forEach((e) => e.update(dt));
  sploder.update(dt);
  map.update(dt);
  if (beachBall) {
    beachBall.update(dt);
    beachBall.speed += 8;
    if (
      beachBall.displayX === beachBall.x &&
      beachBall.displayY === beachBall.y
    ) {
      document.dispatchEvent(
        new CustomEvent("splode", {
          detail: { x: beachBall.x, y: beachBall.y },
        })
      );
      beachBall = null;
    }
  }
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
    playerLock = true;
    shakeAmount += 0.2;
    if (shakeAmount > 20) {
      gameStates("transitionEnd");
    }
  } else if (shakeAmount && currentGameState === "play") {
    shakeAmount = Math.max(shakeAmount - 80 * dt, 0);
  }
};

game.draw = function () {
  if (currentGameState === "menu") {
    return;
  }
  if (currentGameState === "gameOver") {
    game.context.font = "50px serif";
    game.context.fillStyle = colors.black;
    game.context.fillText("dead", 100, 100);
    return;
  }
  if (
    ["waitingForInput", "play", "fadeToBlack", "fadeIn", "dying"].includes(
      currentGameState
    )
  ) {
    const shakeAngle = Math.random() * Math.PI * 2;
    const shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
    const shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
    game.context.setTransform(1, 0, 0, 1, shakeX, shakeY);
    map.draw();
    this.enemies.forEach((e) => {
      if (!e.dead) {
        e.draw();
      }
    });
    if (beachBall) {
      beachBall.draw();
    }
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
  map.drawEffects();
};

// call game.start() to start the game loop!
game.start();
