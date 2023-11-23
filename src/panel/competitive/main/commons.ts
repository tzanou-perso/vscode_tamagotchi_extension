import Boss from "../characters/boss/boss";
import { EPetState } from "../characters/commons";
import Pet from "../characters/pets/pet";
import { DEFAULT_PET, FilesSaved } from "../commons";
import * as PIXI from "pixi.js";
import App from "./app";
import { bossList } from "../characters/boss/boss";

export async function addBoss({
  app,
  pos,
  bossName,
}: {
  app: App;
  pos?: { x?: number; y?: number };
  bossName?: string;
}) {
  // random number between 1 and the number of bosses
  let randomNumber = Math.floor(Math.random() * Object.keys(bossList).length);
  console.log("randomNumber", randomNumber, Object.keys(bossList).length);
  let bossText = await Boss.createAnimation({
    bossName: bossName ?? "boss" + randomNumber,
    state: EPetState.WALK,
  });

  const boss = new Boss({
    textures: bossText,
    state: EPetState.WALK,
    moveDir: 1,
    health: 15,
    maxHealth: 10,
    speed: Math.random() + 0.5,
    app: app,
    attackSpeed: 0,
    strength: 1,
    enemies: app.activeFile.pets,
    decreaseHealthMultiplier: 1,
    indexInActiveFile: app.activeFile.bosses.length,
    bossName: bossName ?? "boss" + randomNumber,
    settingMaxEnemiesToAttack: 1,
    x: pos?.x,
    y: pos?.y,
  });
  app.activeFile.bosses.push(boss);
  return boss;
  // boss in random range x inside the screen
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
    if (app.activeFile.petInGrow.healthAmountText) {
      app.activeFile.petInGrow.healthAmountText.text = `Health: ${app.activeFile.petInGrow.health} / ${app.activeFile.petInGrow.maxHealth}`;
    }

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
