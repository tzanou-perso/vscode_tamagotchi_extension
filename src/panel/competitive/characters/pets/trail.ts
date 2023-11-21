import * as PIXI from "pixi.js";
import * as particles from "@pixi/particle-emitter";
import Pet from "./pet";
import particleImg from "../../../../../media/images/particle.png";
import trailConfig from "../../../../../media/particles/pet/emitter.json";

let particleImgLoaded: PIXI.Texture | undefined;
let emitter: particles.Emitter | undefined;
let elapsed: number;

export async function moveTrail(pet: Pet) {
  if (pet.trail === undefined) {
    pet.trail = new PIXI.Container(); // Limit the trail to 100 particles
    pet.app.stage.addChildAt(pet.trail as PIXI.DisplayObject, 4);
  }
  if (pet.trail !== undefined && !pet.trail.destroyed) {
    if (emitter === undefined) {
      emitter = getTrailEmitter({ pet });
      console.log("emitter loaded");
      // Update the emitter
      emitter.emit = true;
      emitter.addAtBack = true;
      elapsed = Date.now();
    }
    let now = Date.now();
    emitter.updateOwnerPos(pet.x, pet.y);
    emitter.update((now - elapsed) * 0.001);
    console.log(
      "emitter updated",
      emitter,
      pet.x,
      pet.y,
      pet.trail.x,
      pet.trail.y
    );
    elapsed = now;
  }
}

export function removeTrail(pet: Pet) {
  if (pet.trail !== undefined && !pet.trail.destroyed) {
    pet.trail.removeChildren();
    pet.app.stage.removeChild(pet.trail as PIXI.DisplayObject);
    pet.trail.destroy();
    if (emitter !== undefined) {
      emitter.emit = false;
      emitter.destroy();
      emitter = undefined;
    }
  }
}

export function getTrailEmitter({ pet }: { pet: Pet }) {
  // Create a particle emitter
  return new particles.Emitter(
    pet.trail! as PIXI.Container<PIXI.DisplayObject>, // The container to add the particles to// The textures to use for the particles
    particles.upgradeConfig(trailConfig, [particleImg])
  );
}
