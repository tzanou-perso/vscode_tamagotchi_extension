import { EPetState, moveToPosCurved } from "../commons";
import Pet from "./pet";
import * as PIXI from "pixi.js";
import { moveTrail, removeTrail } from "./trail";

let particleImgLoded: PIXI.Texture | undefined;

export async function update({ pet }: { pet: Pet }): Promise<void> {
  move(pet);
  await petTransition(pet);
}

function move(pet: Pet) {
  if (pet.moveDir === +1 && pet.state === EPetState.WALK && pet.isAdult) {
    pet.scale.x = +1 * pet.clickScore;
    pet.x += pet.speed;
    if (
      pet.app !== undefined &&
      pet.x >= pet.app.renderer.width - pet.width / 2
    ) {
      pet.moveDir = -1;
      pet.elapsed = 0.0;
    }
  }
  // Update the sprite's to let him walk across the screen horizontally
  // from right to left if move is -1 and he is not at the left side of the screen
  else if (pet.moveDir === -1) {
    // transform pet to flip horizontally
    pet.scale.x = -1 * pet.clickScore;
    // Move the sprite to the left
    pet.x -= pet.speed;
    if (pet.x <= 0 + pet.width / 2) {
      pet.moveDir = +1;
      pet.elapsed = 0.0;
    }
  }
}

async function petTransition(pet: Pet) {
  if (pet.state === EPetState.ADULTTRANSITION) {
    // Move the trail
    await moveTrail(pet);

    // tint red
    // pet.tint = "#707070";
    pet.anchor.set(0.5, 0.5);
    const moveToX = 5 + 41;
    const moveToY = pet.app.renderer.height - 15 - pet.height / 2;
    if (pet.isInTransition === false) {
      moveToPosCurved({
        obj: pet,
        targetX: moveToX,
        targetY: moveToY,
        duration: 1000,
        controlX: pet.x - 20,
        controlY: pet.y - pet.height,
        tolerance: 5,
        startTime: pet.startTimeToPosAnim,
      });
      pet.alpha = 1;
    } else {
      pet.alpha += 0.02;
    }
    pet.rotation += 0.1;

    // if the timer is not set, set it
    if (
      Math.round(pet.y) <= Math.round(moveToY) + 5 &&
      Math.round(pet.y) >= Math.round(moveToY) - 5 &&
      Math.round(pet.x) <= Math.round(moveToX) + 5 &&
      Math.round(pet.x) >= Math.round(moveToX) - 5 &&
      pet.isInTransition === false
    ) {
      pet.alpha = 1;
      pet.scale.set(1 * pet.clickScore, 1 * pet.clickScore);
      removeTrail(pet);
      pet.isInTransition = true;
      pet.setToAdult();
    }
  } else {
    if (pet.isAdult) {
      if (pet.y !== pet.app.renderer.height) {
        pet.y += pet.speedFall;
      }
    }
  }
}
