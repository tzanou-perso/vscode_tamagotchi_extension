import App from "../app";
import * as PIXI from "pixi.js";
export function launchQueueBossToKill({ app }: { app: App }) {
  if (!app.queueBossRunning) {
    let bossToRemove = app.activeFile.bosses.filter((pet) => pet.health <= 0);
    if (bossToRemove.length === 0) return;
    app.queueBossRunning = true;

    let bossToKill = bossToRemove[0];
    console.log(
      "launching queue pet to kill | index : ",
      bossToKill.indexInActiveFile,
      " | length : ",
      app.activeFile.bosses.length
    );
    bossToKill.destroy();
    app.queueBossRunning = false;
    console.log(
      "Queue boss finished",
      app.activeFile.bosses.length,
      app.activeFile.bosses
    );
  }
}
