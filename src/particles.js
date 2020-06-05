// eslint-disable-next-line max-classes-per-file
import { random, randomFromArray } from "./util";
import colors from "./colors";
import { game } from "./globals";

class Sploder {
  constructor(pixelSize) {
    this.pixelSize = pixelSize;
    this.particles = [];
  }

  splode(x, y, noFall = false, colorArray = Object.values(colors), life) {
    for (let i = 0; i < 60; i++) {
      this.particles.push(
        new Particle({
          x,
          y,
          pixelSize: this.pixelSize,
          noFall,
          colorArray,
          life,
        })
      );
    }
  }

  update(dt) {
    this.particles = this.particles.filter((p) => !p.dead);
    this.particles.forEach((p) => {
      p.update(dt);
    });
  }

  draw(context) {
    this.particles.forEach((p) => {
      p.draw(context);
    });
  }
}

class Particle {
  constructor({ x, y, pixelSize, noFall, colorArray, life = random(1, 2) }) {
    this.x = x;
    this.y = y;
    this.pixelSize = pixelSize;
    this.dx = (Math.random() * 2 - 1) * 400;
    this.dy = (Math.random() * 2 - 1) * 400;
    this.color = randomFromArray(colorArray);
    this.life = life;
    this.noFall = noFall;
  }

  update(dt) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
    if (!this.noFall) {
      this.dy += 30;
    }
    this.life -= dt;

    if (
      this.x < 0 ||
      this.x > game.width ||
      this.y < 0 ||
      this.y > game.height ||
      this.life < 0
    ) {
      this.dead = true;
    }
  }

  draw() {
    game.context.fillStyle = this.color;
    game.context.globalAlpha = Math.max(this.life, 0);
    game.context.fillRect(this.x, this.y, this.pixelSize, this.pixelSize);
    game.context.globalAlpha = 1;
  }
}

export { Sploder };
