import * as PIXI from "pixi.js";
import * as tamagotchiJson from "../../media/images/pets/tamagotchi/tamagotchi.json";
import backgroundImageTop from "../../media/images/background/first/top.png";
import backgroundImageBottom from "../../media/images/background/first/bottom.png";
import backgroundImageFull from "../../media/images/background/first/full.png";
import platformImage from "../../media/images/background/first/platform.png";
import Pet from "./competitive/characters/pets/pet";
import CommonsCompetitiveSingleton, {
  FilesSaved,
  DEFAULT_PET,
  COOLDOWN_COMBO,
} from "./competitive/commons";
import { WebviewMessage } from "../types/types";
import { EPetState } from "./competitive/characters/commons";
import Portal, { EPortalState } from "./competitive/portal/portal";
import { SpriteElement } from "./competitive/sprite/sprite_element";
import TextTimer from "./competitive/text_timer";
import { stat } from "fs";
declare global {
  interface VscodeStateApi {
    postMessage(message: WebviewMessage): void;
    setState(state: any): void;
    getState(): any;
  }
  const vscode: VscodeStateApi;
}

let lastComboText: TextTimer | undefined;
let portal: Portal;
let activeFile: FilesSaved;
let inResetState: boolean = false;
type BgCover = {
  container: PIXI.Container<PIXI.DisplayObject>;
  doResize: () => void;
};

const petXpToLevelUp = 60;

console.log("main.js loaded");
let stateApi: VscodeStateApi;
let filesSaved: FilesSaved[] = [];
let timer: NodeJS.Timeout;

let basicText: PIXI.Text;

