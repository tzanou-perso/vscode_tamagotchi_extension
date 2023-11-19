import * as PIXI from "pixi.js";
import { Character } from "../character";
import { EPetState, IPetHeader } from "../commons";
import tamagotchyArray from "../../../../../media/images/pets/tamagotchi/tamagotchi_array.json";
import tamagotchiImages from "../../../../../media/images/pets/tamagotchi/tamagotchi.png";
import { ITexture, SpriteElement } from "../../sprite/sprite_element";
import PetHeader from "./pet_header";
import SimpleListener, {
  ComposedListener,
} from "../../../commons/simple_listener";
import CommonsCompetitiveSingleton from "../../commons";

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
  speed: number;
  app: PIXI.Application<HTMLCanvasElement>;
  constructor({
    textures,
    autoUpdate,
    state,
    moveDir,
    health,
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
  }: {
    textures: ITexture[];
    autoUpdate?: boolean;
    state: EPetState;
    moveDir: number;
    health: number;
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
  }) {
    super(textures, autoUpdate);

    this.growth = growth;
    this.xp = xp;
    this.elapsed = elapsed;
    this.maxXp = maxXp;
    this.petHeader = new PetHeader({
      height: 3,
      width: 50,
      maxXp: maxXp,
    });
    this.isAdult = isAdult;
    this.speedFall = speedFall;
    this.state = state;
    this.moveDir = moveDir;
    this.health = health;
    this.speed = speed;

    this.app = app;

    this.anchor.set(0.5, 1);
    if (!this.isAdult) {
      this.scale.set(1.5, 1.5);
    }

    if (savedX !== undefined && savedY !== undefined) {
      this.x = savedX;
      this.y = savedY;
    }

    this.addChild(this.petHeader.getContainer() as PIXI.DisplayObject);
    this.petHeader.xpBarContainer.x = -this.petHeader.xpBarContainer.width / 2;
    2;
    this.petHeader.xpBarContainer.y = -this.height;
    this.petHeader.updateXpBarFill(this.xp);
    this.ticker.start();
    this.play();
  }

  private _events: string[] = [];

  private _isInTransition: boolean = false;

  ticker: PIXI.Ticker = new PIXI.Ticker().add((delta) => {
    this.elapsed += delta;
    this.move();
  });

  move(): void {
    if (this.moveDir === +1 && this.state === EPetState.WALK && this.isAdult) {
      this.scale.x = 1;
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
      this.scale.x = -1;
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
          scale: { start: 1.5, end: 1 },
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
    if (this.xp >= this.maxXp) {
      this.growth += 1;

      if (tamagotchyArray.length <= this.growth) {
        this.petHeader.xpBarContainer.visible = false;
        this.removeChild(this.petHeader.xpBarContainer as PIXI.DisplayObject);
        this.state = EPetState.ADULTTRANSITION;
        this.isAdult = true;
      } else {
        this.xp = 0;
        this.updateAnimations();
      }
    }
    this.petHeader.updateXpBarFill(this.xp);
  }

  setToAdult(): void {
    setTimeout(() => {
      let commonCompetitive = CommonsCompetitiveSingleton.getInstance();
      this.scale.set(1, 1);
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
      this.petHeader.getContainer().visible = false;
      this.updateAnimations();
      this.petHeader.xpBarContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
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
    if (growth >= tamagotchyArray.length) {
      growth = tamagotchyArray.length - 1;
    }
    let animations = tamagotchyArray[growth][type].animation;
    for (let animation of animations) {
      const textLoaded = await PIXI.Assets.load(tamagotchiImages);
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
    if (this.growth >= tamagotchyArray.length) {
      this.growth = tamagotchyArray.length - 1;
    }
    let animations = tamagotchyArray[this.growth][type].animation;
    const textLoaded = await PIXI.Assets.load(tamagotchiImages);
    for (let animation of animations) {
      let frame = new PIXI.Rectangle(
        animation.x,
        animation.y,
        animation.width,
        animation.height
      );

      let text = new PIXI.Texture(textLoaded.baseTexture, frame);
      textureArray.push({ texture: text, time: animation.time });
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
      speed: this.speed,
      growth: this.growth,
      xp: this.xp,
      elapsed: this.elapsed,
      maxXp: this.maxXp,
      isAdult: this.isAdult,
      speedFall: this.speedFall,
      savedX: this.x,
      savedY: this.y,
    });
    return json;
  }

  static async fromJson(json: string, app: PIXI.Application): Promise<Pet> {
    const petToImport = JSON.parse(json);
    petToImport.app = app;
    console.log("fromjson", petToImport);
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
