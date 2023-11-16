import * as PIXI from "pixi.js";
import * as tamagotchiJson from "../../media/images/pets/tamagotchi/tamagotchi.json";
import backgroundImageTop from "../../media/images/background/first/top.png";
import backgroundImageBottom from "../../media/images/background/first/bottom.png";
import backgroundImageFull from "../../media/images/background/first/full.png";
import platformImage from "../../media/images/background/first/platform.png";
import PetClass from "./pet_class";
import { IPet, IPetGrowth, petState, IAnimation } from "./pet_class";
import { FoodList } from "./foodClass";
import { WebviewMessage } from "../types/types";
declare global {
  interface VscodeStateApi {
    postMessage(message: WebviewMessage): void;
  }
  const vscode: VscodeStateApi;
}

type FilesSaved = {
  numberOfCharacters: number;
  fileId: string;
  pets: PetClass[];
  keystrokeCount: number;
};

type BgCover = {
  container: PIXI.Container<PIXI.DisplayObject>;
  doResize: () => void;
};

console.log("main.js loaded");
let stateApi: VscodeStateApi;
let filesSaved: FilesSaved[] = [];
let activeFile: FilesSaved = {
  numberOfCharacters: 0,
  fileId: "",
  pets: [],
  keystrokeCount: 0,
};
let isInFeed: boolean = false;
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
  vscode.postMessage({
    text: "isInitialized",
    command: "isInitialized",
  });
  let backgroundCoverTop: BgCover;
  let backgroundCoverBottom: BgCover;
  let backgroundCoverFull: BgCover;
  let platformSpriteInited: PIXI.Sprite;
  let app: PIXI.Application<HTMLCanvasElement>;
  const initApp = async () => {
    // background color same as theme background color
    app = new PIXI.Application<HTMLCanvasElement>({
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
      app.stage.removeChild(
        backgroundCoverFull.container as PIXI.DisplayObject
      );
      app.stage.removeChild(platformSpriteInited as PIXI.DisplayObject);
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
        if (pet.growth === IPetGrowth.old) {
          pet.animatedSprite.y =
            app.renderer.height - pet.animatedSprite.height / 2;
        } else {
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
    app.stage.addChild(basicText as PIXI.DisplayObject);

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

    const backgroundSpriteFull = await PIXI.Assets.load(backgroundImageFull);
    const containerSize = {
      x: app.renderer.width,
      y: app.renderer.height,
    };

    backgroundCoverFull = background(
      containerSize,
      new PIXI.Sprite(backgroundSpriteFull),
      "coverFromBottom"
    );
    app.stage.addChildAt(
      backgroundCoverFull.container as PIXI.DisplayObject,
      0
    );
    backgroundCoverFull.container.alpha = 1;

    const platformSprite = await PIXI.Assets.load(platformImage);
    platformSpriteInited = new PIXI.Sprite(platformSprite);
    platformSpriteInited.width =
      app.renderer.width / 3 <= 180 ? 180 : app.renderer.width / 3;
    // keep ratio for height with the new width
    platformSpriteInited.height =
      (platformSpriteInited.height * platformSpriteInited.width) /
      platformSprite.width;
    platformSpriteInited.anchor.set(0, -0.5);
    app.stage.addChildAt(platformSpriteInited as PIXI.DisplayObject, 1);
    platformSpriteInited.x =
      (app.renderer.width - platformSpriteInited.width) / 2;
    platformSpriteInited.y =
      app.renderer.height / 2 - platformSpriteInited.height / 2 - 20;
  };

  const saveFile = ({ file }: { file: FilesSaved }) => {
    if (
      filesSaved.filter((fileToFilter) => fileToFilter.fileId === file.fileId)
        .length === 0
    ) {
      filesSaved.push(file);
    } else {
      filesSaved = filesSaved.map((file) => {
        if (file.fileId === file.fileId) {
          return file;
        }
        return file;
      });
    }
  };

  const feedPet = async ({
    newCharacterCount,
    timebetweenFeed,
    appHeight,
    appWidth,
    offsetX = 0,
    animationSpeed = 6,
  }: {
    newCharacterCount: number;
    timebetweenFeed: number;
    animationSpeed?: number;
    file: FilesSaved;
    appHeight: number;
    appWidth: number;
    offsetX?: number;
  }) => {
    if (newCharacterCount > 0) {
      isInFeed = true;
    }
    newCharacterCount = newCharacterCount > 100000 ? 100000 : newCharacterCount;
    for (let i = 0; i < newCharacterCount; i++) {
      // stop the for loop if event with name newWindowOpened is received
      setTimeout(async () => {
        const isThereNotAnyPetToFeed: boolean =
          activeFile.pets.every((pet) => pet.growth === IPetGrowth.old) ||
          activeFile.pets.length === 0 ||
          (activeFile.pets.length === 1 &&
            activeFile.pets[0].growth === IPetGrowth.old);
        if (isThereNotAnyPetToFeed) {
          const xpMultiplicator = calculateLevelMultiplier(
            activeFile.pets.length
          );

          let newPet: PetClass = await PetClass.create({
            state: petState.idle,
            elapsed: 0.0,
            moveDir: 0,
            eachKeyCountBeforeEat: 1,
            growth: IPetGrowth.egg,
            xpMultiplicator: xpMultiplicator,
          });
          activeFile.pets.push(newPet);
          // add activeFiles in savedFiles id not already there
          // else upate it
          if (app !== undefined)
            app.stage.addChild(newPet.animatedSprite as PIXI.DisplayObject);
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
          if (
            activeFile.keystrokeCount % pet.eachKeyCountBeforeEat === 0 &&
            pet.growth !== IPetGrowth.old
          ) {
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

  function calculateLevelMultiplier(level: number) {
    // Adjust the base value for the initial growth
    const initialBase = 1;

    const laterBase = 1.08;

    // Threshold level after which the multiplier remains constant
    const thresholdLevel = 50;

    // Calculate the level multiplier using different formulas before and after the threshold
    let multiplier;
    if (level <= thresholdLevel) {
      multiplier = Math.round(Math.pow(level / 50 + 1, initialBase));
    } else {
      multiplier = Math.round(Math.pow(level, laterBase));
    }

    return multiplier;
  }

  window.addEventListener("message", async (event) => {
    console.log("event received", event.data);

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
      if (newCharacterCount < 1) return;
      feedPet({
        newCharacterCount,
        timebetweenFeed,
        file: activeFile,
        appHeight: app.renderer.height,
        appWidth: app.renderer.width,
        animationSpeed: 3,
      });
    }

    if (
      (event.data.fileOpened !== undefined &&
        event.data.fileOpened.fileId !== undefined) ||
      (event.data.initialised !== undefined &&
        event.data.initialised.fileId !== undefined &&
        event.data.initialised.numberOfCharacters !== undefined)
    ) {
      let fileId =
        event.data.fileOpened?.fileId ?? event.data.initialised.fileId;
      let numberOfCharacters =
        event.data.fileOpened?.numberOfCharacters ??
        event.data.initialised.numberOfCharacters;
      do {
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (isInFeed);
      vscode.postMessage({
        text: fileId,
        command: "setInitialised",
      });
      if (event.data.backgroundColor !== undefined) {
        // set app background color
        app.renderer.background.color = event.data.backgroundColor;
      }
      if (app !== undefined) {
        app.stage.removeChildren();
        app.destroy();
      }
      initApp();
      basicText.text = `code typed: ${numberOfCharacters}`;
      // remove all pets
      activeFile.pets.forEach((pet) => {
        app.stage.removeChild(pet.animatedSprite as PIXI.DisplayObject);
      });
      // if file already opened, do nothing
      if (filesSaved.filter((file) => file.fileId === fileId).length > 0) {
        // get file from savedFiles
        const fileFromSaved = filesSaved.filter(
          (file) => file.fileId === fileId
        )[0];
        // if any pet of activeFile eatingFood array is not empty remove the activeFile from savedFiles
        if (
          fileFromSaved.pets.filter((pet) => pet.eatingFood.length > 0)
            .length === 0
        ) {
          activeFile = filesSaved.filter((file) => file.fileId === fileId)[0];
          activeFile.pets.forEach((pet) => {
            app.stage.addChild(pet.animatedSprite as PIXI.DisplayObject);
            if (pet.growth === IPetGrowth.old) {
              pet.animatedSprite.y =
                app.renderer.height - pet.animatedSprite.height / 2;
            } else {
              pet.animatedSprite.y =
                app.renderer.height / 2 -
                activeFile.pets[0].animatedSprite.height / 2;
            }
            // set pet to center of screen
            pet.animatedSprite.x =
              (app.renderer.width - pet.animatedSprite.width) / 2;
          });
          return;
        } else {
          // remove file from savedFiles
          filesSaved = filesSaved.filter((file) => file.fileId !== fileId);
        }
      }
      activeFile = {
        numberOfCharacters: numberOfCharacters,
        fileId: fileId,
        pets: [],
        keystrokeCount: numberOfCharacters,
      };
      let firstPet: PetClass = await PetClass.create({
        state: petState.idle,
        elapsed: 0.0,
        moveDir: 0,
        eachKeyCountBeforeEat: 1,
        growth: IPetGrowth.egg,
        xpMultiplicator: 1,
      });

      app.stage.addChild(firstPet.animatedSprite as PIXI.DisplayObject);
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

      app.stage.addChild(basicText as PIXI.DisplayObject);
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
  function background(
    bgSize: { x: number; y: number },
    inputSprite: PIXI.Sprite,
    type: string,
    forceSize: { x: number; y: number } | undefined = undefined
  ): BgCover {
    var sprite = inputSprite;
    var bgContainer = new PIXI.Container();
    var mask = new PIXI.Graphics()
      .beginFill(0x8bc5ff)
      .drawRect(0, 0, bgSize.x, bgSize.y)
      .endFill();
    bgContainer.mask = mask;
    bgContainer.addChild(mask as PIXI.DisplayObject);
    bgContainer.addChild(sprite as PIXI.DisplayObject);

    function resize() {
      var sp = { x: sprite.width, y: sprite.height };
      if (forceSize) sp = forceSize;
      var winratio = bgSize.x / bgSize.y;
      var spratio = sp.x / sp.y;
      var scale = 1;
      var pos = new PIXI.Point(0, 0);

      if (type === "coverFromBottom") {
        if (winratio > spratio) {
          scale = bgSize.x / sp.x;
        } else {
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
        } else {
          //photo is taller than background
          scale = 1;
          pos.x = -(sp.x * scale - bgSize.x) / 2;
        }
      }
      sprite.scale = new PIXI.Point(scale, scale);
      sprite.position = pos;
    }

    resize();
    const res: BgCover = {
      container: bgContainer,
      doResize: resize,
    };
    return res;
  }
}, 0);
