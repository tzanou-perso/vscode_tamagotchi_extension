import * as PIXI from "pixi.js";
import * as tamagotchiJson from "../media/images/pets/tamagotchi/tamagotchi.json";
import tamagotchiImages from "../media/images/pets/tamagotchi/tamagotchi.png";
import PetClass from "./pet_class";
import { IPet, IPetGrowth, petState, IAnimation } from "./pet_class";
import { FoodList } from "./foodClass";

type FilesSaved = {
  numberOfCharacters: number;
  fileId: string;
  pets: PetClass[];
  keystrokeCount: number;
};

console.log("main.js loaded");
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
  let app: PIXI.Application<HTMLCanvasElement>;
  const initApp = () => {
    // background color same as theme background color
    app = new PIXI.Application<HTMLCanvasElement>({
      backgroundColor: 0x1e1e1e,
      width: window.innerWidth - 50,
      height: window.innerHeight - 50,
    });
    const tamagotchiMoveTicker = app.ticker;

    const line = new PIXI.Graphics();
    //line color
    line.lineStyle(4, 0x00ccffff, 1);
    line.moveTo(0, app.renderer.height / 2);
    line.lineTo(app.renderer.width, app.renderer.height / 2);
    app.stage.addChild(line as PIXI.DisplayObject);

    // on window resize, resize the canvas too
    window.addEventListener("resize", () => {
      app.renderer.resize(window.innerWidth - 50, window.innerHeight - 50);
      // move line to middle of screen
      line.clear();
      line.lineStyle(4, 0x00ccffff, 1);
      line.moveTo(0, app.renderer.height / 2);
      line.lineTo(app.renderer.width, app.renderer.height / 2);
      app.stage.addChild(line as PIXI.DisplayObject);
      // set all pets y to bottom of screen
      for (let pet of activeFile.pets) {
        if (pet.growth === IPetGrowth.old) {
          pet.animatedSprite.y =
            app.renderer.height - pet.animatedSprite.height / 2;
        } else {
          pet.animatedSprite.y =
            app.renderer.height / 2 -
            activeFile.pets[0].animatedSprite.height / 2;
        }
      }
    });
    // clear document body
    document.body.innerHTML = "";
    // Adding the application's view to the DOM
    document.body.appendChild(app.view);

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
    for (let i = 0; i < newCharacterCount; i++) {
      // stop the for loop if event with name newWindowOpened is received
      setTimeout(async () => {
        const isThereNotAnyPetToFeed: boolean =
          activeFile.pets.every((pet) => pet.growth === IPetGrowth.old) ||
          activeFile.pets.length === 0 ||
          (activeFile.pets.length === 1 &&
            activeFile.pets[0].growth === IPetGrowth.old);
        if (isThereNotAnyPetToFeed) {
          let newPet: PetClass = await PetClass.create({
            state: petState.idle,
            elapsed: 0.0,
            moveDir: 0,
            eachKeyCountBeforeEat: 1,
            growth: IPetGrowth.egg,
          });
          activeFile.pets.push(newPet);
          // add activeFiles in savedFiles id not already there
          // else upate it
          if (app !== undefined)
            app.stage.addChild(newPet.animatedSprite as PIXI.DisplayObject);
          // y in middle of screen
          activeFile.pets[activeFile.pets.length - 1].animatedSprite.y =
            app.renderer.height / 2 -
            activeFile.pets[activeFile.pets.length - 1].animatedSprite.height /
              2;
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
      event.data.fileOpened !== undefined &&
      event.data.fileOpened.fileId !== undefined
    ) {
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
        app.stage.removeChild(pet.animatedSprite as PIXI.DisplayObject);
      });
      // if file already opened, do nothing
      if (
        filesSaved.filter(
          (file) => file.fileId === event.data.fileOpened.fileId
        ).length > 0
      ) {
        // get file from savedFiles
        const fileFromSaved = filesSaved.filter(
          (file) => file.fileId === event.data.fileOpened.fileId
        )[0];
        // if any pet of activeFile eatingFood array is not empty remove the activeFile from savedFiles
        if (
          fileFromSaved.pets.filter((pet) => pet.eatingFood.length > 0)
            .length === 0
        ) {
          activeFile = filesSaved.filter(
            (file) => file.fileId === event.data.fileOpened.fileId
          )[0];
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
          filesSaved = filesSaved.filter(
            (file) => file.fileId !== event.data.fileOpened.fileId
          );
        }
      }
      activeFile = {
        numberOfCharacters: event.data.fileOpened.numberOfCharacters,
        fileId: event.data.fileOpened.fileId,
        pets: [],
        keystrokeCount: event.data.fileOpened.numberOfCharacters,
      };

      let firstPet: PetClass = await PetClass.create({
        state: petState.idle,
        elapsed: 0.0,
        moveDir: 0,
        eachKeyCountBeforeEat: 1,
        growth: IPetGrowth.egg,
      });

      app.stage.addChild(firstPet.animatedSprite as PIXI.DisplayObject);

      activeFile.pets.push(firstPet);
      saveFile({ file: activeFile });

      activeFile.pets[0].animatedSprite.y =
        app.renderer.height / 2 - activeFile.pets[0].animatedSprite.height / 2;

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
}, 0);
