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
exports.IPetGrowth = exports.petState = void 0;
const tamagotchiJson = __importStar(require("../../media/images/pets/tamagotchi/tamagotchi.json"));
const tamagotchi_png_1 = __importDefault(require("../../media/images/pets/tamagotchi/tamagotchi.png"));
const PIXI = __importStar(require("pixi.js"));
const foodClass_1 = require("./foodClass");
const foodClass_2 = __importDefault(require("./foodClass"));
var petState;
(function (petState) {
    petState[petState["walk"] = 0] = "walk";
    petState[petState["eat"] = 1] = "eat";
    petState[petState["sleep"] = 2] = "sleep";
    petState[petState["play"] = 3] = "play";
    petState[petState["idle"] = 4] = "idle";
    petState[petState["dead"] = 5] = "dead";
})(petState = exports.petState || (exports.petState = {}));
var IPetGrowth;
(function (IPetGrowth) {
    IPetGrowth[IPetGrowth["egg"] = 0] = "egg";
    IPetGrowth[IPetGrowth["baby"] = 1] = "baby";
    IPetGrowth[IPetGrowth["child"] = 2] = "child";
    IPetGrowth[IPetGrowth["teen"] = 3] = "teen";
    IPetGrowth[IPetGrowth["adult"] = 4] = "adult";
    IPetGrowth[IPetGrowth["old"] = 5] = "old";
})(IPetGrowth = exports.IPetGrowth || (exports.IPetGrowth = {}));
class PetClass {
    state;
    elapsed;
    moveDir;
    eachKeyCountBeforeEat;
    growth;
    animatedSprite;
    xp = 0;
    xpBarContainer;
    xpBarFill;
    constructor(pet) {
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
    eatingFood = [];
    petSpeed = 0.3 + Math.random() * 2;
    isFallen = false;
    petVersion = Math.floor(Math.random() * 2);
    // public petVersion: number = 1;
    //give a random speed to the pet beetwen 0.3 and 1
    tickAnimPet({ app, delta }) {
        if (this.state === petState.walk && this.growth != IPetGrowth.egg) {
            this.elapsed += delta;
            this.moveAnimatedSprite({
                app: app,
            });
            this.elapsed = this.elapsed;
            this.moveDir = this.moveDir;
        }
        else {
            this.elapsed = this.animatedSprite.x / this.petSpeed;
        }
    }
    moveAnimatedSprite({ app }) {
        if (this.growth === IPetGrowth.old) {
            if (this.moveDir === +1) {
                this.animatedSprite.scale.x = 1;
                this.animatedSprite.x = Math.floor((this.elapsed * this.petSpeed) % app.renderer.width);
                if (this.animatedSprite.x >=
                    app.renderer.width - this.animatedSprite.width) {
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
                this.animatedSprite.x = Math.floor(app.renderer.width -
                    ((this.elapsed * this.petSpeed) % app.renderer.width));
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
        if (this.growth === IPetGrowth.old &&
            this.animatedSprite.y <
                app.renderer.height - this.animatedSprite.height / 2) {
            this.isFallen = true;
            // let fall slowlly the pet from his current position to the bottom of the screen
            this.animatedSprite.y += 3;
            this.animatedSprite.scale.set(1, 1);
        }
        else {
            this.isFallen = false;
        }
    }
    async updateAnimatedSprite({ animations, app, }) {
        const textureArray = [];
        for (let animation of animations) {
            const textLoaded = await PIXI.Assets.load(tamagotchi_png_1.default);
            let frame = new PIXI.Rectangle(animation.x, animation.y, animation.width, animation.height);
            let text = new PIXI.Texture(textLoaded.baseTexture, frame);
            textureArray.push({ texture: text, time: animation.time });
        }
        this.animatedSprite.textures = textureArray;
        this.animatedSprite.play();
    }
    async nextGrowth({ app }) {
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
                }
                else {
                    if (this.growth === IPetGrowth.old) {
                        await this.updateAnimatedSprite({
                            animations: this.animationsPossibility[this.growth].walk,
                            app: app,
                        });
                        this.animatedSprite.scale.set(1, 1);
                    }
                    else {
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
    async feedPet({ app, x, y, speed, }) {
        let food = await foodClass_2.default.create({
            displayName: "tomato",
            xpValue: 1,
            foodType: foodClass_1.FoodList.tomato,
            app: app,
            x: x - 10,
            y: 0,
        });
        const growth = this.growth;
        if (this.growth === IPetGrowth.old) {
            this.xpBarContainer.width = 0;
            this.xpBarFill.width = 0;
        }
        else {
            this.xp += food.xpValue;
            if (this.xp <= this.animationsPossibility[IPetGrowth.egg].xpToLevelUp) {
                this.xpBarFill.width =
                    (this.xp * this.xpBarContainer.width) /
                        this.animationsPossibility[growth].xpToLevelUp;
            }
            else {
                // get the grotwth preceding the current growth
                let lastGrowth = this.growth == 0 ? this.growth : this.growth - 1;
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
        const foodAnimation = async (delta) => {
            // make a smooth animation for the food
            food.foodSprite.y += speed * delta;
            if (food.foodSprite.y >=
                app.renderer.height / 2 - this.animatedSprite.height / 2) {
                food.removeFoodFromStage({ app: app });
                // remove the first element from the array eatingFood
                this.eatingFood.shift();
                if (this.eatingFood.length === 0) {
                    if (this.growth === IPetGrowth.old) {
                        this.state = petState.walk;
                    }
                    else {
                        this.state = petState.idle;
                    }
                    const growth = this.growth;
                    if (this.growth === IPetGrowth.old) {
                        this.updateAnimatedSprite({
                            animations: this.animationsPossibility[growth].walk,
                            app,
                        });
                    }
                    else {
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
    static async create(pet) {
        // Perform asynchronous operations
        const animatedSprite = await this.createAnimatedSprite({
            animations: tamagotchiJson["1"].egg.walk.animation,
        });
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
        petClass.animatedSprite.addChild(petClass.xpBarContainer);
        // fill the xp bar with green color based on the xp value
        petClass.xpBarFill.beginFill(0x00ff00);
        petClass.xpBarFill.drawRect(0, 0, xpBarWidth, 3);
        petClass.xpBarFill.endFill();
        petClass.xpBarFill.x = petClass.animatedSprite.width / 2 - xpBarWidth / 2;
        petClass.xpBarFill.y = -petClass.animatedSprite.height / 2 - 10;
        petClass.xpBarFill.width = 0;
        petClass.animatedSprite.addChild(petClass.xpBarFill);
        petClass.animatedSprite.anchor.y = 0.5;
        // Create and return an instance of PetClass
        return new PetClass(petClass);
    }
    petState = {
        walk: 0,
        eat: 1,
        sleep: 2,
        play: 3,
        idle: 4,
        dead: 5,
    };
    petGrowth = {
        egg: 0,
        baby: 1,
        child: 2,
        teen: 3,
        adult: 4,
        old: 5,
    };
    // for each petGrowth enum there is a different set of animations
    animationsPossibility = {
        [this.petGrowth.egg]: {
            walk: this.petVersion === 0
                ? tamagotchiJson["0"].egg.walk.animation
                : tamagotchiJson["1"].egg.walk.animation,
            eat: this.petVersion === 0
                ? tamagotchiJson["0"].egg.eat.animation
                : tamagotchiJson["1"].egg.eat.animation,
            idle: this.petVersion === 0
                ? tamagotchiJson["0"].egg.idle.animation
                : tamagotchiJson["1"].egg.idle.animation,
            evolution: this.petVersion === 0
                ? tamagotchiJson["0"].egg.evolution.animation
                : tamagotchiJson["1"].egg.evolution.animation,
            xpToLevelUp: 10,
        },
        [this.petGrowth.baby]: {
            walk: this.petVersion === 0
                ? tamagotchiJson["0"].baby.walk.animation
                : tamagotchiJson["1"].baby.walk.animation,
            eat: this.petVersion === 0
                ? tamagotchiJson["0"].baby.eat.animation
                : tamagotchiJson["1"].baby.eat.animation,
            idle: this.petVersion === 0
                ? tamagotchiJson["0"].baby.idle.animation
                : tamagotchiJson["1"].baby.idle.animation,
            xpToLevelUp: 20,
        },
        [this.petGrowth.child]: {
            walk: this.petVersion === 0
                ? tamagotchiJson["0"].child.walk.animation
                : tamagotchiJson["1"].child.walk.animation,
            eat: this.petVersion === 0
                ? tamagotchiJson["0"].child.eat.animation
                : tamagotchiJson["1"].child.eat.animation,
            idle: this.petVersion === 0
                ? tamagotchiJson["0"].child.idle.animation
                : tamagotchiJson["1"].child.idle.animation,
            xpToLevelUp: 30,
        },
        [this.petGrowth.teen]: {
            walk: this.petVersion === 0
                ? tamagotchiJson["0"].teen.walk.animation
                : tamagotchiJson["1"].teen.walk.animation,
            eat: this.petVersion === 0
                ? tamagotchiJson["0"].teen.eat.animation
                : tamagotchiJson["1"].teen.eat.animation,
            idle: this.petVersion === 0
                ? tamagotchiJson["0"].teen.idle.animation
                : tamagotchiJson["1"].teen.idle.animation,
            xpToLevelUp: 40,
        },
        [this.petGrowth.adult]: {
            walk: this.petVersion === 0
                ? tamagotchiJson["0"].adult.walk.animation
                : tamagotchiJson["1"].adult.walk.animation,
            eat: this.petVersion === 0
                ? tamagotchiJson["0"].adult.eat.animation
                : tamagotchiJson["1"].adult.eat.animation,
            idle: this.petVersion === 0
                ? tamagotchiJson["0"].adult.idle.animation
                : tamagotchiJson["1"].adult.idle.animation,
            xpToLevelUp: 50,
        },
        [this.petGrowth.old]: {
            walk: this.petVersion === 0
                ? tamagotchiJson["0"].old.walk.animation
                : tamagotchiJson["1"].old.walk.animation,
            eat: this.petVersion === 0
                ? tamagotchiJson["0"].old.eat.animation
                : tamagotchiJson["1"].old.eat.animation,
            idle: this.petVersion === 0
                ? tamagotchiJson["0"].old.idle.animation
                : tamagotchiJson["1"].old.idle.animation,
            xpToLevelUp: 60,
        },
    };
    static async createAnimatedSprite({ animations, }) {
        const textureArray = [];
        for (let animation of animations) {
            const textLoaded = await PIXI.Assets.load(tamagotchi_png_1.default);
            let frame = await new PIXI.Rectangle(animation.x, animation.y, animation.width, animation.height);
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
exports.default = PetClass;
//# sourceMappingURL=pet_class.js.map