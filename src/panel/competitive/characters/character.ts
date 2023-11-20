import * as PIXI from "pixi.js";
import { EPetState } from "./commons";
import { EPortalState } from "../portal/portal";
import { SpriteElement } from "../sprite/sprite_element";

export abstract class Character {
  state: EPetState | EPortalState;
  moveDir: number;
  health: number;
  maxHealth: number;
  attackSpeed: number;
  strength: number;
  speed: number;
  app: PIXI.Application<HTMLCanvasElement>;
  elapsed?: number;

  constructor(
    state: EPetState | EPortalState,
    moveDir: number,
    health: number,
    speed: number,
    app: PIXI.Application<HTMLCanvasElement>,
    attackSpeed: number,
    strength: number,
    maxHealth: number
  ) {
    this.state = state;
    this.moveDir = moveDir;
    this.health = health;
    this.speed = speed;
    this.app = app;
    this.attackSpeed = attackSpeed;
    this.strength = strength;
    this.elapsed = 0.0;
    this.maxHealth = maxHealth;
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

  abstract onHitByAttack(): void;
}
