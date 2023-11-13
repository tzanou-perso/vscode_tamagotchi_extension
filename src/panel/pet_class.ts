import * as tamagotchiJson from "../../media/images/pets/tamagotchi/tamagotchi.json";
import tamagotchiImages from "../../media/images/pets/tamagotchi/tamagotchi.png";
import * as PIXI from "pixi.js";
import { FoodList, FoodClassType } from "./foodClass";
import FoodClass from "./foodClass";

export enum petState {
  "walk",
  "eat",
  "sleep",
  "play",
  "idle",
  "dead",
}

export enum IPetGrowth {
  "egg",
  "baby",
  "child",
  "teen",
  "adult",
  "old",
}

type AnimationPossibilityObject = {
  [key in IPetGrowth]?: any;
};

export type IPet = {
  state: petState;
  elapsed: number;
  moveDir: number;
  eachKeyCountBeforeEat: number;
  growth: IPetGrowth;
};

export type IPetClass = {
  state: petState;
  elapsed: number;
  moveDir: number;
  eachKeyCountBeforeEat: number;
  growth: IPetGrowth;
  animatedSprite: PIXI.AnimatedSprite;
  xp: number;
  xpBarContainer: PIXI.Graphics;
  xpBarFill: PIXI.Graphics;
};

export type IAnimation = {
  x: number;
  y: number;
  width: number;
  height: number;
  time: number;
};

export default class PetClass {
  public state: petState;
  public elapsed: number;
  public moveDir: number;
  public eachKeyCountBeforeEat: number;
  public growth: IPetGrowth;
  public animatedSprite: PIXI.AnimatedSprite;
  public xp: number = 0;
  public xpBarContainer: PIXI.Graphics;
  public xpBarFill: PIXI.Graphics;

  constructor(pet: IPetClass) {
    this.state = pet.state;
    this.elapsed = pet.elapsed;
    this.moveDir = pet.moveDir;
    this.eachKeyCountBeforeEat = pet.eachKeyCountBeforeEat;
    this.growth = pet.growth;
    this.animatedSprite = pet.animatedSprite;
    this.xp = pet.xp;
    this.xpBarContainer = pet.xpBarContainer;
    this.xpBarFill = pet.xpBarFill;
  }

  public eatingFood: FoodClass[] = [];

  public tickAnimPet({ app, delta }: { app: PIXI.Application; delta: number }) {
    if (this.state === petState.walk && this.growth != IPetGrowth.egg) {
      this.elapsed += delta;
      this.moveAnimatedSprite({
        app: app,
      });
      this.elapsed = this.elapsed;
      this.moveDir = this.moveDir;
    } else {
      this.elapsed = this.animatedSprite.x / 0.8;
    }
  }

  public moveAnimatedSprite({ app }: { app: PIXI.Application }) {
    if (this.moveDir === +1) {
      this.animatedSprite.scale.x = 1;
      this.animatedSprite.x = Math.floor(
        (this.elapsed * 0.8) % app.renderer.width
      );
      if (
        this.animatedSprite.x >=
        app.renderer.width - this.animatedSprite.width
      ) {
        this.moveDir = -1;
        this.elapsed = 0.0;
      }
    }
    // Update the sprite's to let him walk across the screen horizontally
    // from right to left if move is -1 and he is not at the left side of the screen
    else if (this.moveDir === -1) {
      // transform pet to flip horizontally
      this.animatedSprite.scale.x = -1;
      // Move the sprite to the left
      this.animatedSprite.x = Math.floor(
        app.renderer.width - ((this.elapsed * 0.8) % app.renderer.width)
      );
      // console.log('sprite.x', sprite.x, elapsed);
      if (this.animatedSprite.x === 0 + this.animatedSprite.width) {
        this.moveDir = +1;
        this.elapsed = 0.0;
      }
    }
  }

  public async updateAnimatedSprite({
    animations,
    app,
  }: {
    animations: IAnimation[];
    app: PIXI.Application;
  }) {
    const textureArray: {
      texture: PIXI.Texture<PIXI.Resource>;
      time: number;
    }[] = [];
    for (let animation of animations) {
      const textLoaded = await PIXI.Assets.load(tamagotchiImages);
      let frame = await new PIXI.Rectangle(
        animation.x,
        animation.y,
        animation.width,
        animation.height
      );
      let text = new PIXI.Texture(textLoaded.baseTexture, frame);
      textureArray.push({ texture: text, time: animation.time });
    }

    this.animatedSprite.textures = textureArray;
    this.animatedSprite.play();
    this.animatedSprite.y = app.renderer.height - this.animatedSprite.height;
  }

