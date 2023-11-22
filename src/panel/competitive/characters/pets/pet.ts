import * as PIXI from "pixi.js";
import { Character } from "../character";
import { EPetState } from "../commons";

import { ITexture, SpriteElement } from "../../sprite/sprite_element";
import PetHeader from "./pet_header";
import CommonsCompetitiveSingleton, { DEFAULT_PET } from "../../commons";
import TextTimer from "../../text_timer";
import { createOrUpdateAnimation, tamagotchiesAnimation } from "./pet_anim";
import { update } from "./update_pet";
import { get } from "http";
import { getTrailEmitter } from "./trail";
import {
  giveBackHealth,
  calculateLevelMultiplier,
  onHitByAttack,
  giveXp,
  setToAdult,
} from "./pet_stat";

export default class Pet extends PIXI.AnimatedSprite implements Character {
  growth: number;
  xp: number;
  elapsed: number;
  petHeader: PetHeader;
  maxXp: number;
  isAdult: boolean;
  speedFall: number;
  state: EPetState;
  moveDir: number;
  health: number;
  maxHealth: number;
  speed: number;
  app: PIXI.Application<HTMLCanvasElement>;
  attackSpeed: number;
  strength: number;
  indexInActiveFile: number;
  clickScore: number;

  trail?: PIXI.Container<PIXI.DisplayObject>;

  constructor({
    textures,
    autoUpdate,
    state,
    moveDir,
    health,
    maxHealth,
    speed,
    growth,
    xp,
    elapsed,
    maxXp,
    isAdult,
    speedFall,
    app,
    savedX,
    savedY,
    attackSpeed,
    strength,
    indexInActiveFile,
    clickScore,
  }: {
    textures: ITexture[];
    autoUpdate?: boolean;
    state: EPetState;
    moveDir: number;
    health: number;
    maxHealth: number;
    speed: number;
    growth: number;
    xp: number;
    elapsed: number;
    maxXp: number;
    isAdult: boolean;
    speedFall: number;
    app: PIXI.Application<HTMLCanvasElement>;
    savedX?: number;
    savedY?: number;
    attackSpeed: number;
    strength: number;
    indexInActiveFile: number;
    clickScore: number;
  }) {
    super(textures, autoUpdate);
    this.growth = growth;
    this.xp = xp;
    this.elapsed = elapsed;
    this.maxXp = maxXp;
    this.maxXp = this.maxXpLogarithm;
    this.maxHealth = maxHealth;
    this.health = health;
    this.clickScore = clickScore;
    this.scale.set(1 * this.clickScore, 1 * this.clickScore);
    this.petHeader = new PetHeader({
      height: 3,
      width: 50,
      maxXp: this.maxXp,
      health: health,
      maxHealth: maxHealth,
    });
    this.isAdult = isAdult;
    this.speedFall = speedFall;
    this.state = state;
    this.moveDir = moveDir;
    this.speed = speed;
    this.indexInActiveFile = indexInActiveFile;
    this.attackSpeed = attackSpeed;
    this.strength = strength;

    this.app = app;

    this.anchor.set(0.5, 1);
    if (!this.isAdult) {
      this.scale.set(1.5, 1.5);
    }

    if (savedX !== undefined && savedY !== undefined) {
      this.x = savedX;
      this.y = savedY;
    }

    this.addChild(this.petHeader.headerContainer as PIXI.DisplayObject);
    this.replacePetHeader();
    if (this.isAdult) {
      this.petHeader.xpBarContainer.visible = false;
      if (this.health === this.maxHealth) {
        this.petHeader.healthBarContainer.visible = false;
        this.petHeader.headerContainer.visible = false;
      } else {
        this.petHeader.healthBarContainer.visible = true;
        this.petHeader.headerContainer.visible = true;
      }
      this.petHeader.headerContainer.width = 20;
    } else {
      this.petHeader.xpBarContainer.visible = true;
      this.petHeader.healthBarContainer.visible = false;
    }
    this.petHeader.updateXpBarFill(this.xp);
    this.petHeader.updateHealthBarFill(this.health);
    this.ticker.start();
    this.play();
  }

  startTimeToPosAnim = Date.now();

  get maxXpLogarithm(): number {
    const multiplier = Math.round(
      calculateLevelMultiplier(this.growth) * this.maxXp
    );
    return multiplier;
  }

  giveBackHealth(amount: number): void {
    giveBackHealth(this, amount);
  }

  replacePetHeader(newWidth?: number, offsetY: number = 0): void {
    if (newWidth !== undefined) this.petHeader.headerContainer.width = newWidth;
    this.petHeader.headerContainer.x =
      -this.petHeader.headerContainer.width / 2;
    2;
    this.petHeader.headerContainer.y = -this.height + offsetY;
  }

  onHitByAttack(): void {
    onHitByAttack(this);
  }

  private _events: string[] = [];

  isInTransition: boolean = false;

  ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {
    this.elapsed += delta;
    this.updateLoop();
  });

  async updateLoop(): Promise<void> {
    update({ pet: this });
  }

  setPos({ x, y }: { x: number; y: number }): void {
    this.x = x;
    this.y = y;
  }

  eat(): void {
    throw new Error("Method not implemented.");
  }

  giveXp(xp: number): void {
    giveXp(this, xp);
  }

  setToAdult(): void {
    setToAdult(this);
  }

  static async createAnimation({
    state,
    growth,
  }: {
    state: EPetState;
    growth: number;
  }): Promise<ITexture[]> {
    return await createOrUpdateAnimation({ state, growth });
  }

  async updateAnimations(): Promise<void> {
    let texturesToAdd = await createOrUpdateAnimation({
      state: this.state,
      growth: this.growth,
    });
    this.textures = texturesToAdd;
    this.play();
  }

  sleep(): void {
    throw new Error("Method not implemented.");
  }

  die(): void {
    throw new Error("Method not implemented.");
  }

  toJson(): string {
    let json = JSON.stringify({
      autoUpdate: this.autoUpdate,
      state: this.state,
      moveDir: this.moveDir,
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed,
      growth: this.growth,
      xp: this.xp,
      elapsed: this.elapsed,
      maxXp: this.maxXp,
      isAdult: this.isAdult,
      speedFall: this.speedFall,
      savedX: this.x,
      savedY: this.y,
      clickScore: this.clickScore,
    });
    return json;
  }

  static async fromJson(json: string, app: PIXI.Application): Promise<Pet> {
    const petToImport = JSON.parse(json);
    petToImport.app = app;
    let textures = await Pet.createAnimation({
      state: petToImport.state,
      growth: petToImport.growth,
    });
    petToImport.textures = textures;
    let character = new Pet(petToImport);
    return character;
  }

  destroy(): void {
    window.removeEventListener("petStateChange", (() =>
      this.updatePetState()) as EventListener);
    this.ticker.remove((delta) => {
      this.elapsed += delta;
      this.updateLoop();
    });
    this.ticker.stop();
    this.ticker.destroy();
    this.texture.destroy();
    super.destroy();
  }

  initEvents(): void {
    window.addEventListener("petStateChange", () => this.updatePetState());
    this._events.push("petStateChange");
  }

  async updatePetState() {
    await this.updateAnimations();
  }
}
