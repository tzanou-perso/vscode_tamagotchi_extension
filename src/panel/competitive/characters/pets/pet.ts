import * as PIXI from "pixi.js";
import { Character } from "../character";
import { EPetState, IPetHeader } from "../commons";

import tamagotchiSheet0 from "../../../../../media/images/pets/tamagotchi/singles/0/tamagotchi.png";
import tamagotchiJson0 from "../../../../../media/images/pets/tamagotchi/singles/0/tamagotchi.json";

import tamagotchiSheet1 from "../../../../../media/images/pets/tamagotchi/singles/1/tamagotchi.png";
import tamagotchiJson1 from "../../../../../media/images/pets/tamagotchi/singles/1/tamagotchi.json";

import tamagotchiSheet2 from "../../../../../media/images/pets/tamagotchi/singles/2/tamagotchi.png";
import tamagotchiJson2 from "../../../../../media/images/pets/tamagotchi/singles/2/tamagotchi.json";

import tamagotchiSheet3 from "../../../../../media/images/pets/tamagotchi/singles/3/tamagotchi.png";
import tamagotchiJson3 from "../../../../../media/images/pets/tamagotchi/singles/3/tamagotchi.json";

import tamagotchiSheet4 from "../../../../../media/images/pets/tamagotchi/singles/4/tamagotchi.png";
import tamagotchiJson4 from "../../../../../media/images/pets/tamagotchi/singles/4/tamagotchi.json";

import tamagotchiSheet5 from "../../../../../media/images/pets/tamagotchi/singles/5/tamagotchi.png";
import tamagotchiJson5 from "../../../../../media/images/pets/tamagotchi/singles/5/tamagotchi.json";

import tamagotchiSheet6 from "../../../../../media/images/pets/tamagotchi/singles/6/tamagotchi.png";
import tamagotchiJson6 from "../../../../../media/images/pets/tamagotchi/singles/6/tamagotchi.json";

import tamagotchiSheet7 from "../../../../../media/images/pets/tamagotchi/singles/7/tamagotchi.png";
import tamagotchiJson7 from "../../../../../media/images/pets/tamagotchi/singles/7/tamagotchi.json";

import tamagotchiSheet8 from "../../../../../media/images/pets/tamagotchi/singles/8/tamagotchi.png";
import tamagotchiJson8 from "../../../../../media/images/pets/tamagotchi/singles/8/tamagotchi.json";

import { ITexture, SpriteElement } from "../../sprite/sprite_element";
import PetHeader from "./pet_header";
import SimpleListener, {
  ComposedListener,
} from "../../../commons/simple_listener";
import CommonsCompetitiveSingleton, {
  COOLDOWN_COMBO,
  DEFAULT_PET,
} from "../../commons";
import { activeFile } from "../../../main";
import { t } from "@vscode/l10n";
import TextTimer from "../../text_timer";

