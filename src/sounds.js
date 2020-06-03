import { Howl, Howler } from "howler";
import { randomFromArray } from "./util";

const pop1 = new Howl({ src: ["../sounds/pop1.mp3"] });
const pop2 = new Howl({ src: ["../sounds/pop2.mp3"] });
const pop3 = new Howl({ src: ["../sounds/pop3.mp3"] });
const cluck1 = new Howl({ src: ["../sounds/cluck1.mp3"] });
const cluck2 = new Howl({ src: ["../sounds/cluck2.mp3"] });
const quack = new Howl({ src: ["../sounds/quack.wav"] });

const waves = new Howl({
  src: ["../sounds/waves.mp3"],
  loop: true,
  volume: 0.1,
});
const gulls = new Howl({
  src: ["../sounds/gulls.mp3"],
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
  if (detail.sound === "background") {
    waves.play();
    gulls.play();
  }
});
