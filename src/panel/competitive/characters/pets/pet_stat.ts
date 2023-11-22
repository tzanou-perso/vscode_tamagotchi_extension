import * as PIXI from "pixi.js";
import Pet from "./pet";
import TextTimer from "../../text_timer";
import { tamagotchiesAnimation } from "./pet_anim";
import { DEFAULT_PET } from "../../commons";
import { EPetState } from "../commons";

export function calculateLevelMultiplier(level: number) {
  // Adjust the base value for the initial growth
  const initialBase = 1;

  const laterBase = 0.26;

  // Threshold level after which the multiplier remains constant
  const thresholdLevel = 0;

  // Calculate the level multiplier using different formulas before and after the threshold
  let multiplier;
  if (level <= thresholdLevel) {
    multiplier = Math.round(Math.pow(level / 50 + 1, initialBase));
  } else {
    multiplier = Math.round(Math.pow(level, laterBase));
  }

  return multiplier;
}

export function giveBackHealth(pet: Pet, amount: number): void {
  let text = "";
  if (pet.health === pet.maxHealth) return;

  if (pet.health + amount > pet.maxHealth) {
    pet.health = pet.maxHealth;
    `MAX`;
  } else {
    pet.health += amount;
    `+ ${amount}`;
  }
  pet.petHeader.updateHealthBarFill(pet.health, pet.scale.x);
  if (pet.health === pet.maxHealth) {
    pet.petHeader.healthBarContainer.visible = false;
    pet.petHeader.headerContainer.visible = false;
    text = `MAX`;
  }

  const comboText = new TextTimer({
    app: pet.app,
    text: text,
    timeToAnimInSeconds: 0.5,
    animScale: { start: 1, end: 1 },
    animAlpha: false,
    translateAnim: { x: 30, y: -25 },
    style: new PIXI.TextStyle({
      fill: "#3BFF01", // yellow
      fontSize: 20,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 0,
      wordWrap: true,
      wordWrapWidth: 800,
      fontWeight: "bolder",
    }),
  });

  pet.app.stage.addChild(comboText as PIXI.DisplayObject);

  comboText.x = pet.x;
  comboText.y = pet.y - pet.height;
}

export function onHitByAttack(pet: Pet): void {
  pet.health -= 1;

  const comboText = new TextTimer({
    app: pet.app,
    text: `- 1`,
    timeToAnimInSeconds: 0.5,
    animScale: { start: 1, end: 1 },
    animAlpha: false,
    translateAnim: { x: 30, y: -25 },
    style: new PIXI.TextStyle({
      fill: "#FF2D01", // yellow
      fontSize: 20,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 0,
      wordWrap: true,
      wordWrapWidth: 800,
      fontWeight: "bolder",
    }),
  });

  pet.app.stage.addChild(comboText as PIXI.DisplayObject);

  comboText.x = pet.x;
  comboText.y = pet.y - pet.height;

  if (pet.health > 0) {
    pet.petHeader.healthBarContainer.visible = true;
    pet.petHeader.headerContainer.visible = true;
    pet.petHeader.updateHealthBarFill(pet.health, pet.scale.x);
  } else {
    window.postMessage({
      type: "petDeath",
      message: pet.indexInActiveFile,
    });
  }
  console.log("onHitByAttack", pet.health, pet.maxHealth);
}

export function giveXp(pet: Pet, xp: number): void {
  pet.xp += xp;
  if (pet.xp > pet.maxXp) {
    pet.growth += 1;
    pet.maxHealth = pet.growth === 0 ? 0 : pet.growth * DEFAULT_PET.maxHealth;
    pet.health = pet.growth === 0 ? 0 : pet.growth * DEFAULT_PET.health;

    if (tamagotchiesAnimation.length <= pet.growth) {
      pet.petHeader.xpBarContainer.visible = false;
      if (pet.health === pet.maxHealth) {
        pet.petHeader.healthBarContainer.visible = false;
        pet.petHeader.headerContainer.visible = false;
      } else {
        pet.petHeader.healthBarContainer.visible = true;
        pet.petHeader.headerContainer.visible = true;
      }
      pet.petHeader.updateHealthBarFill(pet.health, pet.scale.x, pet.maxHealth);
      pet.replacePetHeader();
      pet.startTimeToPosAnim = Date.now();
      console.log("setToAdultQSQSQSQS");
      pet.state = EPetState.ADULTTRANSITION;
      pet.isAdult = true;
    } else {
      pet.maxXp = pet.maxXpLogarithm;
      pet.xp = 0;
      pet.updateAnimations();
    }
  }
  pet.replacePetHeader();
  pet.petHeader.updateXpBarFill(pet.xp, pet.scale.x, pet.maxXp);
}

export function setToAdult(pet: Pet): void {
  setTimeout(() => {
    let score = pet.clickScore >= 2 ? 2 : pet.clickScore;
    pet.scale.set(1 * score, 1 * score);
    pet.alpha = 1;
    pet.anchor.set(0.5, 1);
    pet.rotation = 0;
    pet.y = pet.app.renderer.height - 10;

    pet.elapsed = 5;
    // return;
    pet.isAdult = true;

    pet.state = EPetState.WALK;
    pet.isInTransition = false;
    pet.moveDir = +1;
    pet.petHeader.xpBarContainer.visible = false;
    if (pet.health === pet.maxHealth) {
      pet.petHeader.healthBarContainer.visible = false;
      pet.petHeader.headerContainer.visible = false;
    } else {
      pet.petHeader.healthBarContainer.visible = true;
      pet.petHeader.headerContainer.visible = true;
    }
    pet.replacePetHeader();
    pet.petHeader.updateHealthBarFill(pet.health, pet.scale.x);
    pet.updateAnimations();
  }, 1000);
}
