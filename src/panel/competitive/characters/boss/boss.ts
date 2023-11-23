import * as PIXI from "pixi.js";
import { Character } from "../character";
import { EPortalState } from "../../portal/portal";
import { EPetState } from "../commons";
import { ITexture } from "../../sprite/sprite_element";
import boss0Array from "../../../../../media/images/boss/boss0/boss0.json";
import boss0Images from "../../../../../media/images/boss/boss0/boss0.png";
import boss1Array from "../../../../../media/images/boss/boss1/boss1.json";
import boss1Images from "../../../../../media/images/boss/boss1/boss1.png";
import { isCollided } from "../../../commons/helper";
import Pet from "../pets/pet";
import PetHeader from "../pets/pet_header";
import TextTimer from "../../text_timer";
import App from "../../main/app";

export const bossList = {
  boss0: { array: boss0Array, images: boss0Images },
  boss1: { array: boss1Array, images: boss1Images },
};

export default class Boss extends PIXI.AnimatedSprite implements Character {
  state: EPortalState | EPetState;
  moveDir: number;
  health: number;
  maxHealth: number;
  speed: number;
  app: App;
  attackSpeed: number;
  strength: number;
  elapsed: number;
  enemies: Pet[];
  decreaseHealthMultiplier: number;
  indexInActiveFile: number;
  bossName: string;
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
    bossName,
  }: {
    state: EPortalState | EPetState;
    moveDir: number;
    health: number;
    maxHealth: number;
    speed: number;
    app: App;
    textures: ITexture[];
    autoUpdate?: boolean;
    attackSpeed: number;
    strength: number;
    enemies: Pet[];
    decreaseHealthMultiplier: number;
    indexInActiveFile: number;
    savedX?: number;
    savedY?: number;
    bossName: string;
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
    this.bossName = bossName;
    if (savedX !== undefined && savedY !== undefined) {
      this.x = savedX;
      this.y = savedY;
    }
    this.anchor.set(0.5, 1);
    this.updateAnimations();
    this.ticker.start();
    this.lastUpdateTime = Date.now();
    console.log("boss added", this);
    this.bossHeader = new PetHeader({
      width: 30,
      height: 3,
      health: this.health,
      maxHealth: this.maxHealth,
      maxXp: 0,
      petScale: this.scale.x,
    });
    this.addChild(this.bossHeader.headerContainer);
    this.bossHeader.headerContainer.x = this.x;
    this.bossHeader.headerContainer.y = this.y - this.height - 5;
    this.bossHeader.healthBarContainer.visible = true;
    this.bossHeader.healthBarFill.visible = true;

    this.interactive = true;
    this.on("pointerdown", () => {
      // Code to run when the sprite is clicked...
      console.log("boss clicked");
      if (this.state !== EPetState.DEAD) {
        this.onHitByAttack(0.5);
      }
    });
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
    } else if (this.state === EPetState.DEAD) {
      this.bossHeader.healthBarContainer.visible = false;
      this.bossHeader.healthBarFill.visible = false;
      this.removeChild(this.bossHeader.headerContainer);
    }
  });

  bossHeader: PetHeader;

  updateLoop(): void {
    let maxWidth = Math.max(
      ...this.textures.map((texture) => {
        // console.log("texture", texture);
        return (texture as PIXI.Texture<PIXI.Resource>).orig.width;
      })
    );
    if (this.moveDir === +1 && this.state === EPetState.WALK) {
      this.scale.x = -1;
      this.bossHeader.headerContainer.scale.x = -1;
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
      this.bossHeader.headerContainer.scale.x = +1;
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
        enemy.alpha !== 0 &&
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

  onHitByAttack(healthToRemove: number): void {
    this.state = EPetState.ATTACK;
    this.updateAnimations();
    this.decreaseHealth(healthToRemove);
    const comboText = new TextTimer({
      app: this.app,
      text: `- ${healthToRemove}}`,
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

    this.app.stage.addChild(comboText as PIXI.DisplayObject);

    comboText.x = this.x;
    comboText.y = this.y - this.height;
  }

  decreaseHealth(multiplier: number): void {
    if (this.state === EPetState.DEAD) return;
    if (this.health > 0) {
      this.health -= this.decreaseHealthMultiplier * multiplier;
      this.bossHeader.updateHealthBarFill(
        this.health,
        this.scale.x,
        this.maxHealth
      );
    } else {
      this.health = 0;
      this.state = EPetState.DEAD;
      this.moveDir = 0;
      this.updateAnimations();
    }
  }

  static async createAnimation({
    state,
    bossName,
  }: {
    state: EPetState;
    bossName: string;
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
    const bossArray = bossList[bossName as keyof typeof bossList].array;
    const bossImages = bossList[bossName as keyof typeof bossList].images;
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
    const bossArray = bossList[this.bossName as keyof typeof bossList].array;
    const bossImages = bossList[this.bossName as keyof typeof bossList].images;
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
    if (
      this.state === EPetState.DEAD ||
      this.state === EPetState.ATTACK ||
      this.state === EPetState.HIT
    ) {
      this.loop = false;
    } else {
      this.loop = true;
    }
    this.onComplete = () => {
      if (this.state === EPetState.DEAD) {
        setTimeout(() => {
          this.alpha = 0;
          console.log("dead");
        }, 1000);
      } else if (this.state === EPetState.ATTACK) {
        // reduce enmy array length to avoid attacking too many pets at the same time
        let petsNonReferenced = [];
        for (let pet of this.enemies) {
          petsNonReferenced.push(pet);
        }
        const maxEnemiesToAttack = 3;
        let ennemyAttacked = 0;
        for (let enemy of this.app.activeFile.pets) {
          if (
            enemy.alpha !== 0 &&
            isCollided({
              object1: this as PIXI.DisplayObject,
              object2: enemy as PIXI.DisplayObject,
            })
          ) {
            if (enemy.maxHealth > 3 && ennemyAttacked >= maxEnemiesToAttack)
              break;
            if (enemy.maxHealth > 3) ennemyAttacked++;
            this.app.activeFile.pets[enemy.indexInActiveFile].onHitByAttack();
          }
        }
        this.state = EPetState.WALK;
        this.updateAnimations();
        console.log("attacked");
      } else if (this.state === EPetState.HIT) {
        this.state = EPetState.WALK;
        this.updateAnimations();
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
  destroy(): void {
    this.ticker.stop();
    if (this.texture) this.texture.destroy();
    super.destroy();
    this.app.stage.removeChild(this as PIXI.DisplayObject);
    this.app.activeFile.bosses.splice(this.indexInActiveFile, 1);
    for (let boss of this.app.activeFile.bosses) {
      if (boss.indexInActiveFile > this.indexInActiveFile) {
        boss.indexInActiveFile -= 1;
      }
    }
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
      bossName: this.bossName,
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
      bossName: bossToImport.bossName,
    });
    bossToImport.textures = textures;
    let character = new Boss(bossToImport);
    return character;
  }
  initEvents(): void {
    throw new Error("Method not implemented.");
  }
}
