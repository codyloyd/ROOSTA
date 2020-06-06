import { Howl, Howler } from "howler";
import { randomFromArray } from "./util";
import pop1src from "../sounds/pop1.mp3";
import pop2src from "../sounds/pop2.mp3";
import pop3src from "../sounds/pop3.mp3";
import cluck1src from "../sounds/cluck1.mp3";
import cluck2src from "../sounds/cluck2.mp3";
import quacksrc from "../sounds/quack.wav";
import oofsrc from "../sounds/oof.wav";
import snapsrc from "../sounds/snap.wav";
import coinsrc from "../sounds/coin.wav";
import steelsrc from "../sounds/steel.wav";
import steel2src from "../sounds/steel2.wav";
import wavessrc from "../sounds/waves.mp3";
import gullssrc from "../sounds/gulls.mp3";

const pop1 = new Howl({ src: [`dist/${pop1src}`] });
const pop2 = new Howl({ src: [`dist/${pop2src}`] });
const pop3 = new Howl({ src: [`dist/${pop3src}`] });
const cluck1 = new Howl({ src: [`dist/${cluck1src}`] });
const cluck2 = new Howl({ src: [`dist/${cluck2src}`] });
const quack = new Howl({ src: [`dist/${quacksrc}`] });
const oof = new Howl({ src: [`dist/${oofsrc}`] });
const snap = new Howl({ src: [`dist/${snapsrc}`] });
const coin = new Howl({ src: [`dist/${coinsrc}`] });
const steel = new Howl({ src: [`dist/${steelsrc}`] });
const steel2 = new Howl({ src: [`dist/${steel2src}`] });

const waves = new Howl({
  src: [`dist/${wavessrc}`],
  loop: true,
  volume: 0.1,
});
const gulls = new Howl({
  src: [`dist/${gullssrc}`],
  loop: true,
  volume: 0.05,
});

document.addEventListener("sound", ({ detail }) => {
  if (detail.sound === "pop") {
    randomFromArray([pop1, pop2, pop3]).play();
  }
  if (detail.sound === "cluck") {
    randomFromArray([cluck1, cluck2]).play();
  }
  if (detail.sound === "quack") {
    quack.play();
  }
  if (detail.sound === "oof") {
    oof.play();
  }
  if (detail.sound === "snap") {
    snap.play();
  }
  if (detail.sound === "coin") {
    coin.play();
  }
  if (detail.sound === "steel") {
    randomFromArray([steel, steel2]).play();
  }
  if (detail.sound === "background") {
    waves.play();
    gulls.play();
  }
});
