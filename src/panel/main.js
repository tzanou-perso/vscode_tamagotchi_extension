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
const PIXI = __importStar(require("pixi.js"));
const full_png_1 = __importDefault(require("../../media/images/background/first/full.png"));
const platform_png_1 = __importDefault(require("../../media/images/background/first/platform.png"));
const pet_class_1 = __importDefault(require("./pet_class"));
const pet_class_2 = require("./pet_class");
console.log("main.js loaded");
let filesSaved = [];
let activeFile = {
    numberOfCharacters: 0,
    fileId: "",
    pets: [],
    keystrokeCount: 0,
};
let isInFeed = false;
const basicText = new PIXI.Text("code typed: " + activeFile.keystrokeCount);
basicText.x = 10;
basicText.y = 10;
basicText.style = new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 18,
    fontFamily: "Arial",
    stroke: 0x000000,
    strokeThickness: 4,
    wordWrap: true,
    wordWrapWidth: 440,
});
setTimeout(async () => {
    let backgroundCoverTop;
    let backgroundCoverBottom;
    let backgroundCoverFull;
    let platformSpriteInited;
    let app;
    const initApp = async () => {
        // background color same as theme background color
        app = new PIXI.Application({
            backgroundColor: 0x1e1e1e,
            width: window.innerWidth - 50,
            height: window.innerHeight - 50,
        });
        const tamagotchiMoveTicker = app.ticker;
        const line = new PIXI.Graphics();
        //line color
        line.lineStyle(4, 0x00ccffff, 0.1);
        line.moveTo(0, app.renderer.height / 2);
        line.lineTo(app.renderer.width, app.renderer.height / 2);
        // app.stage.addChild(line as PIXI.DisplayObject);
        // clear document body
        document.body.innerHTML = "";
        // Adding the application's view to the DOM
        document.body.appendChild(app.view);
        await setBackgroundImage();
        // on window resize, resize the canvas too
        window.addEventListener("resize", async () => {
            // app.stage.removeChild(backgroundCoverTop.container);
            // app.stage.removeChild(backgroundCoverBottom.container);
            app.stage.removeChild(backgroundCoverFull.container);
            app.stage.removeChild(platformSpriteInited);
            app.renderer.resize(window.innerWidth - 50, window.innerHeight - 50);
            await setBackgroundImage();
            // move line to middle of screen
            line.clear();
            line.lineStyle(4, 0x00ccffff, 1);
            line.moveTo(0, app.renderer.height / 2);
            line.lineTo(app.renderer.width, app.renderer.height / 2);
            // app.stage.addChild(line as PIXI.DisplayObject);
            // set all pets y to bottom of screen
            for (let pet of activeFile.pets) {
                if (pet.growth === pet_class_2.IPetGrowth.old) {
                    pet.animatedSprite.y =
                        app.renderer.height - pet.animatedSprite.height / 2;
                }
                else {
                    pet.animatedSprite.x =
                        (app.renderer.width - pet.animatedSprite.width) / 2;
                    pet.animatedSprite.y =
                        app.renderer.height / 2 - pet.animatedSprite.height / 2 - 5;
                }
            }
        });
        // Add a variable to count up the seconds our demo has been running
        let elapsed = 0.0;
        // Tell our application's ticker to run a new callback every frame, passing
        // in the amount of time that has passed since the last tick
        app.stage.addChild(basicText);
        // add line to middle of screen wich have 100% width
        tamagotchiMoveTicker.add((delta) => {
            // Add the time to our total elapsed time
            elapsed += delta;
            for (let pet of activeFile.pets) {
                pet.tickAnimPet({ app, delta });
            }
            // Update the sprite's to let him walk across the screen horizontally
            // from left to right if he is not at the right side of the screen
        });
    };
    let setBackgroundImage = async () => {
        // const backgroundSpriteTop = await PIXI.Assets.load(backgroundImageTop);
        // const containerSize = {
        //   x: app.renderer.width,
        //   y: app.renderer.height / 2,
        // };
        // backgroundCoverTop = background(
        //   containerSize,
        //   new PIXI.Sprite(backgroundSpriteTop),
        //   "cover"
        // );
        // app.stage.addChildAt(backgroundCoverTop.container, 0);
        // backgroundCoverTop.container.alpha = 0.3;
        // const backgroundSpriteBottom = await PIXI.Assets.load(
        //   backgroundImageBottom
        // );
        // const containerSizeBottom = {
        //   x: app.renderer.width,
        //   y: app.renderer.height / 2,
        // };
        // backgroundCoverBottom = background(
        //   containerSizeBottom,
        //   new PIXI.Sprite(backgroundSpriteBottom),
        //   "cover"
        // );
        // app.stage.addChildAt(backgroundCoverBottom.container, 0);
        // backgroundCoverBottom.container.y = app.renderer.height / 2;
        // backgroundCoverBottom.container.alpha = 1;
        // add platform to center of screen in width and height
        const backgroundSpriteFull = await PIXI.Assets.load(full_png_1.default);
        const containerSize = {
            x: app.renderer.width,
            y: app.renderer.height,
        };
        backgroundCoverFull = background(containerSize, new PIXI.Sprite(backgroundSpriteFull), "coverFromBottom");
        app.stage.addChildAt(backgroundCoverFull.container, 0);
        backgroundCoverFull.container.alpha = 1;
        const platformSprite = await PIXI.Assets.load(platform_png_1.default);
        platformSpriteInited = new PIXI.Sprite(platformSprite);
        platformSpriteInited.width =
            app.renderer.width / 3 <= 180 ? 180 : app.renderer.width / 3;
        // keep ratio for height with the new width
        platformSpriteInited.height =
            (platformSpriteInited.height * platformSpriteInited.width) /
                platformSprite.width;
        platformSpriteInited.anchor.set(0, -0.5);
        app.stage.addChildAt(platformSpriteInited, 1);
        platformSpriteInited.x =
            (app.renderer.width - platformSpriteInited.width) / 2;
        platformSpriteInited.y =
            app.renderer.height / 2 - platformSpriteInited.height / 2 - 20;
    };
    const saveFile = ({ file }) => {
        if (filesSaved.filter((fileToFilter) => fileToFilter.fileId === file.fileId)
            .length === 0) {
            filesSaved.push(file);
        }
        else {
            filesSaved = filesSaved.map((file) => {
                if (file.fileId === file.fileId) {
                    return file;
                }
                return file;
            });
        }
    };
    const feedPet = async ({ newCharacterCount, timebetweenFeed, appHeight, appWidth, offsetX = 0, animationSpeed = 6, }) => {
        if (newCharacterCount > 0) {
            isInFeed = true;
        }
        for (let i = 0; i < newCharacterCount; i++) {
            // stop the for loop if event with name newWindowOpened is received
            setTimeout(async () => {
                const isThereNotAnyPetToFeed = activeFile.pets.every((pet) => pet.growth === pet_class_2.IPetGrowth.old) ||
                    activeFile.pets.length === 0 ||
                    (activeFile.pets.length === 1 &&
                        activeFile.pets[0].growth === pet_class_2.IPetGrowth.old);
                if (isThereNotAnyPetToFeed) {
                    let newPet = await pet_class_1.default.create({
                        state: pet_class_2.petState.idle,
                        elapsed: 0.0,
                        moveDir: 0,
                        eachKeyCountBeforeEat: 1,
                        growth: pet_class_2.IPetGrowth.egg,
                    });
                    activeFile.pets.push(newPet);
                    // add activeFiles in savedFiles id not already there
                    // else upate it
                    if (app !== undefined)
                        app.stage.addChild(newPet.animatedSprite);
                    newPet.animatedSprite.scale.set(2, 2);
                    // y in middle of screen
                    activeFile.pets[activeFile.pets.length - 1].animatedSprite.y =
                        app.renderer.height / 2 -
                            activeFile.pets[activeFile.pets.length - 1].animatedSprite.height /
                                2 -
                            5;
                    // set pet to center of screen
                    activeFile.pets[activeFile.pets.length - 1].animatedSprite.x =
                        (appWidth -
                            activeFile.pets[activeFile.pets.length - 2].animatedSprite
                                .width) /
                            2 +
                            offsetX;
                    saveFile({ file: activeFile });
                }
                for (let pet of activeFile.pets) {
                    if (activeFile.keystrokeCount % pet.eachKeyCountBeforeEat === 0 &&
                        pet.growth !== pet_class_2.IPetGrowth.old) {
                        await pet.feedPet({
                            app,
                            x: pet.animatedSprite.x,
                            y: pet.animatedSprite.y - 10,
                            speed: animationSpeed,
                        });
                    }
                    // if any pet is old and closer than 10px of an other pet set this pet x to 10px of the other pet
                }
                if (i === newCharacterCount - 1) {
                    isInFeed = false;
                    let index = 0;
                }
            }, timebetweenFeed * i);
            // if last iteration, save file
        }
    };
    window.addEventListener("message", async (event) => {
        console.log("event received", event.data); // Outputs: Hello, world!
        if (event.data.stroke !== undefined) {
            do {
                await new Promise((resolve) => setTimeout(resolve, 100));
            } while (isInFeed);
            const newCharacterCount = event.data.stroke - activeFile.keystrokeCount;
            activeFile.keystrokeCount = event.data.stroke;
            basicText.text = `code typed: ${activeFile.keystrokeCount}`;
            // if keystrokeCount is in ten multiple
            let timebetweenFeed = 200;
            let animationSpeed = 3;
            if (newCharacterCount > 1) {
                timebetweenFeed = 0.01;
                animationSpeed = 500;
            }
            if (newCharacterCount < 1)
                return;
            feedPet({
                newCharacterCount,
                timebetweenFeed,
                file: activeFile,
                appHeight: app.renderer.height,
                appWidth: app.renderer.width,
                animationSpeed: 3,
            });
        }
        if (event.data.fileOpened !== undefined &&
            event.data.fileOpened.fileId !== undefined) {
            do {
                await new Promise((resolve) => setTimeout(resolve, 100));
            } while (isInFeed);
            if (event.data.backgroundColor !== undefined) {
                // set app background color
                app.renderer.background.color = event.data.backgroundColor;
            }
            if (app !== undefined) {
                app.stage.removeChildren();
                app.destroy();
            }
            initApp();
            basicText.text = `code typed: ${event.data.fileOpened.numberOfCharacters}`;
            // remove all pets
            activeFile.pets.forEach((pet) => {
                app.stage.removeChild(pet.animatedSprite);
            });
            // if file already opened, do nothing
            if (filesSaved.filter((file) => file.fileId === event.data.fileOpened.fileId).length > 0) {
                // get file from savedFiles
                const fileFromSaved = filesSaved.filter((file) => file.fileId === event.data.fileOpened.fileId)[0];
                // if any pet of activeFile eatingFood array is not empty remove the activeFile from savedFiles
                if (fileFromSaved.pets.filter((pet) => pet.eatingFood.length > 0)
                    .length === 0) {
                    activeFile = filesSaved.filter((file) => file.fileId === event.data.fileOpened.fileId)[0];
                    activeFile.pets.forEach((pet) => {
                        app.stage.addChild(pet.animatedSprite);
                        if (pet.growth === pet_class_2.IPetGrowth.old) {
                            pet.animatedSprite.y =
                                app.renderer.height - pet.animatedSprite.height / 2;
                        }
                        else {
                            pet.animatedSprite.y =
                                app.renderer.height / 2 -
                                    activeFile.pets[0].animatedSprite.height / 2;
                        }
                        // set pet to center of screen
                        pet.animatedSprite.x =
                            (app.renderer.width - pet.animatedSprite.width) / 2;
                    });
                    return;
                }
                else {
                    // remove file from savedFiles
                    filesSaved = filesSaved.filter((file) => file.fileId !== event.data.fileOpened.fileId);
                }
            }
            activeFile = {
                numberOfCharacters: event.data.fileOpened.numberOfCharacters,
                fileId: event.data.fileOpened.fileId,
                pets: [],
                keystrokeCount: event.data.fileOpened.numberOfCharacters,
            };
            let firstPet = await pet_class_1.default.create({
                state: pet_class_2.petState.idle,
                elapsed: 0.0,
                moveDir: 0,
                eachKeyCountBeforeEat: 1,
                growth: pet_class_2.IPetGrowth.egg,
            });
            app.stage.addChild(firstPet.animatedSprite);
            firstPet.animatedSprite.scale.set(2, 2);
            activeFile.pets.push(firstPet);
            saveFile({ file: activeFile });
            activeFile.pets[0].animatedSprite.y =
                app.renderer.height / 2 -
                    activeFile.pets[0].animatedSprite.height / 2 -
                    5;
            // set pet to center of screen
            activeFile.pets[0].animatedSprite.x =
                (app.renderer.width - activeFile.pets[0].animatedSprite.width) / 2;
            activeFile.pets[0].animatedSprite.play();
            let timebetweenFeed = 0.01;
            let animationSpeed = 500;
            feedPet({
                newCharacterCount: activeFile.keystrokeCount,
                timebetweenFeed,
                file: activeFile,
                appHeight: app.renderer.height,
                appWidth: app.renderer.width,
                animationSpeed,
            });
            app.stage.addChild(basicText);
        }
    });
    /*
     *  PixiJS Background Cover/Contain Script
     *   Returns object
     * . {
     *       container: PixiJS Container
     * .     doResize: Resize callback
     *   }
     *   ARGS:
     *   bgSize: Object with x and y representing the width and height of background. Example: {x:1280,y:720}
     *   inputSprite: Pixi Sprite containing a loaded image or other asset.  Make sure you preload assets into this sprite.
     *   type: String, either "cover" or "contain".
     *   forceSize: Optional object containing the width and height of the source sprite, example:  {x:1280,y:720}
     */
    function background(bgSize, inputSprite, type, forceSize = undefined) {
        var sprite = inputSprite;
        var bgContainer = new PIXI.Container();
        var mask = new PIXI.Graphics()
            .beginFill(0x8bc5ff)
            .drawRect(0, 0, bgSize.x, bgSize.y)
            .endFill();
        bgContainer.mask = mask;
        bgContainer.addChild(mask);
        bgContainer.addChild(sprite);
        function resize() {
            var sp = { x: sprite.width, y: sprite.height };
            if (forceSize)
                sp = forceSize;
            var winratio = bgSize.x / bgSize.y;
            var spratio = sp.x / sp.y;
            var scale = 1;
            var pos = new PIXI.Point(0, 0);
            if (type === "coverFromBottom") {
                if (winratio > spratio) {
                    scale = bgSize.x / sp.x;
                }
                else {
                    scale = bgSize.y / sp.y;
                    pos.x = (bgSize.x - sp.x * scale) / 2;
                }
                pos.y = bgSize.y - sp.y * scale; // Position sprite at the bottom of the screen
                // sprite.anchor.set(1, 1);
            }
            if (type === "cover") {
                if (type == "cover" ? winratio > spratio : winratio < spratio) {
                    //photo is wider than background
                    scale = bgSize.x / sp.x;
                    pos.y = -(sp.y * scale - bgSize.y) / 2;
                }
                else {
                    //photo is taller than background
                    scale = 1;
                    pos.x = -(sp.x * scale - bgSize.x) / 2;
                }
            }
            sprite.scale = new PIXI.Point(scale, scale);
            sprite.position = pos;
        }
        resize();
        const res = {
            container: bgContainer,
            doResize: resize,
        };
        return res;
    }
}, 0);
//# sourceMappingURL=main.js.map