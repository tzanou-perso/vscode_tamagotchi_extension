import * as PIXI from "pixi.js";
import foodSheet from "../../media/images/foods/Food.png";
import { type } from "os";

export enum FoodList {
  tomato = "tomato",
}

type FoodPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type FoodType = {
  [key in FoodList]?: FoodPosition;
};
export type FoodClassType = {
  displayName: string;
  xpValue: number;
  type: FoodList;
};
export default class FoodClass {
  public displayName: string;
  public xpValue: number;
  public type: FoodList;
  public foodSprite: PIXI.DisplayObject;

  constructor(food: FoodClassType) {
    this.displayName = food.displayName;
    this.xpValue = food.xpValue;
    this.type = food.type;
    this.foodSprite = new PIXI.Sprite() as PIXI.DisplayObject;
  }

  public async addFoodToStage({
    app,
    x,
    y,
  }: {
    app: PIXI.Application<PIXI.ICanvas>;
    x: number;
    y: number;
  }) {
    const foodSheetLoaded = await PIXI.Assets.load(foodSheet);
    // const foodSheetTexture = PIXI.Texture.from(foodSheetLoaded.baseTexture);
    let foodPosition = this._foodList[this.type];
    if (foodPosition !== undefined) {
      let foodSpriteRect = new PIXI.Rectangle(
        foodPosition.x,
        foodPosition.y,
        foodPosition.width,
        foodPosition.height
      );
      let foodText = new PIXI.Texture(
        foodSheetLoaded.baseTexture,
        foodSpriteRect
      );
      let foodSprite = new PIXI.Sprite(foodText);

      foodSprite.texture.frame = foodSpriteRect;
      foodSprite.x = x;
      foodSprite.y = y;
      this.foodSprite = foodSprite as PIXI.DisplayObject;
      app.stage.addChild(this.foodSprite);
      return this.foodSprite;
    }
  }

  private _tomatoPosition: FoodPosition = {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
  };

  private _foodList: FoodType = {
    tomato: this._tomatoPosition,
  };

  public async removeFoodFromStage({ app }: { app: PIXI.Application }) {
    // console.log("removeFoodFromStage", app, app.stage);
    let t: PIXI.DisplayObject;
    return app.stage.removeChild(this.foodSprite as PIXI.DisplayObject);
  }

  public static async create({
    app,
    foodType,
    displayName,
    xpValue,
    x,
    y,
  }: {
    app: PIXI.Application<PIXI.ICanvas>;
    foodType: FoodList;
    displayName: string;
    xpValue: number;
    x: number;
    y: number;
  }) {
    let food = new FoodClass({
      displayName: displayName,
      xpValue: xpValue,
      type: foodType,
    });
    await food.addFoodToStage({ app, x, y });
    food.foodSprite.scale.set(0.5);
    return food;
  }
}
