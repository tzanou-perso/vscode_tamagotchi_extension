import * as PIXI from "pixi.js";
import { DEFAULT_PET, FilesSaved } from "../../commons";
import Pet from "../../characters/pets/pet";
import App from "../app";
import portalImages from "../../../../../media/images/portal.png";

export async function resetState({ app }: { app: App }) {
  app.activeFile.petInGrow.destroy;
  for (let pet of app.activeFile.pets) {
    pet.ticker.stop();
    pet.destroy;
  }
  app.stage.removeChildren();
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
  newPet.speed =
    app.settingMinPetSpeed +
    Math.random() * (app.settingMaxPetSpeed - app.settingMinPetSpeed);
  app.activeFile = {
    numberOfCharacters: 0,
    fileId: "",
    pets: [],
    petInGrow: newPet,
    keystrokeCount: 0,
    bosses: [],
    bestCombo: 0,
  };

  let activeFileJSON = activeFileToJson({ activeFile: app.activeFile });

  vscode.setState({ activeFile: activeFileJSON });
  PIXI.Assets.unload(portalImages);
  return await new App({
    activeFile: app.activeFile,
    basicText: app.basicText,
    comboCharacter: app.comboCharacter,
  }).init();
}

function activeFileToJson({ activeFile }: { activeFile: FilesSaved }) {
  let petsJson = activeFile.pets.map((pet) => pet.toJson());

  let petJson = activeFile.petInGrow.toJson();

  let bossJson = activeFile.bosses.map((boss) => boss.toJson());

  let activeFileJson = JSON.stringify({
    numberOfCharacters: 0,
    pets: petsJson,
    petInGrow: petJson,
    keystrokeCount: activeFile.keystrokeCount,
    bosses: bossJson,
    bestCombo: activeFile.bestCombo,
  });

  console.log("file saved", activeFileJson);
  return activeFileJson;
}
