import App from "../app";
import * as PIXI from "pixi.js";

export function launchQueueBossToKill({ app }: { app: App }) {
  if (app.queueBossToKill.length > 0) {
    console.log("launching queue boss to kill", app.queueBossToKill);
    let bossToKill = app.queueBossToKill[0].boss;
    if (bossToKill === undefined) {
      app.queueBossToKill.shift();
      launchQueueBossToKill({ app });
      return;
    }
    bossToKill.ticker.stop();
    let index = app.queueBossToKill[0].index;
    app.activeFile.bosses.splice(index, 1);
    // give to other pets the right index
    for (let boss of app.activeFile.bosses) {
      boss.indexInActiveFile = app.activeFile.bosses.indexOf(boss);
    }
    app.stage.removeChild(bossToKill as PIXI.DisplayObject);
    bossToKill.destroy();
    app.queueBossToKill.shift();
    launchQueueBossToKill({ app });
  }
}
