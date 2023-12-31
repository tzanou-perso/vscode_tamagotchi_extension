import { ITexture, SpriteElement } from "../sprite/sprite_element";
import portalArray from "../../../../media/images/portal.json";
import portalImages from "../../../../media/images/portal.png";

import * as PIXI from "pixi.js";
import { Character } from "../characters/character";
import { EPetState } from "../characters/commons";

export enum EPortalState {
  IDLE,
}

export default class Portal extends PIXI.AnimatedSprite implements Character {
  state: EPortalState;
  moveDir: number;
  health: number;
  maxHealth: number;
  speed: number;
  app: PIXI.Application<HTMLCanvasElement>;
  attackSpeed: number;
  strength: number;
  constructor({
    textures,
    autoUpdate,
    state,
    moveDir,
    health,
    maxHealth,
    speed,
    app,
    attackSpeed,
    strength,
  }: {
    textures: ITexture[];
    autoUpdate?: boolean;
    state: EPortalState;
    moveDir: number;
    health: number;
    maxHealth: number;
    speed: number;
    app: PIXI.Application<HTMLCanvasElement>;
    attackSpeed: number;
    strength: number;
  }) {
    super(textures, autoUpdate);
    this.state = state;
    this.moveDir = moveDir;
    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.app = app;
    this.anchor.set(0, 1);
    this.play();
    this.x = 5;
    this.y = app.renderer.height;
    this.attackSpeed = attackSpeed;
    this.strength = strength;
  }
  elapsed?: number | undefined;
  onHitByAttack(): void {
    throw new Error("Method not implemented.");
  }

  ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {});

  updateLoop(): void {
    throw new Error("Method not implemented.");
  }
  eat(): void {
    throw new Error("Method not implemented.");
  }
  sleep(): void {
    throw new Error("Method not implemented.");
  }
  die(): void {
    throw new Error("Method not implemented.");
  }
  toJson(): string {
    throw new Error("Method not implemented.");
  }
  initEvents(): void {
    throw new Error("Method not implemented.");
  }

  static async createAnimations(): Promise<ITexture[]> {
    const textureArray: ITexture[] = [];
    const textLoaded = await PIXI.Assets.load(portalImages);
    for (let animation of portalArray) {
      let frame = new PIXI.Rectangle(
        animation.x,
        animation.y,
        animation.width,
        animation.height
      );

      let text = new PIXI.Texture(textLoaded.baseTexture, frame);
      textureArray.push({ texture: text, time: animation.time });
    }
    return textureArray;
  }
}
