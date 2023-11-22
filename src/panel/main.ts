import * as PIXI from "pixi.js";
import Pet from "./competitive/characters/pets/pet";
import Boss from "./competitive/characters/boss/boss";
import { FilesSaved, BgCover } from "./competitive/commons";
import { WebviewMessage } from "../types/types";
import { newStroke } from "./competitive/main/events/event_new_stroke";
import { resetState } from "./competitive/main/events/event_reset_state";
import App from "./competitive/main/app";
import { launchQueuePetToKill } from "./competitive/main/queue/queue_pet";
import { launchQueueBossToKill } from "./competitive/main/queue/queue_boss";

let activeFile: FilesSaved;
declare global {
  interface VscodeStateApi {
    postMessage(message: WebviewMessage): void;
    setState(state: any): void;
    getState(): any;
  }
  const vscode: VscodeStateApi;
}

console.log("main.js loaded");

let basicText: PIXI.Text;

let comboCharacter: PIXI.Text;
setTimeout(async () => {
  vscode.postMessage({
    text: "isInitialized",
    command: "isInitialized",
  });

  let app = new App({
    activeFile,
    basicText,
    comboCharacter,
  });

  await app.init();

  setInterval(() => {
    if (app.activeFile === undefined) return;
    let petsJson = app.activeFile.pets.map((pet) => pet.toJson());

    let petJson = app.activeFile.petInGrow.toJson();

    let bossJson = app.activeFile.bosses.map((boss) => boss.toJson());

    let activeFileJson = JSON.stringify({
      numberOfCharacters: 0,
      pets: petsJson,
      petInGrow: petJson,
      keystrokeCount: app.activeFile.keystrokeCount,
      bosses: bossJson,
      bestCombo: app.activeFile.bestCombo,
    });
    // Update the saved state
    vscode.setState({ activeFile: activeFileJson });
  }, 100);

  window.addEventListener("message", async (event) => {
    console.log("event received", event.data);
    if (event.data.stroke !== undefined && app.activeFile !== undefined) {
      newStroke({
        event,
        app,
      });
    }

    if (event.data.resetState !== undefined) {
      app.clearWindowResizeEvent();
      app = await resetState({
        app,
      });
    } else if (
      event.data.type !== undefined &&
      event.data.type === "petDeath"
    ) {
      console.log("pet deathin", event.data);
      let petToKill = app.activeFile.pets[Number(event.data.message)];
      app.queuePetToKill.push({
        pet: petToKill,
        index: Number(event.data.message),
      });
      launchQueuePetToKill({ app });
    } else if (
      event.data.type !== undefined &&
      event.data.type === "bossDeath"
    ) {
      console.log("boss deathin", event.data);
      let bossToKill = app.activeFile.bosses[Number(event.data.message)];
      app.queueBossToKill.push({
        boss: bossToKill,
        index: Number(event.data.message),
      });
      launchQueueBossToKill({ app });
    } else if (
      event.data.type !== undefined &&
      event.data.type === "splashscreenFinished"
    ) {
      app.setPortalToBack();
    }
  });
}, 0);
