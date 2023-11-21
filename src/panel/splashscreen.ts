import cloud from "../../media/images/splashscreen/clouds.png";
import cloudR from "../../media/images/splashscreen/clouds_reversed.png";
import title from "../../media/images/splashscreen/title.png";
import * as PIXI from "pixi.js";
import { BgCover, background } from "./competitive/commons";

export default class Splashscreen {
  app: PIXI.Application<HTMLCanvasElement>;
  timeToLoad: number;
  constructor({
    app,
    timeToLoad,
  }: {
    app: PIXI.Application<HTMLCanvasElement>;
    timeToLoad: number;
  }) {
    this.app = app;
    this.timeToLoad = timeToLoad;
  }

  private _cloudResized1: BgCover | undefined;
  private _cloudResized2: BgCover | undefined;
  private _title: BgCover | undefined;
  public loaded: boolean = false;

  public async resize(): Promise<void> {
    if (this.loaded) return;
    if (this._cloudResized1 && this._cloudResized2 && this._title) {
      this.app.stage.removeChild(
        this._cloudResized1.container as PIXI.DisplayObject
      );
      this.app.stage.removeChild(
        this._cloudResized2.container as PIXI.DisplayObject
      );
      this.app.stage.removeChild(this._title.container as PIXI.DisplayObject);
      this._cloudResized1.container.destroy();
      this._cloudResized2.container.destroy();
    }

    const cloudsSprite1 = await PIXI.Assets.load(cloudR);
    const cloudsSprite2 = await PIXI.Assets.load(cloud);
    const titleSprite = await PIXI.Assets.load(title);
    const cloudsSpritePixi1 = new PIXI.Sprite(cloudsSprite1);
    const cloudsSpritePixi2 = new PIXI.Sprite(cloudsSprite2);
    const titleSpritePixi = new PIXI.Sprite(titleSprite);
    cloudsSpritePixi1.anchor.set(0, 0);
    cloudsSpritePixi1.scale.x = 1;
    cloudsSpritePixi2.anchor.set(0, 0);
    cloudsSpritePixi2.scale.x = 1;
    titleSpritePixi.anchor.set(0, 0);
    titleSpritePixi.scale.x = 1;

    const containerSize = {
      x: this.app.renderer.width,
      y: this.app.renderer.height,
    };

    this._cloudResized1 = background(
      containerSize,
      cloudsSpritePixi1,
      "coverFromBottom"
    );

    this._cloudResized2 = background(
      containerSize,
      cloudsSpritePixi2,
      "coverFromBottom"
    );

    this._title = background(containerSize, titleSpritePixi, "cover");

    if (!this._cloudResized1 || !this._cloudResized2 || !this._title) return;
    this.app.stage.addChild(
      this._cloudResized1.container as PIXI.DisplayObject
    );
    this.app.stage.addChild(
      this._cloudResized2.container as PIXI.DisplayObject
    );
    this.app.stage.addChild(this._title.container as PIXI.DisplayObject);
    this._cloudResized1.container.position.y = 0;
    this._cloudResized1.container.position.x = 0;
    this._cloudResized2.container.position.x = 0;
    this._cloudResized2.container.position.y = 0;
    this._title.container.position.x = 0;
    this._title.container.position.y = 0;
  }

  async init(): Promise<void> {
    await this.resize();

    setTimeout(() => {
      let ticker = new PIXI.Ticker().add((delta) => {
        if (!this._cloudResized1 || !this._cloudResized2) return;
        /// move _cloudresized1 from left to right and _cloudresized2 from right to left
        this._cloudResized1!.container.position.x -= 4; // move left
        this._cloudResized2!.container.position.x += 4; // move right
        // _text alpha from 1 to 0

        if (this._cloudResized2!.container.x >= this.app.renderer.width) {
          if (this._title!.container.alpha > 0)
            this._title!.container.alpha -= 0.02;
          else this.destroy(ticker);
        }
      });
      ticker.start();
    }, this.timeToLoad);
  }

  destroy(ticker: PIXI.Ticker): void {
    this.loaded = true;
    ticker.stop();
    ticker.destroy();
    if (this._title !== undefined) {
      this.app.stage.removeChild(this._title.container as PIXI.DisplayObject);
      this._title.container.destroy();
      this._title = undefined;
    }
    if (this._cloudResized1 !== undefined) {
      this.app.stage.removeChild(
        this._cloudResized1!.container as PIXI.DisplayObject
      );
      this._cloudResized1.container.destroy();
      this._cloudResized1 = undefined;
    }

    if (this._cloudResized2 !== undefined) {
      this.app.stage.removeChild(
        this._cloudResized2!.container as PIXI.DisplayObject
      );
      this._cloudResized2.container.destroy();
      this._cloudResized2 = undefined;
    }
  }
}
