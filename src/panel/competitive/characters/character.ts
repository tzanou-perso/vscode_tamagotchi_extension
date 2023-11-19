import * as PIXI from "pixi.js";
import { EPetState } from "./commons";
import { EPortalState } from "../portal/portal";
import { SpriteElement } from "../sprite/sprite_element";

export abstract class Character {
  state: EPetState | EPortalState;
  moveDir: number;
  health: number;
  speed: number;
  app: PIXI.Application<HTMLCanvasElement>;

  constructor(
    state: EPetState | EPortalState,
    moveDir: number,
    health: number,
    speed: number,
    app: PIXI.Application<HTMLCanvasElement>
  ) {
    this.state = state;
    this.moveDir = moveDir;
    this.health = health;
    this.speed = speed;
    this.app = app;
  }

  abstract ticker: PIXI.Ticker;

  abstract move(): void;

  abstract eat(): void;

  abstract sleep(): void;

  abstract play(): void;

  abstract die(): void;

  abstract toJson(): string;

  abstract destroy(): void;

  abstract initEvents(): void;
}
