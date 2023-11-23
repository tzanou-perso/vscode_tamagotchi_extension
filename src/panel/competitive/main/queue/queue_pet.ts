import Pet from "../../characters/pets/pet";
import App from "../app";
import * as PIXI from "pixi.js";

export async function launchQueuePetToKill({ app }: { app: App }) {
  if (!app.queuePetRunning) {
    let petToRemove = app.activeFile.pets.filter((pet) => pet.health <= 0);
    if (petToRemove.length === 0) return;
    app.queuePetRunning = true;

    let petToKill = petToRemove[0];
    console.log(
      "launching queue pet to kill | index : ",
      petToKill.indexInActiveFile,
      " | length : ",
      app.activeFile.pets.length
    );
    // petToKill.ticker.stop();
    // app.stage.removeChild(petToKill as PIXI.DisplayObject);
    petToKill.destroy();
    app.queuePetRunning = false;
    console.log(
      "Queue finished",
      app.activeFile.pets.length,
      app.activeFile.pets
    );
  }
}
