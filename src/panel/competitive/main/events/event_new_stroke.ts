import Pet from "../../characters/pets/pet";
import { COOLDOWN_COMBO, DEFAULT_PET, FilesSaved } from "../../commons";
import * as PIXI from "pixi.js";
import { addBoss, setAdult } from "../commons";
import TextTimer from "../../text_timer";
import App from "../app";
let timerBetweenStrokes: NodeJS.Timeout;
let bossSpawnTime: number = 0;
const timeBetweenBossSpawnInSeconds = 60;
let lastComboText: TextTimer | undefined;
const timeBetweenCombo: {
  startTime: number | undefined;
  endTime: number | undefined;
} = {
  startTime: undefined,
  endTime: undefined,
};

export async function newStroke({
  event,
  app,
}: {
  event: MessageEvent<any>;
  app: App;
}) {
  if (app.activeFile.petInGrow.isAdult) {
    let textures = await Pet.createAnimation({
      state: DEFAULT_PET.state,
      growth: DEFAULT_PET.growth,
    });

    let newPet: Pet = new Pet({
      textures: textures,
      ...DEFAULT_PET,
      app: app,
    });

    newPet.speed = 0.5 + Math.random();

    app.stage.addChild(newPet as PIXI.DisplayObject);

    newPet.setPos({
      x: app.renderer.width / 2,
      y: app.renderer.height / 2 - 5,
    });
  }

  app.activeFile.numberOfCharacters += event.data.stroke;

  app.activeFile.keystrokeCount += event.data.stroke;

  app.basicText.text = `All: ${app.activeFile.keystrokeCount}`;

  if (app.activeFile.numberOfCharacters > app.activeFile.bestCombo) {
    app.activeFile.bestCombo = app.activeFile.numberOfCharacters;
    app.comboCharacter.text = `Best Combo: ${app.activeFile.bestCombo}`;
  }

  if (app.activeFile.numberOfCharacters > 0) {
    // dont add boss if the last one spawned less than timeBetweenBossSpawnInSeconds
    let currentTime = Date.now() / 1000; // Convert to seconds
    if (currentTime >= bossSpawnTime + timeBetweenBossSpawnInSeconds) {
      if (
        app.activeFile.pets.length > 9 &&
        app.activeFile.bosses.length === 0 &&
        app.activeFile.pets.filter((pet) => pet.health < pet.maxHealth)
          .length === 0
      ) {
        addBoss({
          app,
        });
        bossSpawnTime = currentTime;
      }
    }

    if (app.activeFile.bosses.length === 0) {
      for (let pet of app.activeFile.pets) {
        pet.giveBackHealth(1);
      }
    }

    app.activeFile.petInGrow.giveXp(1);

    if (lastComboText !== undefined) {
      lastComboText.finish(0);
    }

    const comboText = new TextTimer({
      app,
      text: `+ ${app.activeFile.numberOfCharacters}`,
      timeToAnimInSeconds: COOLDOWN_COMBO / 1000,
      animScale: { start: 0.5, end: 1 },
      animAlpha: false,
      translateAnim: { x: 60, y: -50 },
      style: new PIXI.TextStyle({
        fill: "#e4e425", // yellow
        fontSize: 40,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness: 4,
        wordWrap: true,
        wordWrapWidth: 440,
      }),
    });

    comboText.anchor.set(0.5, 0.5);

    comboText.x = app.activeFile.petInGrow.x;

    comboText.y = app.activeFile.petInGrow.y - app.activeFile.petInGrow.height;

    lastComboText = comboText;

    if (app.activeFile.petInGrow.isAdult) {
      setAdult({ withTransition: false, app });
    }

    //calculate time in seconds between 2 events
    if (timeBetweenCombo.startTime !== undefined) {
      timeBetweenCombo.endTime = Date.now();
      let timeBetweenComboInSeconds =
        (timeBetweenCombo.endTime - timeBetweenCombo.startTime) / 1000;

      if (timeBetweenComboInSeconds < 0.168) {
        app.activeFile.petInGrow.clickScore += 0.01;
      }
    }

    timeBetweenCombo.startTime = Date.now();
    // if no new event detected in 2 seconds reset combo else reset the timer
    clearTimeout(timerBetweenStrokes);

    timerBetweenStrokes = setTimeout(() => {
      timeBetweenCombo.startTime = undefined;
      timeBetweenCombo.endTime = undefined;
      app.activeFile.numberOfCharacters = 0;

      if (app.activeFile.petInGrow.growth !== 0) {
        setAdult({ withTransition: true, app });
      }
    }, COOLDOWN_COMBO);
  }
}