  public async nextGrowth({ app }: { app: PIXI.Application }) {
    if (this.growth < IPetGrowth.old) {
      let time = 0;
      let timeelapsedInMs = 0;
      let currentTimestamp = Date.now();
      if (this.animationsPossibility[this.growth].evolution !== undefined) {
        for (let animation of this.animationsPossibility[this.growth]
          .evolution) {
          time += animation.time;
        }

        await this.updateAnimatedSprite({
          animations: this.animationsPossibility[this.growth].evolution,
          app: app,
        });
        this.animatedSprite.play();
        console.log("evolution animation", this.growth, time);
      }
      this.growth += 1;
      setTimeout(async () => {
        // calculate the time elapsed in ms from the current timestamp
        timeelapsedInMs = Date.now() - currentTimestamp;
        console.log("growth + 1", this.growth, timeelapsedInMs);
        console.log(
          "this.growth",
          this.animationsPossibility[this.growth].walk
        );
        if (this.eatingFood.length > 0) {
          await this.updateAnimatedSprite({
            animations: this.animationsPossibility[this.growth].eat,
            app: app,
          });
        } else {
          await this.updateAnimatedSprite({
            animations: this.animationsPossibility[this.growth].walk,
            app: app,
          });
        }
        this.moveDir = +1;
      }, time);
    }
  }

  public async feedPet({
    app,
    x,
    y,
  }: {
    app: PIXI.Application;
    x: number;
    y: number;
  }) {
    let food = await FoodClass.create({
      displayName: "tomato",
      xpValue: 1,
      foodType: FoodList.tomato,
      app: app,
      x: x - 10,
      y: 0,
    });

    this.eatingFood.push(food);

    const growth = this.growth;
    if (this.state !== petState.eat) {
      this.updateAnimatedSprite({
        animations: this.animationsPossibility[growth].eat,
        app,
      });
    }

    const foodAnimation = async (delta: number) => {
      // make a smooth animation for the food

      food.foodSprite.y += 3 * delta;
      if (
        food.foodSprite.y >=
        app.renderer.height - this.animatedSprite.height
      ) {
        food.removeFoodFromStage({ app: app });
        // remove the first element from the array eatingFood
        this.eatingFood.shift();
        if (this.eatingFood.length === 0) {
          this.state = petState.walk;
          const growth = this.growth;
          this.updateAnimatedSprite({
            animations: this.animationsPossibility[growth].walk,
            app,
          });
        }
        if (this.growth === IPetGrowth.old) {
          this.xpBarContainer.width = 0;
          this.xpBarFill.width = 0;
        } else {
          this.xp += food.xpValue;
          // fill the xp bar with green color based on the xp value full xp bar is 1000 the size of the bar is 100
          if (
            this.xp <= this.animationsPossibility[IPetGrowth.egg].xpToLevelUp
          ) {
            this.xpBarFill.width =
              (this.xp * this.xpBarContainer.width) /
              this.animationsPossibility[growth].xpToLevelUp;
          } else {
            // get the grotwth preceding the current growth
            let lastGrowth: IPetGrowth = this.growth - 1;
            console.log("xp", lastGrowth, this.xp);
            const xp =
              this.xp - this.animationsPossibility[lastGrowth].xpToLevelUp;
            this.xpBarFill.width =
              (xp * this.xpBarContainer.width) /
              (this.animationsPossibility[growth].xpToLevelUp -
                this.animationsPossibility[lastGrowth].xpToLevelUp);
          }
          if (this.xp == this.animationsPossibility[growth].xpToLevelUp) {
            this.xpBarFill.width = 0;
            this.nextGrowth({ app: app });
          }
        }
        app.ticker.remove(foodAnimation);
      }
    };

    // let the food sprite faldown from top to bottom
    // when the food hit the pet sprite, the food will be removed from the stage
    // and the pet will eat the food
    app.ticker.add(foodAnimation);
    this.state = petState.eat;
  }

