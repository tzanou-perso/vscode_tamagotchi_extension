import * as PIXI from "pixi.js";
import { Character } from "../character";
import { EPortalState } from "../../portal/portal";
import { EPetState } from "../commons";
import { ITexture } from "../../sprite/sprite_element";
import bossArray from "../../../../../media/images/boss/boss1/boss1.json";
import bossImages from "../../../../../media/images/boss/boss1/boss1.png";
import { isCollided } from "../../../commons/helper";
import Pet from "../pets/pet";

export default class Boss extends PIXI.AnimatedSprite implements Character {
  state: EPortalState | EPetState;
  moveDir: number;
  health: number;
  maxHealth: number;
  speed: number;
  app: PIXI.Application<HTMLCanvasElement>;
  attackSpeed: number;
  strength: number;
  elapsed: number;
  enemies: Pet[];
  decreaseHealthMultiplier: number;
  indexInActiveFile: number;
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
    enemies,
    decreaseHealthMultiplier,
    indexInActiveFile,
    savedX,
    savedY,
  }: {
    state: EPortalState | EPetState;
    moveDir: number;
    health: number;
    maxHealth: number;
    speed: number;
    app: PIXI.Application<HTMLCanvasElement>;
    textures: ITexture[];
    autoUpdate?: boolean;
    attackSpeed: number;
    strength: number;
    enemies: Pet[];
    decreaseHealthMultiplier: number;
    indexInActiveFile: number;
    savedX?: number;
    savedY?: number;
  }) {
    super(textures, autoUpdate);
    this.state = state;
    this.moveDir = moveDir;
    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.app = app;
    this.attackSpeed = attackSpeed;
    this.indexInActiveFile = indexInActiveFile;
    this.strength = strength;
    this.elapsed = 0.0;
    this.decreaseHealthMultiplier = decreaseHealthMultiplier;
    this.enemies = enemies;
    if (savedX !== undefined && savedY !== undefined) {
      this.x = savedX;
      this.y = savedY;
    }
    this.anchor.set(0.5, 1);
    this.updateAnimations();
    this.ticker.start();
    this.lastUpdateTime = Date.now();
    console.log("boss added", this);
  }
  private elapsedHealthDeacrease: number = 0.0;
  private lastUpdateTime;
  ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {
    this.elapsed += delta;
    this.updateLoop();

    let currentTime = Date.now();
    let deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    this.elapsedHealthDeacrease += deltaTime;
    // each 2 seconds, the pet will lose 1 health
    if (this.elapsedHealthDeacrease >= 1.0 && this.state !== EPetState.DEAD) {
      this.decreaseHealth(this.decreaseHealthMultiplier);
      this.elapsedHealthDeacrease = 0.0;
    }
  });

  updateLoop(): void {
    let maxWidth = Math.max(
      ...this.textures.map((texture) => {
        // console.log("texture", texture);
        return (texture as PIXI.Texture<PIXI.Resource>).orig.width;
      })
    );
    if (this.moveDir === +1 && this.state === EPetState.WALK) {
      this.scale.x = -1;
      this.x += this.speed;
      if (
        this.app !== undefined &&
        this.x >= this.app.renderer.width - maxWidth / 2
      ) {
        this.moveDir = -1;
        this.x = this.app.renderer.width - maxWidth / 2;
        this.elapsed = 0.0;
      }
    }
    // Update the sprite's to let him walk across the screen horizontally
    // from right to left if move is -1 and he is not at the left side of the screen
    else if (this.moveDir === -1) {
      // transform pet to flip horizontally
      this.scale.x = +1;
      // Move the sprite to the left
      this.x -= this.speed;
      if (this.x <= 0 + maxWidth / 2) {
        this.moveDir = +1;
        this.x = maxWidth / 2;
        this.elapsed = 0.0;
      }
    }

    for (let enemy of this.enemies) {
      if (
        isCollided({
          object1: this as PIXI.DisplayObject,
          object2: enemy as PIXI.DisplayObject,
        })
      ) {
        if (this.state !== EPetState.ATTACK && this.state !== EPetState.DEAD) {
          this.state = EPetState.ATTACK;
          this.updateAnimations();
        }
      }
    }
  }

  onHitByAttack(): void {
    throw new Error("Method not implemented.");
  }

  decreaseHealth(multiplier: number): void {
    if (this.state === EPetState.DEAD) return;
    if (this.health > 0) {
      this.health -= this.decreaseHealthMultiplier * multiplier;
    } else {
      this.health = 0;
      this.state = EPetState.DEAD;
      this.moveDir = 0;
      this.updateAnimations();
    }
    console.log("decrease health", this.health);
  }

  static async createAnimation({
    state,
  }: {
    state: EPetState;
  }): Promise<ITexture[]> {
    const type =
      state === EPetState.IDLE
        ? "idle"
        : state === EPetState.WALK
        ? "walk"
        : state === EPetState.ATTACK
        ? "1_atk"
        : state === EPetState.HIT
        ? "take_hit"
        : state === EPetState.DEAD
        ? "death"
        : "idle";
    const textureArray: ITexture[] = [];
    let frameTag = bossArray.meta.frameTags.find((tag) => tag.name === type);
    if (frameTag !== undefined) {
      const textLoaded = await PIXI.Assets.load(bossImages);
      for (let i = frameTag.from; i < frameTag.to; i++) {
        // const row = `${type}.${i}` as keyof typeof bossArray.frames;
        const bossArrayFrame = bossArray.frames[i];
        let frame = new PIXI.Rectangle(
          bossArrayFrame.frame.x,
          bossArrayFrame.frame.y,
          bossArrayFrame.frame.w,
          bossArrayFrame.frame.h
        );
        let text = new PIXI.Texture(textLoaded.baseTexture, frame);
        textureArray.push({ texture: text, time: bossArrayFrame.duration });
      }
    }
    console.log("bossArray", bossArray, textureArray);
    return textureArray;
  }

  async updateAnimations(): Promise<void> {
    const type =
      this.state === EPetState.IDLE
        ? "idle"
        : this.state === EPetState.WALK
        ? "walk"
        : this.state === EPetState.ATTACK
        ? "1_atk"
        : this.state === EPetState.HIT
        ? "take_hit"
        : this.state === EPetState.DEAD
        ? "death"
        : "idle";
    const textureArray: ITexture[] = [];
    let frameTag = bossArray.meta.frameTags.find((tag) => tag.name === type);
    if (frameTag !== undefined) {
      const textLoaded = await PIXI.Assets.load(bossImages);
      for (let i = frameTag.from; i < frameTag.to; i++) {
        // const row = `${type}.${i}` as keyof typeof bossArray.frames;
        const bossArrayFrame = bossArray.frames[i];
        let frame = new PIXI.Rectangle(
          bossArrayFrame.frame.x,
          bossArrayFrame.frame.y,
          bossArrayFrame.frame.w,
          bossArrayFrame.frame.h
        );
        let text = new PIXI.Texture(textLoaded.baseTexture, frame);
        textureArray.push({ texture: text, time: bossArrayFrame.duration });
      }
    }
    // console.log("bossArray", bossArray, textureArray);
    this.textures = textureArray;
    if (this.state === EPetState.DEAD || this.state === EPetState.ATTACK) {
      this.loop = false;
    } else {
      this.loop = true;
    }
    this.onComplete = () => {
      if (this.state === EPetState.DEAD) {
        setTimeout(() => {
          window.postMessage({
            type: "bossDeath",
            message: this.indexInActiveFile,
          });
          console.log("dead");
        }, 1000);
      } else if (this.state === EPetState.ATTACK) {
        for (let enemy of this.enemies) {
          if (
            isCollided({
              object1: this as PIXI.DisplayObject,
              object2: enemy as PIXI.DisplayObject,
            })
          ) {
            enemy.onHitByAttack();
          }
        }
        this.state = EPetState.WALK;
        this.updateAnimations();
        console.log("attacked");
      }
      // if the current frame is the last frame of the attack animation
    };
    this.scale.x = -1;
    this.play();
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
    let enemies = this.enemies.map((enemy) => enemy.toJson());
    let json = JSON.stringify({
      autoUpdate: this.autoUpdate,
      state: this.state,
      moveDir: this.moveDir,
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed,
      attackSpeed: this.attackSpeed,
      indexInActiveFile: this.indexInActiveFile,
      strength: this.strength,
      decreaseHealthMultiplier: this.decreaseHealthMultiplier,
      elapsed: this.elapsed,
      savedX: this.x,
      savedY: this.y,
      enemies: enemies,
    });
    return json;
  }

  static async fromJson(json: string, app: PIXI.Application): Promise<Boss> {
    const bossToImport = JSON.parse(json);
    const enemies = [];
    for (let pet of bossToImport.enemies) {
      //   let petParsed = JSON.parse(pet);
      let petToImport = await Pet.fromJson(pet, app);
      enemies.push(petToImport);
    }
    // bossToImport.enemies = await bossToImport.enemies.map(
    //   async (enemy: string) => {
    //     return await Pet.fromJson(enemy, app);
    //   }
    // );
    bossToImport.enemies = enemies;
    bossToImport.app = app;
    console.log("bossfromjson", bossToImport);
    let textures = await Boss.createAnimation({
      state: bossToImport.state,
    });
    bossToImport.textures = textures;
    let character = new Boss(bossToImport);
    return character;
  }
  initEvents(): void {
    throw new Error("Method not implemented.");
  }
}
