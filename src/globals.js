import { Game, SpriteSheet } from "@codyloyd/minotaur-base";
import sprite from "../img/spritesheet.png";
import arrow from "../img/arrow.png";
import "../img/background.png";
import "../img/splash.png";
import "../img/gameover.png";
import "../img/WIN.png";
import "../font/GoblinFont.ttf";

const game = new Game({
  width: 600,
  height: 600,
  parent: "game",
});

document.addEventListener("DOMContentLoaded", function () {
  game.context.font = "30px Goblin";
});

const gridSize = 7;
const tileSize = game.width / gridSize;
const pixelSize = tileSize / 32;

const spriteSheet = new SpriteSheet({
  path: `${sprite}`,
  context: game.context,
  colSize: 32,
  rowSize: 32,
});

const arrowSheet = new SpriteSheet({
  path: `${arrow}`,
  context: game.context,
  colSize: 15,
  rowSize: 15,
});

const arrowUpSprite = arrowSheet.getSprite(0, 0);
const arrowDownSprite = arrowSheet.getSprite(1, 0);
const arrowRightSprite = arrowSheet.getSprite(2, 0);
const arrowLeftSprite = arrowSheet.getSprite(3, 0);
const roostaSprite = spriteSheet.getSprite(0, 0);
const floorSprite = spriteSheet.getSprite(1, 0);
const wallSprite = spriteSheet.getSprite(2, 0);
const duckSprite = spriteSheet.getSprite(3, 0);
const crabSprite = spriteSheet.getSprite(4, 0);
const healthSprite = spriteSheet.getSprite(5, 0);
const snakeSprite = spriteSheet.getSprite(6, 0);
const waspSprite = spriteSheet.getSprite(7, 0);
const starSprite = spriteSheet.getSprite(8, 0);
const coolDuckSprite = spriteSheet.getSprite(9, 0);
const ouchDuckSprite = spriteSheet.getSprite(10, 0);
const ouchCrabSprite = spriteSheet.getSprite(19, 0);
const ouchStarSprite = spriteSheet.getSprite(20, 0);
const ouchSnakeSprite = spriteSheet.getSprite(21, 0);
const spawningSprite = spriteSheet.getSprite(22, 0);

export {
  game,
  gridSize,
  tileSize,
  pixelSize,
  arrowUpSprite,
  arrowDownSprite,
  arrowLeftSprite,
  arrowRightSprite,
  spriteSheet,
  roostaSprite,
  floorSprite,
  wallSprite,
  duckSprite,
  crabSprite,
  healthSprite,
  snakeSprite,
  waspSprite,
  starSprite,
  coolDuckSprite,
  ouchDuckSprite,
  ouchCrabSprite,
  ouchStarSprite,
  ouchSnakeSprite,
  spawningSprite,
};