  public static async create(pet: IPet): Promise<PetClass> {
    // Perform asynchronous operations
    const animatedSprite: PIXI.AnimatedSprite = await this.createAnimatedSprite(
      {
        animations: tamagotchiJson.egg.walk.animation,
      }
    );

    const petClass = new PetClass({
      state: pet.state,
      elapsed: pet.elapsed,
      moveDir: pet.moveDir,
      eachKeyCountBeforeEat: pet.eachKeyCountBeforeEat,
      growth: pet.growth,
      animatedSprite: animatedSprite,
      xp: 0,
      xpBarContainer: new PIXI.Graphics(),
      xpBarFill: new PIXI.Graphics(),
    });

    petClass.animatedSprite = await this.createAnimatedSprite({
      animations: petClass.animationsPossibility[pet.growth].walk,
    });

    const xpBarWidth = 50;

    // add xp bar on top of the animated sprite
    petClass.xpBarContainer.beginFill(0x000000);
    petClass.xpBarContainer.drawRect(0, 0, xpBarWidth, 3);
    petClass.xpBarContainer.endFill();
    // set xp bar in the middle of the animated sprite
    petClass.xpBarContainer.x =
      petClass.animatedSprite.width / 2 - xpBarWidth / 2;
    // bar is on top of the animated sprite
    petClass.xpBarContainer.y = -10;
    petClass.animatedSprite.addChild(
      petClass.xpBarContainer as PIXI.DisplayObject
    );
    // fill the xp bar with green color based on the xp value
    petClass.xpBarFill.beginFill(0x00ff00);
    petClass.xpBarFill.drawRect(0, 0, xpBarWidth, 3);
    petClass.xpBarFill.endFill();
    petClass.xpBarFill.x = petClass.animatedSprite.width / 2 - xpBarWidth / 2;
    petClass.xpBarFill.y = -10;
    petClass.xpBarFill.width = 0;
    petClass.animatedSprite.addChild(petClass.xpBarFill as PIXI.DisplayObject);

    // Create and return an instance of PetClass
    return new PetClass(petClass);
  }

  public petState = {
    walk: 0,
    eat: 1,
    sleep: 2,
    play: 3,
    idle: 4,
    dead: 5,
  };
  public petGrowth = {
    egg: 0,
    baby: 1,
    child: 2,
    teen: 3,
    adult: 4,
    old: 5,
  };
  // for each petGrowth enum there is a different set of animations
  public animationsPossibility: AnimationPossibilityObject = {
    [this.petGrowth.egg]: {
      walk: tamagotchiJson.egg.walk.animation,
      eat: tamagotchiJson.egg.eat.animation,
      evolution: tamagotchiJson.egg.evolution.animation,
      xpToLevelUp: 10,
    },
    [this.petGrowth.baby]: {
      walk: tamagotchiJson.baby.walk.animation,
      eat: tamagotchiJson.baby.eat.animation,
      xpToLevelUp: 20,
    },
    [this.petGrowth.child]: {
      walk: tamagotchiJson.child.walk.animation,
      eat: tamagotchiJson.child.eat.animation,
      xpToLevelUp: 30,
    },
    [this.petGrowth.teen]: {
      walk: tamagotchiJson.teen.walk.animation,
      eat: tamagotchiJson.teen.eat.animation,
      xpToLevelUp: 40,
    },
    [this.petGrowth.adult]: {
      walk: tamagotchiJson.teen.walk.animation,
      eat: tamagotchiJson.teen.eat.animation,
      xpToLevelUp: 50,
    },
    [this.petGrowth.old]: {
      walk: tamagotchiJson.teen.walk.animation,
      eat: tamagotchiJson.teen.eat.animation,
      xpToLevelUp: 60,
    },
  };

  public static async createAnimatedSprite({
    animations,
  }: {
    animations: IAnimation[];
  }): Promise<PIXI.AnimatedSprite> {
    const textureArray: {
      texture: PIXI.Texture<PIXI.Resource>;
      time: number;
    }[] = [];
    for (let animation of animations) {
      const textLoaded = await PIXI.Assets.load(tamagotchiImages);
      let frame = await new PIXI.Rectangle(
        animation.x,
        animation.y,
        animation.width,
        animation.height
      );
      let text = new PIXI.Texture(textLoaded.baseTexture, frame);
      textureArray.push({ texture: text, time: animation.time });
    }

    const animatedSprite = await new PIXI.AnimatedSprite(textureArray);

    // add animation to the stage and play them one after another controll the speed
    animatedSprite.animationSpeed = 1;
    animatedSprite.play();
    // animatedSprite.onLoop = () => {
    //     console.log('loop', animatedSprite.currentFrame, textureArray);
    // };

    return animatedSprite;
  }
}
