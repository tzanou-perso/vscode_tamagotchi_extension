import Boss from "../characters/boss/boss";
import { EPetState } from "../characters/commons";
import Pet from "../characters/pets/pet";
import { DEFAULT_PET, FilesSaved } from "../commons";
import * as PIXI from "pixi.js";
import App from "./app";

export async function addBoss({ app }: { app: App }) {
  let bossText = await Boss.createAnimation({
    state: EPetState.WALK,
  });
  const boss = new Boss({
    textures: bossText,
    state: EPetState.WALK,
    moveDir: 1,
    health: 20,
    maxHealth: 10,
    speed: Math.random() + 0.5,
    app: app,
    attackSpeed: 0,
    strength: 0,
    enemies: app.activeFile.pets,
    decreaseHealthMultiplier: 1,
    indexInActiveFile: app.activeFile.bosses.length,
  });
  app.activeFile.bosses.push(boss);
  app.stage.addChild(boss as PIXI.DisplayObject);
  boss.x = app.renderer.width / 2 - boss.width;
  boss.y = app.renderer.height;
}

export async function setAdult({
  withTransition,
  app,
}: {
  withTransition: boolean;
  app: App;
}) {
  if (withTransition) {
    app.activeFile.petInGrow.petHeader.xpBarContainer.visible = false;
    if (
      app.activeFile.petInGrow.health === app.activeFile.petInGrow.maxHealth
    ) {
      app.activeFile.petInGrow.petHeader.healthBarContainer.visible = false;
      app.activeFile.petInGrow.petHeader.headerContainer.visible = false;
    } else {
      app.activeFile.petInGrow.petHeader.healthBarContainer.visible = true;
      app.activeFile.petInGrow.petHeader.headerContainer.visible = true;
    }
    app.activeFile.petInGrow.petHeader.headerContainer.width =
      20 / app.activeFile.petInGrow.scale.x;
    app.activeFile.petInGrow.replacePetHeader();
    app.activeFile.petInGrow.petHeader.updateHealthBarFill(
      app.activeFile.petInGrow.health,
      app.activeFile.petInGrow.scale.x,
      app.activeFile.petInGrow.maxHealth
    );

    if (app.activeFile.petInGrow !== undefined) {
      app.activeFile.petInGrow.y =
        app.activeFile.petInGrow.y - app.activeFile.petInGrow.height / 2;
    }
    app.activeFile.petInGrow.startTimeToPosAnim = Date.now();
    app.activeFile.petInGrow.state = EPetState.ADULTTRANSITION;
  } else {
    app.activeFile.petInGrow.setToAdult();
  }
  app.activeFile.petInGrow.indexInActiveFile = app.activeFile.pets.length;
  app.activeFile.pets.push(app.activeFile.petInGrow);

  const lastPet = app.activeFile.petInGrow;

  let textures = await Pet.createAnimation({
    state: DEFAULT_PET.state,
    growth: DEFAULT_PET.growth,
  });

  app.activeFile.petInGrow = new Pet({
    textures: textures,
    ...DEFAULT_PET,
    app: app,
  });

  app.activeFile.petInGrow.speed = 0.5 + Math.random();

  console.log("new random speed", app.activeFile.petInGrow.speed);

  app.activeFile.petInGrow.play();

  app.stage.addChild(app.activeFile.petInGrow as PIXI.DisplayObject);

  app.stage.swapChildren(
    app.activeFile.petInGrow as PIXI.DisplayObject,
    lastPet as PIXI.DisplayObject
  );

  app.activeFile.petInGrow.setPos({
    x: app.renderer.width / 2,
    y: app.renderer.height / 2 - 5,
  });
}
