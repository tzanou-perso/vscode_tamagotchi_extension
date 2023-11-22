import Pet from "../../characters/pets/pet";
import App from "../app";
import * as PIXI from "pixi.js";

export function launchQueuePetToKill({ app }: { app: App }) {
  if (app.queuePetToKill.length > 0) {
    console.log("launching queue pet to kill", app.queuePetToKill);
    let petToKill = app.queuePetToKill[0].pet;
    if (petToKill === undefined) {
      app.queuePetToKill.shift();
      launchQueuePetToKill({ app });
      return;
    }
    petToKill.ticker.stop();
    let index = app.queuePetToKill[0].index;
    app.activeFile.pets.splice(index, 1);
    // give to other pets the right index
    for (let pet of app.activeFile.pets) {
      pet.indexInActiveFile = app.activeFile.pets.indexOf(pet);
    }
    app.stage.removeChild(petToKill as PIXI.DisplayObject);
    petToKill.destroy();
    app.queuePetToKill.shift();
    launchQueuePetToKill({ app });
  }
}
