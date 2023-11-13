import * as PIXI from "pixi.js";
import * as tamagotchiJson from "../../media/images/pets/tamagotchi/tamagotchi.json";
import tamagotchiImages from "../../media/images/pets/tamagotchi/tamagotchi.png";
import PetClass from "./pet_class";
import { IPet, IPetGrowth, petState, IAnimation } from "./pet_class";
import { FoodList } from "./foodClass";

console.log("main.js loaded");

let pets: PetClass[] = [];
let keystrokeCount = 0;
const basicText = new PIXI.Text("code typed: " + keystrokeCount);
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
  const app = new PIXI.Application<HTMLCanvasElement>({
    background: "#1099bb",
    width: window.innerWidth - 50,
    height: window.innerHeight - 50,
  });
  const tamagotchiMoveTicker = app.ticker;
  console.log("pixi app created");

  // Adding the application's view to the DOM
  document.body.appendChild(app.view);

  // const base = new PIXI.BaseTexture(tamagotchiImages);
  console.log("PIXI.Loader.shared", PIXI.Assets);

  let newPet: PetClass = await PetClass.create({
    state: petState.walk,
    elapsed: 0.0,
    moveDir: 0,
    eachKeyCountBeforeEat: 1,
    growth: IPetGrowth.egg,
  });

  app.stage.addChild(newPet.animatedSprite as PIXI.DisplayObject);

  pets.push(newPet);

  pets[0].animatedSprite.y =
    app.renderer.height - pets[0].animatedSprite.height;

  // set pet to center of screen
  pets[0].animatedSprite.x =
    (app.renderer.width - pets[0].animatedSprite.width) / 2;

  //create a square in top left corner of screen with string text inside
  // const square = new PIXI.Graphics();
  // square.beginFill(0xDE3249);
  // square.drawRect(0, 0, 100, 100);
  // square.endFill();
  // square.x = 50;
  // square.y = 50;
  // app.stage.addChild(square);

  //create a text object that will be updated..
  // create algorithm to change animation based on keystrokeCount

  app.stage.addChild(basicText as PIXI.DisplayObject);

  // Add a variable to count up the seconds our demo has been running
  let elapsed = 0.0;
  // Tell our application's ticker to run a new callback every frame, passing
  // in the amount of time that has passed since the last tick
  let move = +1;
  pets[0].animatedSprite.play();
  tamagotchiMoveTicker.add((delta) => {
    // Add the time to our total elapsed time
    elapsed += delta;
    for (let pet of pets) {
      pet.tickAnimPet({ app, delta });
    }
    // Update the sprite's to let him walk across the screen horizontally
    // from left to right if he is not at the right side of the screen
  });

  window.addEventListener("message", async (event) => {
    console.log("event received", event.data); // Outputs: Hello, world!
    if (event.data.stroke !== undefined) {
      keystrokeCount = event.data.stroke;
      console.log(`stroke count: ${keystrokeCount}`);
      basicText.text = `code typed: ${keystrokeCount}`;
      // if keystrokeCount is in ten multiple
      let isThereIsAnyPetToFeed: boolean = pets.every(
        (pet) => pet.growth === IPetGrowth.old
      );
      if (isThereIsAnyPetToFeed) {
        let newPet: PetClass = await PetClass.create({
          state: petState.walk,
          elapsed: 0.0,
          moveDir: 0,
          eachKeyCountBeforeEat: 1,
          growth: IPetGrowth.egg,
        });
        pets.push(newPet);
        app.stage.addChild(newPet.animatedSprite as PIXI.DisplayObject);
        pets[pets.length - 1].animatedSprite.y =
          app.renderer.height - pets[0].animatedSprite.height;
        // set pet to center of screen
        pets[pets.length - 1].animatedSprite.x =
          (app.renderer.width - pets[0].animatedSprite.width) / 2;
      }
      for (let pet of pets) {
        if (
          keystrokeCount % pet.eachKeyCountBeforeEat === 0 &&
          pet.growth !== IPetGrowth.old
        ) {
          pet.feedPet({
            app,
            x: pet.animatedSprite.x,
            y: pet.animatedSprite.y - 10,
          });
        }
      }
    }
  });
}, 0);
