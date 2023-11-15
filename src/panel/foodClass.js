"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodList = void 0;
const PIXI = __importStar(require("pixi.js"));
const Food_png_1 = __importDefault(require("../../media/images/foods/Food.png"));
var FoodList;
(function (FoodList) {
    FoodList["tomato"] = "tomato";
})(FoodList = exports.FoodList || (exports.FoodList = {}));
class FoodClass {
    displayName;
    xpValue;
    type;
    foodSprite;
    constructor(food) {
        this.displayName = food.displayName;
        this.xpValue = food.xpValue;
        this.type = food.type;
        this.foodSprite = new PIXI.Sprite();
    }
    async addFoodToStage({ app, x, y, }) {
        const foodSheetLoaded = await PIXI.Assets.load(Food_png_1.default);
        // const foodSheetTexture = PIXI.Texture.from(foodSheetLoaded.baseTexture);
        let foodPosition = this._foodList[this.type];
        if (foodPosition !== undefined) {
            let foodSpriteRect = new PIXI.Rectangle(foodPosition.x, foodPosition.y, foodPosition.width, foodPosition.height);
            let foodText = new PIXI.Texture(foodSheetLoaded.baseTexture, foodSpriteRect);
            let foodSprite = new PIXI.Sprite(foodText);
            foodSprite.texture.frame = foodSpriteRect;
            foodSprite.x = x;
            foodSprite.y = y;
            this.foodSprite = foodSprite;
            app.stage.addChild(this.foodSprite);
            return this.foodSprite;
        }
    }
    _tomatoPosition = {
        x: 0,
        y: 0,
        width: 32,
        height: 32,
    };
    _foodList = {
        tomato: this._tomatoPosition,
    };
    async removeFoodFromStage({ app }) {
        // console.log("removeFoodFromStage", app, app.stage);
        let t;
        return app.stage.removeChild(this.foodSprite);
    }
    static async create({ app, foodType, displayName, xpValue, x, y, }) {
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
exports.default = FoodClass;
//# sourceMappingURL=foodClass.js.map