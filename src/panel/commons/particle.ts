import * as PIXI from "pixi.js";
import * as particles from "@pixi/particle-emitter";
import App from "../competitive/main/app";

export default class ParticleView extends PIXI.Container {
  app: App;
  img: any[];
  config: particles.EmitterConfigV3;
  ownerPos?: { x: number; y: number };
  timeToEmitInSeconds?: number;
  addAtBack: boolean = false;

  emitter: particles.Emitter;
  elapsed: number;
  elapsedSinceBegin: number = 0;

  constructor({
    app,
    img,
    config,
    ownerPos,
    addAtBack,
    timeToEmitInSeconds,
  }: {
    app: App;
    img: any[];
    config: any;
    ownerPos?: { x: number; y: number };
    addAtBack?: boolean;
    timeToEmitInSeconds?: number;
  }) {
    super();
    this.img = img;
    this.config = config;
    this.app = app;
    this.elapsed = Date.now();
    this.ownerPos = ownerPos;

    if (timeToEmitInSeconds !== undefined) {
      this.timeToEmitInSeconds = timeToEmitInSeconds;
    }

    if (addAtBack !== undefined) {
      this.addAtBack = addAtBack;
    }

    this.app.stage.addChild(this as PIXI.DisplayObject);

    this.emitter = new particles.Emitter(
      this as PIXI.Container<PIXI.DisplayObject>, // The container to add the particles to// The textures to use for the particles
      particles.upgradeConfig(config, img)
    );
    this.emitter.emit = true;
    this.emitter.addAtBack = this.addAtBack;
    this.elapsedSinceBegin = Date.now();
    this.ticker.start();
  }

  ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {
    this.move();
  });

  move() {
    if (!this.destroyed) {
      let now = Date.now();

      if (this.timeToEmitInSeconds !== undefined) {
        let elapsedSeconds = (now - this.elapsedSinceBegin) / 1000;
        if (elapsedSeconds >= this.timeToEmitInSeconds) {
          this.emitter.emit = false;
          this.remove();
        }
      }

      if (this.ownerPos !== undefined) {
        this.emitter.updateOwnerPos(this.ownerPos.x, this.ownerPos.y);
      }

      this.emitter.update((now - this.elapsed) * 0.001);
      this.elapsed = now;
    }
  }

  remove() {
    if (!this.destroyed) {
      this.ticker.stop();
      PIXI.Ticker.shared.remove((delta) => {
        this.move();
      });

      this.removeChildren();
      this.app.stage.removeChild(this as PIXI.DisplayObject);
      this.destroy();
      if (this.emitter !== undefined) {
        this.emitter.emit = false;
        this.emitter.destroy();
      }
      console.log("emitter destroyed");
    }
  }
}
