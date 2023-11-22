import * as PIXI from "pixi.js";

export type ITexture = {
  texture: PIXI.Texture<PIXI.Resource>;
  time: number;
};

export type IAnimation = {
  x: number;
  y: number;
  width: number;
  height: number;
  time: number;
};

export class SpriteElement {
  sprite: PIXI.AnimatedSprite;
  constructor(sprite: PIXI.AnimatedSprite) {
    this.sprite = sprite;
  }
  set animation(textureList: ITexture[]) {
    this.sprite.textures = textureList;
  }
  play() {
    this.sprite.visible = true;
    this.sprite.play();
  }
  stop() {
    this.sprite.stop();
    this.sprite.visible = false;
  }
  destroy() {
    this.sprite.destroy();
  }
}
