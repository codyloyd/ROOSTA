import { Game, SpriteSheet } from "@codyloyd/minotaur-base";

const game = new Game({
  width: 600,
  height: 600,
  parent: "game",
});

const spriteSheet = new SpriteSheet({
  path: "/img/spritesheet.png",
  context: game.context,
  colSize: 32,
  rowSize: 32,
});
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

export {
  game,
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
};
