import * as PIXI from "pixi.js";
import Pet from "../characters/pets/pet";
import Boss from "../characters/boss/boss";
import { DEFAULT_PET, FilesSaved } from "../commons";
import Splashscreen from "../../splashscreen";
import backgroundImageFull from "../../../../media/images/background/first/full.png";
import { BgCover, imageCover } from "../commons";
import platformImage from "../../../../media/images/background/first/platform.png";
import Portal, { EPortalState } from "../portal/portal";
import { getEventListeners } from "events";

let splashscreen: Splashscreen;
export default class App extends PIXI.Application<HTMLCanvasElement> {
  activeFile: FilesSaved;
  basicText: PIXI.Text;
  comboCharacter: PIXI.Text;
  portal?: Portal;
  constructor({
    activeFile,
    basicText,
    comboCharacter,
  }: {
    activeFile: FilesSaved;
    basicText: PIXI.Text;
    comboCharacter: PIXI.Text;
  }) {
    super({
      backgroundColor: 0x1e1e1e,
      width: window.innerWidth - 50,
      height: window.innerHeight - 50,
    });
    this.activeFile = activeFile;
    this.basicText = basicText;
    this.comboCharacter = comboCharacter;
  }

  queuePetToKill: { index: number; pet: Pet }[] = [];
  queueBossToKill: { index: number; boss: Boss }[] = [];

  platformSpriteInited: PIXI.Sprite = new PIXI.Sprite();

  backgroundCoverFull: BgCover = {
    container: new PIXI.Container(),
    doResize: () => {},
  };

