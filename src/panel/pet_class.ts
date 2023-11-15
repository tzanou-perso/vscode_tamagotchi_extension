import * as tamagotchiJson from "../media/images/pets/tamagotchi/tamagotchi.json";
import tamagotchiImages from "../media/images/pets/tamagotchi/tamagotchi.png";
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
  public petSpeed: number = 0.3 + Math.random() * 2;
  public isFallen: boolean = false;
  public petVersion: number = Math.floor(Math.random() * 2);
  // public petVersion: number = 1;

  //give a random speed to the pet beetwen 0.3 and 1

  public tickAnimPet({ app, delta }: { app: PIXI.Application; delta: number }) {
    if (this.state === petState.walk && this.growth != IPetGrowth.egg) {
      this.elapsed += delta;
      this.moveAnimatedSprite({
        app: app,
      });
      this.elapsed = this.elapsed;
      this.moveDir = this.moveDir;
    } else {
      this.elapsed = this.animatedSprite.x / this.petSpeed;
    }
  }

  public moveAnimatedSprite({ app }: { app: PIXI.Application }) {
    if (this.growth === IPetGrowth.old) {
      if (this.moveDir === +1) {
        this.animatedSprite.scale.x = 1;
        this.animatedSprite.x = Math.floor(
          (this.elapsed * this.petSpeed) % app.renderer.width
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
          app.renderer.width -
            ((this.elapsed * this.petSpeed) % app.renderer.width)
        );
        if (this.animatedSprite.x === 0 + this.animatedSprite.width) {
          this.moveDir = +1;
          this.elapsed = 0.0;
        }
      }
    }
    if (this.growth !== IPetGrowth.old && this.growth > -1) {
      // set the pet in the middle of the screen in y and x position
      this.animatedSprite.anchor.y = 0.5;
      this.animatedSprite.x =
        app.renderer.width / 2 - this.animatedSprite.width / 2;
      this.animatedSprite.y =
        app.renderer.height / 2 - this.animatedSprite.height / 2 - 5;
    }
    if (
      this.growth === IPetGrowth.old &&
      this.animatedSprite.y <
        app.renderer.height - this.animatedSprite.height / 2
    ) {
      this.isFallen = true;
      // let fall slowlly the pet from his current position to the bottom of the screen
      this.animatedSprite.y += 3;
      this.animatedSprite.scale.set(1, 1);
    } else {
      this.isFallen = false;
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
      let frame = new PIXI.Rectangle(
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

        this.updateAnimatedSprite({
          animations: this.animationsPossibility[this.growth].evolution,
          app: app,
        });
      }
      this.growth += 1;
      setTimeout(async () => {
        // calculate the time elapsed in ms from the current timestamp
        timeelapsedInMs = Date.now() - currentTimestamp;
        if (this.eatingFood.length > 0) {
          await this.updateAnimatedSprite({
            animations: this.animationsPossibility[this.growth].eat,
            app: app,
          });
        } else {
          if (this.growth === IPetGrowth.old) {
            await this.updateAnimatedSprite({
              animations: this.animationsPossibility[this.growth].walk,
              app: app,
            });
            this.animatedSprite.scale.set(1, 1);
          } else {
            await this.updateAnimatedSprite({
              animations: this.animationsPossibility[this.growth].idle,
              app: app,
            });
          }
        }
        this.animatedSprite.anchor.y = 0.5;
        this.animatedSprite.x =
          (app.view.width - this.animatedSprite.width) / 2;
        if (!this.isFallen)
          this.animatedSprite.y =
            app.view.height / 2 - this.animatedSprite.height / 2 - 5;
        this.moveDir = +1;
      }, time);
    }
  }

  public async feedPet({
    app,
    x,
    y,
    speed,
  }: {
    app: PIXI.Application;
    x: number;
    y: number;
    speed: number;
  }) {
    let food = await FoodClass.create({
      displayName: "tomato",
      xpValue: 1,
      foodType: FoodList.tomato,
      app: app,
      x: x - 10,
      y: 0,
    });
    const growth = this.growth;
    if (this.growth === IPetGrowth.old) {
      this.xpBarContainer.width = 0;
      this.xpBarFill.width = 0;
    } else {
      this.xp += food.xpValue;
      if (this.xp <= this.animationsPossibility[IPetGrowth.egg].xpToLevelUp) {
        this.xpBarFill.width =
          (this.xp * this.xpBarContainer.width) /
          this.animationsPossibility[growth].xpToLevelUp;
      } else {
        // get the grotwth preceding the current growth
        let lastGrowth: IPetGrowth =
          this.growth == 0 ? this.growth : this.growth - 1;
        const xp = this.xp - this.animationsPossibility[lastGrowth].xpToLevelUp;
        this.xpBarFill.width =
          (xp * this.xpBarContainer.width) /
          (this.animationsPossibility[growth].xpToLevelUp -
            this.animationsPossibility[lastGrowth].xpToLevelUp);
      }
      if (this.xp === this.animationsPossibility[growth].xpToLevelUp) {
        this.xpBarFill.width = 0;
        this.nextGrowth({ app: app });
      }
    }

    if (this.growth === IPetGrowth.old) {
      this.xpBarContainer.width = 0;
      this.xpBarFill.width = 0;
    }

    this.eatingFood.push(food);

    if (this.state !== petState.eat) {
      await this.updateAnimatedSprite({
        animations: this.animationsPossibility[growth].eat,
        app,
      });
    }

    const foodAnimation = async (delta: number) => {
      // make a smooth animation for the food

      food.foodSprite.y += speed * delta;
      if (
        food.foodSprite.y >=
        app.renderer.height / 2 - this.animatedSprite.height / 2
      ) {
        food.removeFoodFromStage({ app: app });
        // remove the first element from the array eatingFood
        this.eatingFood.shift();
        if (this.eatingFood.length === 0) {
          if (this.growth === IPetGrowth.old) {
            this.state = petState.walk;
          } else {
            this.state = petState.idle;
          }
          const growth = this.growth;
          if (this.growth === IPetGrowth.old) {
            this.updateAnimatedSprite({
              animations: this.animationsPossibility[growth].walk,
              app,
            });
          } else {
            this.updateAnimatedSprite({
              animations: this.animationsPossibility[growth].idle,
              app,
            });
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
        animations: tamagotchiJson["1"].egg.walk.animation,
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
    petClass.xpBarContainer.y = -petClass.animatedSprite.height / 2 - 10;
    petClass.animatedSprite.addChild(
      petClass.xpBarContainer as PIXI.DisplayObject
    );
    // fill the xp bar with green color based on the xp value
    petClass.xpBarFill.beginFill(0x00ff00);
    petClass.xpBarFill.drawRect(0, 0, xpBarWidth, 3);
    petClass.xpBarFill.endFill();
    petClass.xpBarFill.x = petClass.animatedSprite.width / 2 - xpBarWidth / 2;
    petClass.xpBarFill.y = -petClass.animatedSprite.height / 2 - 10;
    petClass.xpBarFill.width = 0;
    petClass.animatedSprite.addChild(petClass.xpBarFill as PIXI.DisplayObject);
    petClass.animatedSprite.anchor.y = 0.5;

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
      walk:
        this.petVersion === 0
          ? tamagotchiJson["0"].egg.walk.animation
          : tamagotchiJson["1"].egg.walk.animation,
      eat:
        this.petVersion === 0
          ? tamagotchiJson["0"].egg.eat.animation
          : tamagotchiJson["1"].egg.eat.animation,
      idle:
        this.petVersion === 0
          ? tamagotchiJson["0"].egg.idle.animation
          : tamagotchiJson["1"].egg.idle.animation,
      evolution:
        this.petVersion === 0
          ? tamagotchiJson["0"].egg.evolution.animation
          : tamagotchiJson["1"].egg.evolution.animation,
      xpToLevelUp: 10,
    },
    [this.petGrowth.baby]: {
      walk:
        this.petVersion === 0
          ? tamagotchiJson["0"].baby.walk.animation
          : tamagotchiJson["1"].baby.walk.animation,
      eat:
        this.petVersion === 0
          ? tamagotchiJson["0"].baby.eat.animation
          : tamagotchiJson["1"].baby.eat.animation,
      idle:
        this.petVersion === 0
          ? tamagotchiJson["0"].baby.idle.animation
          : tamagotchiJson["1"].baby.idle.animation,
      xpToLevelUp: 20,
    },
    [this.petGrowth.child]: {
      walk:
        this.petVersion === 0
          ? tamagotchiJson["0"].child.walk.animation
          : tamagotchiJson["1"].child.walk.animation,
      eat:
        this.petVersion === 0
          ? tamagotchiJson["0"].child.eat.animation
          : tamagotchiJson["1"].child.eat.animation,
      idle:
        this.petVersion === 0
          ? tamagotchiJson["0"].child.idle.animation
          : tamagotchiJson["1"].child.idle.animation,
      xpToLevelUp: 30,
    },
    [this.petGrowth.teen]: {
      walk:
        this.petVersion === 0
          ? tamagotchiJson["0"].teen.walk.animation
          : tamagotchiJson["1"].teen.walk.animation,
      eat:
        this.petVersion === 0
          ? tamagotchiJson["0"].teen.eat.animation
          : tamagotchiJson["1"].teen.eat.animation,
      idle:
        this.petVersion === 0
          ? tamagotchiJson["0"].teen.idle.animation
          : tamagotchiJson["1"].teen.idle.animation,
      xpToLevelUp: 40,
    },
    [this.petGrowth.adult]: {
      walk:
        this.petVersion === 0
          ? tamagotchiJson["0"].adult.walk.animation
          : tamagotchiJson["1"].adult.walk.animation,
      eat:
        this.petVersion === 0
          ? tamagotchiJson["0"].adult.eat.animation
          : tamagotchiJson["1"].adult.eat.animation,
      idle:
        this.petVersion === 0
          ? tamagotchiJson["0"].adult.idle.animation
          : tamagotchiJson["1"].adult.idle.animation,
      xpToLevelUp: 50,
    },
    [this.petGrowth.old]: {
      walk:
        this.petVersion === 0
          ? tamagotchiJson["0"].old.walk.animation
          : tamagotchiJson["1"].old.walk.animation,
      eat:
        this.petVersion === 0
          ? tamagotchiJson["0"].old.eat.animation
          : tamagotchiJson["1"].old.eat.animation,
      idle:
        this.petVersion === 0
          ? tamagotchiJson["0"].old.idle.animation
          : tamagotchiJson["1"].old.idle.animation,
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

    return animatedSprite;
  }
}
