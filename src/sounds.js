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
import beachiesrc from "../sounds/beachie.mp3";

const pop1 = new Howl({ src: [`${pop1src}`] });
const pop2 = new Howl({ src: [`${pop2src}`] });
const pop3 = new Howl({ src: [`${pop3src}`] });
const cluck1 = new Howl({ src: [`${cluck1src}`] });
const cluck2 = new Howl({ src: [`${cluck2src}`] });
const quack = new Howl({ src: [`${quacksrc}`] });
const oof = new Howl({ src: [`${oofsrc}`] });
const snap = new Howl({ src: [`${snapsrc}`] });
const coin = new Howl({ src: [`${coinsrc}`] });
const steel = new Howl({ src: [`${steelsrc}`] });
const steel2 = new Howl({ src: [`${steel2src}`] });
const beachie = new Howl({
  src: [beachiesrc],
  loop: true,
  volume: 0.6,
  autoplay: true,
});

const waves = new Howl({
  src: [`${wavessrc}`],
  loop: true,
  volume: 0.3,
});
const gulls = new Howl({
  src: [`${gullssrc}`],
  loop: true,
  volume: 0.2,
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
    waves.volume(0.3);
    waves.play();
    gulls.volume(0.2);
    gulls.play();
  }
  if (detail.sound === "backgroundStop") {
    waves.fade(0.3, 0, 500);
    waves.once("fade", () => {
      waves.stop();
    });
    gulls.fade(0.2, 0, 500);
    gulls.once("fade", () => {
      gulls.stop();
    });
  }
  if (detail.sound === "theme") {
    beachie.volume(0.6);
    beachie.play();
  }
  if (detail.sound === "themeStop") {
    beachie.fade(0.6, 0, 6500);
    beachie.once("fade", () => {
      beachie.stop();
    });
  }
});