export const tamagotchiesAnimation = [
  {
    animation: tamagotchiJson0,
    sheet: tamagotchiSheet0,
  },
  {
    animation: tamagotchiJson1,
    sheet: tamagotchiSheet1,
  },
  {
    animation: tamagotchiJson2,
    sheet: tamagotchiSheet2,
  },
  {
    animation: tamagotchiJson3,
    sheet: tamagotchiSheet3,
  },
  {
    animation: tamagotchiJson4,
    sheet: tamagotchiSheet4,
  },
  {
    animation: tamagotchiJson5,
    sheet: tamagotchiSheet5,
  },
  {
    animation: tamagotchiJson6,
    sheet: tamagotchiSheet6,
  },
  {
    animation: tamagotchiJson7,
    sheet: tamagotchiSheet7,
  },
  {
    animation: tamagotchiJson8,
    sheet: tamagotchiSheet8,
  },
];

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

  get maxXpLogarithm(): number {
    const multiplier = Math.round(
      this.calculateLevelMultiplier(this.growth) * this.maxXp
    );
    return multiplier;
  }

  calculateLevelMultiplier(level: number) {
    // Adjust the base value for the initial growth
    const initialBase = 1;

    const laterBase = 0.26;

    // Threshold level after which the multiplier remains constant
    const thresholdLevel = 0;

    // Calculate the level multiplier using different formulas before and after the threshold
    let multiplier;
    if (level <= thresholdLevel) {
      multiplier = Math.round(Math.pow(level / 50 + 1, initialBase));
    } else {
      multiplier = Math.round(Math.pow(level, laterBase));
    }

    return multiplier;
  }

  giveBackHealth(amount: number): void {
    let text = "";
    if (this.health === this.maxHealth) return;

    if (this.health + amount > this.maxHealth) {
      this.health = this.maxHealth;
      `MAX`;
    } else {
      this.health += amount;
      `+ ${amount}`;
    }
    this.petHeader.updateHealthBarFill(this.health);
    if (this.health === this.maxHealth) {
      this.petHeader.healthBarContainer.visible = false;
      this.petHeader.headerContainer.visible = false;
      text = `MAX`;
    }

    const comboText = new TextTimer({
      app: this.app,
      text: text,
      timeToAnimInSeconds: 0.5,
      animScale: { start: 1, end: 1 },
      animAlpha: false,
      translateAnim: { x: 30, y: -25 },
      style: new PIXI.TextStyle({
        fill: "#3BFF01", // yellow
        fontSize: 20,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness: 0,
        wordWrap: true,
        wordWrapWidth: 800,
        fontWeight: "bolder",
      }),
    });

    this.app.stage.addChild(comboText);

    comboText.x = this.x;
    comboText.y = this.y - this.height;
  }

  replacePetHeader(newWidth?: number, offsetY: number = 0): void {
    if (newWidth !== undefined) this.petHeader.headerContainer.width = newWidth;
    this.petHeader.headerContainer.x =
      -this.petHeader.headerContainer.width / 2;
    2;
    this.petHeader.headerContainer.y = -this.height + offsetY;
  }
  onHitByAttack(): void {
    this.health -= 1;

    const comboText = new TextTimer({
      app: this.app,
      text: `- 1`,
      timeToAnimInSeconds: 0.5,
      animScale: { start: 1, end: 1 },
      animAlpha: false,
      translateAnim: { x: 30, y: -25 },
      style: new PIXI.TextStyle({
        fill: "#FF2D01", // yellow
        fontSize: 20,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness: 0,
        wordWrap: true,
        wordWrapWidth: 800,
        fontWeight: "bolder",
      }),
    });

    this.app.stage.addChild(comboText);

    comboText.x = this.x;
    comboText.y = this.y - this.height;

    if (this.health > 0) {
      this.petHeader.healthBarContainer.visible = true;
      this.petHeader.headerContainer.visible = true;
      this.petHeader.updateHealthBarFill(this.health);
    } else {
      window.postMessage({
        type: "petDeath",
        message: this.indexInActiveFile,
      });
    }
    console.log("onHitByAttack", this.health, this.maxHealth);
  }

  private _events: string[] = [];

  private _isInTransition: boolean = false;

  ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {
    this.elapsed += delta;
    this.move();
  });

  move(): void {
    if (this.moveDir === +1 && this.state === EPetState.WALK && this.isAdult) {
      this.scale.x = +1 * this.clickScore;
      this.x += this.speed;
      if (
        this.app !== undefined &&
        this.x >= this.app.renderer.width - this.width / 2
      ) {
        this.moveDir = -1;
        this.elapsed = 0.0;
      }
    }
    // Update the sprite's to let him walk across the screen horizontally
    // from right to left if move is -1 and he is not at the left side of the screen
    else if (this.moveDir === -1) {
      // transform pet to flip horizontally
      this.scale.x = -1 * this.clickScore;
      // Move the sprite to the left
      this.x -= this.speed;
      if (this.x <= 0 + this.width / 2) {
        this.moveDir = +1;
        this.elapsed = 0.0;
      }
    }
    if (this.state === EPetState.ADULTTRANSITION) {
      this.alpha = 0.8;
      // tint red
      // this.tint = "#707070";
      this.anchor.set(0.5, 0.5);
      const moveToX = 5 + 41;
      const moveToY = this.app.renderer.height - 15 - this.height / 2;
      if (this._isInTransition === false)
        this.moveToPos({
          x: moveToX,
          y: moveToY,
          speed: 10,
          scale: { start: 1.5, end: 1 * this.clickScore },
        });
      this.rotation += 0.1;

      // if the timer is not set, set it
      if (
        Math.round(this.y) <= Math.round(moveToY) + 5 &&
        Math.round(this.y) >= Math.round(moveToY) - 5 &&
        Math.round(this.x) <= Math.round(moveToX) + 5 &&
        Math.round(this.x) >= Math.round(moveToX) - 5 &&
        this._isInTransition === false
      ) {
        this._isInTransition = true;
        this.setToAdult();
      }
    } else {
      if (this.isAdult) {
        if (this.y !== this.app.renderer.height) {
          this.y += this.speedFall;
        }
      }
    }
  }

  moveToPos({
    x,
    y,
    speed = this.speed,
    scale,
  }: {
    x: number;
    y: number;
    speed?: number;
    scale?: { start: number; end: number };
  }): void {
    const dx = x - this.x;
    const dy = y - this.y;

    // Calculate the total distance to the target position
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the fractions of the total distance that correspond to the x and y distances
    const fractionX = dx / distance;
    const fractionY = dy / distance;

    // Update the sprite's position
    if (this.x !== x) {
      this.x += fractionX * speed;
    }

    if (this.y !== y) {
      this.y += fractionY * speed;
    }

    if (scale !== undefined) {
      // Calculate the total distance to the target position
      const totalDistance = Math.sqrt(dx * dx + dy * dy);

      // Calculate the total number of frames based on the total distance
      const totalFrames = totalDistance / speed;

      // Calculate the amount to decrease the scale in each frame
      const scaleDecrease = (scale.start - scale.end) / totalFrames;

      // Decrease the scale by the calculated amount each frame
      if (this.scale.x > scale.end) {
        this.scale.x -= scaleDecrease;
      }

      if (this.scale.y > scale.end) {
        this.scale.y -= scaleDecrease;
      }
    }
  }

  setPos({ x, y }: { x: number; y: number }): void {
    this.x = x;
    this.y = y;
  }

  eat(): void {
    throw new Error("Method not implemented.");
  }

  giveXp(xp: number): void {
    this.xp += xp;
    if (this.xp > this.maxXp) {
      this.growth += 1;
      this.maxHealth =
        this.growth === 0 ? 0 : this.growth * DEFAULT_PET.maxHealth;
      this.health = this.growth === 0 ? 0 : this.growth * DEFAULT_PET.health;

      if (tamagotchiesAnimation.length <= this.growth) {
        this.petHeader.xpBarContainer.visible = false;
        if (this.health === this.maxHealth) {
          this.petHeader.healthBarContainer.visible = false;
          this.petHeader.headerContainer.visible = false;
        } else {
          this.petHeader.healthBarContainer.visible = true;
          this.petHeader.headerContainer.visible = true;
        }
        this.petHeader.updateHealthBarFill(this.health, this.maxHealth);
        this.replacePetHeader(20, -5);
        this.state = EPetState.ADULTTRANSITION;
        this.isAdult = true;
      } else {
        this.maxXp = this.maxXpLogarithm;
        this.xp = 0;
        this.updateAnimations();
      }
    }
    this.petHeader.updateXpBarFill(this.xp, this.maxXp);
  }

  setToAdult(): void {
    setTimeout(() => {
      let commonCompetitive = CommonsCompetitiveSingleton.getInstance();
      let score = this.clickScore >= 2 ? 2 : this.clickScore;
      this.scale.set(1 * score, 1 * score);
      this.alpha = 1;
      this.anchor.set(0.5, 1);
      this.rotation = 0;
      this.y = this.app.renderer.height - 10;

      this.elapsed = 5;
      // return;
      this.isAdult = true;

      this.state = EPetState.WALK;
      this._isInTransition = false;
      this.moveDir = +1;
      this.petHeader.xpBarContainer.visible = false;
      if (this.health === this.maxHealth) {
        this.petHeader.healthBarContainer.visible = false;
        this.petHeader.headerContainer.visible = false;
      } else {
        this.petHeader.healthBarContainer.visible = true;
        this.petHeader.headerContainer.visible = true;
      }
      this.replacePetHeader(20, -5);
      this.petHeader.updateHealthBarFill(this.health);
      this.updateAnimations();
    }, 1000);
  }

  static async createAnimation({
    state,
    growth,
  }: {
    state: EPetState;
    growth: number;
  }): Promise<ITexture[]> {
    const type =
      state === EPetState.IDLE
        ? "idle"
        : state === EPetState.EATING
        ? "eat"
        : state === EPetState.WALK
        ? "walk"
        : "idle";
    const textureArray: ITexture[] = [];
    if (growth >= tamagotchiesAnimation.length) {
      growth = tamagotchiesAnimation.length - 1;
    }
    const animationJson = tamagotchiesAnimation[growth].animation;
    let frameTag = animationJson.meta.frameTags.find(
      (tag) => tag.name === type
    );
    if (frameTag !== undefined) {
      const textLoaded = await PIXI.Assets.load(
        tamagotchiesAnimation[growth].sheet
      );
      for (let i = frameTag.from; i <= frameTag.to; i++) {
        // const row = `${type}.${i}` as keyof typeof bossArray.frames;
        const bossArrayFrame = animationJson.frames[i];
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
    return textureArray;
  }

  async updateAnimations(): Promise<void> {
    const type =
      this.state === EPetState.IDLE
        ? "idle"
        : this.state === EPetState.EATING
        ? "eat"
        : this.state === EPetState.WALK
        ? "walk"
        : "idle";
    const textureArray: ITexture[] = [];
    if (this.growth >= tamagotchiesAnimation.length) {
      this.growth = tamagotchiesAnimation.length - 1;
    }
    const animationJson = tamagotchiesAnimation[this.growth].animation;
    let frameTag = animationJson.meta.frameTags.find(
      (tag) => tag.name === type
    );
    if (frameTag !== undefined) {
      const textLoaded = await PIXI.Assets.load(
        tamagotchiesAnimation[this.growth].sheet
      );
      for (let i = frameTag.from; i <= frameTag.to; i++) {
        // const row = `${type}.${i}` as keyof typeof bossArray.frames;
        const bossArrayFrame = animationJson.frames[i];
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

    this.textures = textureArray;
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
