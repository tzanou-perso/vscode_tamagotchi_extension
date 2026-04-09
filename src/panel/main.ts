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
import { addBoss } from "./competitive/main/commons";

let activeFile!: FilesSaved;
declare global {
  interface VscodeStateApi {
    postMessage(message: WebviewMessage): void;
    setState(state: any): void;
    getState(): any;
  }
  const vscode: VscodeStateApi;
}

console.log("main.js loaded");

let basicText!: PIXI.Text;

let comboCharacter!: PIXI.Text;
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

  // Merged housekeeping loop. Was two setInterval at 100ms each (20 wakeups/sec)
  // doing full JSON serialization on every tick — now a single 500ms interval
  // that only serializes when the saved state actually changed.
  let lastSavedJson: string | undefined;
  setInterval(() => {
    if (app.activeFile === undefined) {return;}

    if (
      app.activeFile.bosses.filter((boss) => boss.alpha === 0).length ===
      app.activeFile.bosses.length
    )
      {launchQueueBossToKill({ app });}
    if (app.activeFile.bosses.length === 0) {launchQueuePetToKill({ app });}

    if (app.activeFile.pets.filter((pet) => pet.health <= 0).length !== 0)
      {return;}

    let petDefined = app.activeFile.pets.filter((pet) => pet !== undefined);
    let petsJson = petDefined.map((pet) => pet.toJson());
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

    if (activeFileJson !== lastSavedJson) {
      lastSavedJson = activeFileJson;
      vscode.setState({ activeFile: activeFileJson });
    }
  }, 500);

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
      event.data.type === "splashscreenFinished"
    ) {
      app.setPortalToBack();
    } else if (event.data.spawnRandomBoss !== undefined) {
      let positionX = Math.floor(Math.random() * app.renderer.width);
      if (event.data.spawnRandomBoss === "Random Boss") {
        const boss = await addBoss({
          app,
          pos: { x: positionX, y: app.renderer.height },
        });
      } else if (event.data.spawnRandomBoss === "Thaurus Boss") {
        const boss = await addBoss({
          app,
          pos: { x: positionX, y: app.renderer.height },
          bossName: "boss0",
        });
      } else if (event.data.spawnRandomBoss === "Flame Boss") {
        const boss = await addBoss({
          app,
          pos: { x: positionX, y: app.renderer.height },
          bossName: "boss1",
        });
      }
    }
  });
}, 0);
