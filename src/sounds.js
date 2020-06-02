import { Howl, Howler } from "howler";
import { randomFromArray } from "./util";

const pop1 = new Howl({ src: ["../sounds/pop1.mp3"] });
const pop2 = new Howl({ src: ["../sounds/pop2.mp3"] });
const pop3 = new Howl({ src: ["../sounds/pop3.mp3"] });

document.addEventListener("sound", ({ detail }) => {
  if (detail.sound === "pop") {
    randomFromArray([pop1, pop2, pop3]).play();
  }
});