  async init() {
    let state = vscode.getState();
    console.log("state", state?.activeFile);
    if (state && state.activeFile !== undefined) {
      let fileFromFileSaved = JSON.parse(state.activeFile);
      console.log("fileFromFileSaved", fileFromFileSaved);
      const pets = [];
      const bosses = [];

      let petToInsert = await Pet.fromJson(fileFromFileSaved.petInGrow, this);

      if (fileFromFileSaved.pets === undefined) fileFromFileSaved.pets = [];
      for (let pet of fileFromFileSaved.pets) {
        const petToImport = await Pet.fromJson(pet, this);
        // // set pos in random position inside the screen
        // petToImport.setPos({
        //   x: pet.x,
        //   y: pet.y,
        // });
        petToImport.indexInActiveFile = pets.length;
        pets.push(petToImport);
      }
      if (fileFromFileSaved.bosses === undefined) fileFromFileSaved.bosses = [];
      for (let boss of fileFromFileSaved.bosses) {
        const bossToImport = await Boss.fromJson(boss, this);
        bossToImport.indexInActiveFile = bosses.length;
        bossToImport.enemies = pets;
        bosses.push(bossToImport);
      }
      console.log("bossToImport", bosses);

      this.activeFile = {
        numberOfCharacters: fileFromFileSaved.numberOfCharacters,
        fileId: fileFromFileSaved.fileId,
        pets: pets,
        petInGrow: petToInsert,
        keystrokeCount: fileFromFileSaved.keystrokeCount,
        bosses: bosses,
        bestCombo: fileFromFileSaved.bestCombo,
      };
    }

    // clear document body
    document.body.innerHTML = "";

    // Adding the application's view to the DOM
    document.body.appendChild(this.view);

    const portalTaxture = await Portal.createAnimations();
    let portal = new Portal({
      textures: portalTaxture,
      state: EPortalState.IDLE,
      moveDir: 0,
      health: 100,
      maxHealth: 100,
      speed: 0,
      app: this,
      attackSpeed: 0,
      strength: 0,
    });
    this.portal = portal;
    // Set all the background of the app
    splashscreen = new Splashscreen({ app: this, timeToLoad: 600 });
    await splashscreen.init();

    await this.setBackgroundImage({ portal: this.portal! });

    // on window resize, resize the canvas too
    window.removeEventListener("resize", this.windowResizeEvent);
    window.addEventListener("resize", this.windowResizeEvent);

    this.basicText = new PIXI.Text("All: " + 0);
    this.basicText.x = 5;
    this.basicText.y = 5;
    this.basicText.style = new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: 10,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: 440,
    });
    if (this.activeFile !== undefined) {
      this.comboCharacter = new PIXI.Text(
        "Best combo: " + this.activeFile.bestCombo ?? 0
      );
    } else {
      this.comboCharacter = new PIXI.Text("Best combo: " + 0);
    }
    this.comboCharacter.x = 5;
    this.comboCharacter.y = 15;
    this.comboCharacter.style = new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: 10,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    if (this.activeFile !== undefined && this.activeFile.keystrokeCount > 0) {
      this.basicText.text = `All: ${this.activeFile.keystrokeCount}`;
    }

    this.stage.addChild(this.basicText as PIXI.DisplayObject);

    if (
      this.activeFile !== undefined &&
      this.activeFile.numberOfCharacters > 0
    ) {
      this.comboCharacter.text = `Best combo: ${this.activeFile.bestCombo}`;
    }

    this.stage.addChild(this.comboCharacter as PIXI.DisplayObject);

    let newPet: Pet;

    // if there is already a pet in grow in the file, load it
    if (
      this.activeFile !== undefined &&
      this.activeFile.petInGrow !== undefined
    ) {
      newPet = this.activeFile.petInGrow;
    } else {
      let textures = await Pet.createAnimation({
        state: DEFAULT_PET.state,
        growth: DEFAULT_PET.growth,
      });

      newPet = new Pet({
        textures: textures,
        ...DEFAULT_PET,
        app: this,
      });
      // random speed between 0.5 and 1.5
      newPet.speed = 0.5 + Math.random();
      console.log("new random speed", newPet.speed);
    }

    this.stage.addChild(newPet as PIXI.DisplayObject);

    // add the pet in grow to the central platform
    newPet.setPos({
      x: this.renderer.width / 2,
      y: this.renderer.height / 2 - 5,
    });

    // if there is pets from the activefile load them
    // Activefile can have pet when the file was already saved and we are reopening it
    if (
      this.activeFile !== undefined &&
      this.activeFile.pets !== undefined &&
      (this.activeFile.pets.length > 0 || this.activeFile.bosses.length > 0)
    ) {
      for (let pet of this.activeFile.pets) {
        this.stage.addChild(pet as PIXI.DisplayObject);

        pet.petHeader.xpBarContainer.visible = false;
        if (pet.health === pet.maxHealth) {
          pet.petHeader.healthBarContainer.visible = false;
          pet.petHeader.headerContainer.visible = false;
        } else {
          pet.petHeader.healthBarContainer.visible = true;
          pet.petHeader.headerContainer.visible = true;
        }
        pet.petHeader.headerContainer.width = 20;
        pet.replacePetHeader(20, -5);
        pet.petHeader.updateHealthBarFill(pet.health);
      }
      for (let boss of this.activeFile.bosses) {
        this.stage.addChild(boss as PIXI.DisplayObject);
      }
    } else {
      this.activeFile = {
        numberOfCharacters: 0,
        fileId: "",
        pets: [],
        petInGrow: newPet,
        keystrokeCount: 0,
        bosses: [],
        bestCombo: 0,
      };
    }
    await splashscreen.resize();
    this.stage.addChildAt(
      this.portal as PIXI.DisplayObject,
      this.stage.children.length - 1
    );
    return this;
  }

  clearWindowResizeEvent() {
    window.removeEventListener("resize", this.windowResizeEvent);
  }

  precendentWindowSizes: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  windowResizeEvent = async (e: UIEvent) => {
    this.stage.removeChild(
      this.backgroundCoverFull.container as PIXI.DisplayObject
    );

    this.stage.removeChild(this.platformSpriteInited as PIXI.DisplayObject);

    this.stage.removeChild(this.portal as PIXI.DisplayObject);

    this.renderer.resize(window.innerWidth - 50, window.innerHeight - 50);

    splashscreen.resize();

    await this.setBackgroundImage({
      portal: this.portal!,
    });

    // set all adult pets y to bottom of screen
    let widthDifference = window.innerWidth - this.precendentWindowSizes.width;
    console.log("resize event", widthDifference);

    for (let pet of this.activeFile.pets) {
      let newX = pet.x < 0 - pet.width / 2 ? 0 : pet.x;
      if (newX >= this.renderer.width - pet.width / 2) {
        console.log("triggered");
        newX = this.renderer.width - pet.width / 2;
      }
      pet.x = newX;
      pet.y = this.renderer.height;
    }
    this.activeFile.petInGrow.x = this.renderer.width / 2;
    this.activeFile.petInGrow.y = this.renderer.height / 2 - 5;
    this.precendentWindowSizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  async setBackgroundImage({ portal }: { portal: Portal }) {
    const backgroundSpriteFull = await PIXI.Assets.load(backgroundImageFull);
    const containerSize = {
      x: this.renderer.width,
      y: this.renderer.height,
    };

    this.backgroundCoverFull = imageCover(
      containerSize,
      new PIXI.Sprite(backgroundSpriteFull),
      "coverFromBottom"
    );

    this.stage.addChildAt(
      this.backgroundCoverFull.container as PIXI.DisplayObject,
      0
    );
    this.backgroundCoverFull.container.alpha = 1;

    const platformSprite = await PIXI.Assets.load(platformImage);
    this.platformSpriteInited = new PIXI.Sprite(platformSprite);
    this.platformSpriteInited.width =
      this.renderer.width / 3 <= 180 ? 180 : this.renderer.width / 3;
    // keep ratio for height with the new width
    this.platformSpriteInited.height =
      (this.platformSpriteInited.height * this.platformSpriteInited.width) /
      platformSprite.width;
    this.platformSpriteInited.anchor.set(0, -0.5);
    this.stage.addChildAt(this.platformSpriteInited as PIXI.DisplayObject, 1);
    this.platformSpriteInited.x =
      (this.renderer.width - this.platformSpriteInited.width) / 2;
    this.platformSpriteInited.y =
      this.renderer.height / 2 - this.platformSpriteInited.height / 2 - 20;
    // Portal

    this.stage.addChildAt(portal as PIXI.DisplayObject, 3);
    portal.y = this.renderer.height;
  }

  setPortalToBack() {
    this.stage.removeChild(this.portal as PIXI.DisplayObject);
    this.stage.addChildAt(this.portal as PIXI.DisplayObject, 3);
  }
}
