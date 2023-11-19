import * as PIXI from "pixi.js";

export type TTextTimerScale = {
  start: number;
  end: number;
};

export type TTextTimerTranslate = {
  x: number;
  y: number;
};

export default class TextTimer extends PIXI.Text {
  private timer: number;
  timeToAnimInSeconds: number;
  animScale?: TTextTimerScale;
  app: PIXI.Application<HTMLCanvasElement>;
  animAlpha: boolean;
  translateAnim?: TTextTimerTranslate;

  constructor({
    text,
    style,
    timer = 0,
    timeToAnimInSeconds = 0,
    animScale,
    app,
    animAlpha = false,
    translateAnim,
  }: {
    text: string;
    style: PIXI.TextStyle;
    timer?: number;
    timeToAnimInSeconds?: number;
    animScale?: TTextTimerScale;
    app: PIXI.Application<HTMLCanvasElement>;
    animAlpha?: boolean;
    translateAnim?: TTextTimerTranslate;
  }) {
    super(text, style);
    this.timer = timer;
    this.timeToAnimInSeconds = timeToAnimInSeconds;
    this.animScale = animScale;
    this.app = app;
    app.stage.addChild(this as PIXI.DisplayObject);
    if (timeToAnimInSeconds > 0) {
      this.ticker.start();
    }
    this.translateAnim = translateAnim;
    this.animAlpha = animAlpha;
    if (this.animAlpha) {
      this.alpha = 0;
    }
    if (this.animScale) {
      this.scale.x = this.animScale.start;
      this.scale.y = this.animScale.start;
    }
  }

  private ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {
    this.timer += delta;
    if (this.timer <= this.timeToAnimInSeconds * 60) {
      if (this.animAlpha) {
        this.alpha = this.timer / (this.timeToAnimInSeconds * 60);
      }
      if (
        this.animScale !== undefined &&
        this.scale.x < this.animScale.end &&
        this.scale.y < this.animScale.end
      ) {
        const scaleIncrease =
          (this.animScale.end - this.animScale.start) /
          (this.timeToAnimInSeconds * 60);
        this.scale.x += scaleIncrease;
        this.scale.y += scaleIncrease;
      }
      if (this.translateAnim) {
        this.translateToPos();
      }
    } else {
      this.finish();
    }
  });

  finish(timeout?: number): void {
    setTimeout(
      () => {
        this.ticker.stop();
        this.ticker.destroy();
        this.app.stage.removeChild(this as PIXI.DisplayObject);
        this.destroy();
      },
      timeout !== undefined ? timeout : this.timeToAnimInSeconds
    );
  }

  translateToPos(): void {
    if (!this.translateAnim) return;
    const x = this.position.x + this.translateAnim.x;
    const y = this.position.y + this.translateAnim.y;
    const dx = x - this.position.x;
    const dy = y - this.position.y;

    // Calculate the total distance to the target position
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the fractions of the total distance that correspond to the x and y distances
    const fractionX = dx / distance;
    const fractionY = dy / distance;

    const speed = distance / (this.timeToAnimInSeconds * 60);

    // Update the sprite's position
    if (this.position.x !== x) {
      this.position.x += fractionX * speed;
    }

    if (this.position.y !== y) {
      this.position.y += fractionY * speed;
    }
  }
}