let comboCharacter: PIXI.Text;

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

  let setBackgroundImage = async () => {
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
    // Portal
    const portalTaxture = await Portal.createAnimations();
    portal = new Portal({
      textures: portalTaxture,
      state: EPortalState.IDLE,
      moveDir: 0,
      health: 100,
      speed: 0,
      app: app,
    });
    app.stage.addChild(portal as PIXI.DisplayObject);
  };

  const initApp = async () => {
    app = new PIXI.Application<HTMLCanvasElement>({
      backgroundColor: 0x1e1e1e,
      width: window.innerWidth - 50,
      height: window.innerHeight - 50,
    });

    let state = vscode.getState();
    console.log("state", state?.activeFile);
    if (state && state.activeFile !== undefined) {
      let fileFromFileSaved = JSON.parse(state.activeFile);
      const pets = [];

      let petToInsert = await Pet.fromJson(fileFromFileSaved.petInGrow, app);

      for (let pet of fileFromFileSaved.pets) {
        const petToImport = await Pet.fromJson(pet, app);
        // // set pos in random position inside the screen
        // petToImport.setPos({
        //   x: pet.x,
        //   y: pet.y,
        // });

        pets.push(petToImport);
      }

      activeFile = {
        numberOfCharacters: fileFromFileSaved.numberOfCharacters,
        fileId: fileFromFileSaved.fileId,
        pets: pets,
        petInGrow: petToInsert,
        keystrokeCount: fileFromFileSaved.keystrokeCount,
      };
    }

    // clear document body
    document.body.innerHTML = "";

    // Adding the application's view to the DOM
    document.body.appendChild(app.view);

    // Set all the background of the app
    await setBackgroundImage();

    // on window resize, resize the canvas too
    window.removeEventListener("resize", windowResizeEvent);
    window.addEventListener("resize", windowResizeEvent);

    basicText = new PIXI.Text("All: " + 0);
    basicText.x = 5;
    basicText.y = 5;
    basicText.style = new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: 10,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    comboCharacter = new PIXI.Text("Combo: " + 0);
    comboCharacter.x = 5;
    comboCharacter.y = 15;
    comboCharacter.style = new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: 10,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    if (activeFile !== undefined && activeFile.keystrokeCount > 0) {
      basicText.text = `All: ${activeFile.keystrokeCount}`;
    }

    app.stage.addChild(basicText as PIXI.DisplayObject);

    if (activeFile !== undefined && activeFile.numberOfCharacters > 0) {
      comboCharacter.text = `Combo: ${activeFile.numberOfCharacters}`;
    }

    app.stage.addChild(comboCharacter as PIXI.DisplayObject);

    let newPet: Pet;

    // if there is already a pet in grow in the file, load it
    if (activeFile !== undefined && activeFile.petInGrow !== undefined) {
      newPet = activeFile.petInGrow;
    } else {
      let textures = await Pet.createAnimation({
        state: DEFAULT_PET.state,
        growth: DEFAULT_PET.growth,
      });

      newPet = new Pet({
        textures: textures,
        ...DEFAULT_PET,
        app: app,
      });
      // random speed between 0.5 and 1.5
      newPet.speed = 0.5 + Math.random();
      console.log("new random speed", newPet.speed);
    }

    app.stage.addChild(newPet as PIXI.DisplayObject);

    // add the pet in grow to the central platform
    newPet.setPos({
      x: app.renderer.width / 2,
      y: app.renderer.height / 2 - 5,
    });

    // if there is pets from the activefile load them
    // Activefile can have pet when the file was already saved and we are reopening it
    if (
      activeFile !== undefined &&
      activeFile.pets !== undefined &&
      activeFile.pets.length > 0
    ) {
      for (let pet of activeFile.pets) {
        app.stage.addChild(pet as PIXI.DisplayObject);

        pet.petHeader.xpBarContainer.visible = false;

        pet.removeChild(pet.petHeader.xpBarContainer as PIXI.DisplayObject);

        pet.petHeader.xpBarContainer.destroy({
          children: true,
          texture: true,
          baseTexture: true,
        });
      }
    } else {
      activeFile = {
        numberOfCharacters: 0,
        fileId: "",
        pets: [],
        petInGrow: newPet,
        keystrokeCount: 0,
      };
    }
  };
  initApp();

  const windowResizeEvent = async () => {
    app.stage.removeChild(backgroundCoverFull.container as PIXI.DisplayObject);

    app.stage.removeChild(platformSpriteInited as PIXI.DisplayObject);

    app.stage.removeChild(portal as PIXI.DisplayObject);

    app.renderer.resize(window.innerWidth - 50, window.innerHeight - 50);

    await setBackgroundImage();

    // set all adult pets y to bottom of screen
    for (let pet of activeFile.pets) {
      pet.x = (app.renderer.width - pet.width) / 2;
      pet.y = app.renderer.height;
    }
    activeFile.petInGrow.x = app.renderer.width / 2;
    activeFile.petInGrow.y = app.renderer.height / 2 - 5;
  };

  const setAdult = async ({ withTransition }: { withTransition: boolean }) => {
    if (withTransition) {
      activeFile.petInGrow.petHeader.xpBarContainer.visible = false;

      if (activeFile.petInGrow !== undefined) {
        activeFile.petInGrow.y =
          activeFile.petInGrow.y - activeFile.petInGrow.height / 2;
      }

      activeFile.petInGrow.state = EPetState.ADULTTRANSITION;
    } else {
      activeFile.petInGrow.setToAdult();
    }

    activeFile.pets.push(activeFile.petInGrow);

    const lastPet = activeFile.petInGrow;

    let textures = await Pet.createAnimation({
      state: DEFAULT_PET.state,
      growth: DEFAULT_PET.growth,
    });

    activeFile.petInGrow = new Pet({
      textures: textures,
      ...DEFAULT_PET,
      app: app,
    });

    activeFile.petInGrow.speed = 0.5 + Math.random();

    console.log("new random speed", activeFile.petInGrow.speed);

    activeFile.petInGrow.play();

    app.stage.addChild(activeFile.petInGrow as PIXI.DisplayObject);

    app.stage.swapChildren(
      activeFile.petInGrow as PIXI.DisplayObject,
      lastPet as PIXI.DisplayObject
    );

    activeFile.petInGrow.setPos({
      x: app.renderer.width / 2,
      y: app.renderer.height / 2 - 5,
    });
  };

  const activeFileToJson = () => {
    let petsJson = activeFile.pets.map((pet) => pet.toJson());

    let petJson = activeFile.petInGrow.toJson();

    let activeFileJson = JSON.stringify({
      numberOfCharacters: 0,
      pets: petsJson,
      petInGrow: petJson,
      keystrokeCount: activeFile.keystrokeCount,
    });

    console.log("file saved", activeFileJson);
    return activeFileJson;
  };

  setInterval(() => {
    if (activeFile === undefined) return;
    let petsJson = activeFile.pets.map((pet) => pet.toJson());

    let petJson = activeFile.petInGrow.toJson();

    let activeFileJson = JSON.stringify({
      numberOfCharacters: 0,
      pets: petsJson,
      petInGrow: petJson,
      keystrokeCount: activeFile.keystrokeCount,
    });
    // Update the saved state
    vscode.setState({ activeFile: activeFileJson });
  }, 100);

  window.addEventListener("message", async (event) => {
    console.log("event received", event.data);
    if (event.data.stroke !== undefined && activeFile !== undefined) {
      if (activeFile.petInGrow.isAdult) {
        console.log("what the fuck");
        let textures = await Pet.createAnimation({
          state: DEFAULT_PET.state,
          growth: DEFAULT_PET.growth,
        });

        let newPet: Pet = new Pet({
          textures: textures,
          ...DEFAULT_PET,
          app: app,
        });

        newPet.speed = 0.5 + Math.random();

        app.stage.addChild(newPet as PIXI.DisplayObject);

        newPet.setPos({
          x: app.renderer.width / 2,
          y: app.renderer.height / 2 - 5,
        });
      }

      activeFile.numberOfCharacters += event.data.stroke;

      activeFile.keystrokeCount += event.data.stroke;

      basicText.text = `All: ${activeFile.keystrokeCount}`;

      comboCharacter.text = `Combo: ${activeFile.numberOfCharacters}`;

      if (activeFile.numberOfCharacters > 0) {
        comboCharacter.alpha = 1;

        comboCharacter.style.fontSize = 20;

        activeFile.petInGrow.giveXp(1);

        if (lastComboText !== undefined) {
          lastComboText.finish(0);
        }

        const comboText = new TextTimer({
          app,
          text: `+ ${activeFile.numberOfCharacters}`,
          timeToAnimInSeconds: COOLDOWN_COMBO / 1000,
          animScale: { start: 0.5, end: 1 },
          animAlpha: false,
          translateAnim: { x: 60, y: -50 },
          style: new PIXI.TextStyle({
            fill: "#e4e425", // yellow
            fontSize: 40,
            fontFamily: "Arial",
            stroke: 0x000000,
            strokeThickness: 4,
            wordWrap: true,
            wordWrapWidth: 440,
          }),
        });

        comboText.anchor.set(0.5, 0.5);

        comboText.x = activeFile.petInGrow.x;

        comboText.y = activeFile.petInGrow.y - activeFile.petInGrow.height;

        lastComboText = comboText;

        if (activeFile.petInGrow.isAdult) {
          setAdult({ withTransition: false });
        }

        // if no new event detected in 2 seconds reset combo else reset the timer
        clearTimeout(timer);

        timer = setTimeout(() => {
          activeFile.numberOfCharacters = 0;

          comboCharacter.text = `Combo: ${activeFile.numberOfCharacters}`;

          (comboCharacter.style.fontSize = 10), (comboCharacter.alpha = 0.5);

          if (activeFile.petInGrow.growth !== 0) {
            setAdult({ withTransition: true });
          }
        }, COOLDOWN_COMBO);
      }
    }

    if (event.data.resetState !== undefined) {
      activeFile.petInGrow.destroy;
      for (let pet of activeFile.pets) {
        pet.destroy;
      }
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      let newPet: Pet;
      let textures = await Pet.createAnimation({
        state: DEFAULT_PET.state,
        growth: DEFAULT_PET.growth,
      });

      newPet = new Pet({
        textures: textures,
        ...DEFAULT_PET,
        app: app,
      });
      // random speed between 0.5 and 1.5
      newPet.speed = 0.5 + Math.random();
      activeFile = {
        numberOfCharacters: 0,
        fileId: "",
        pets: [],
        petInGrow: newPet,
        keystrokeCount: 0,
      };

      let activeFileJSON = activeFileToJson();

      vscode.setState({ activeFile: activeFileJSON });

      initApp();
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
