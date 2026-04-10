import * as PIXI from "pixi.js";

import { EPetState } from "../commons";
import { ITexture } from "../../sprite/sprite_element";

// Auto-discover all PNG and JSON files in the singles directory
const pngContext = require.context(
  "../../../../../media/images/pets/tamagotchi/singles/",
  true,
  /\.png$/
);
const jsonContext = require.context(
  "../../../../../media/images/pets/tamagotchi/singles/",
  true,
  /\.json$/
);

// Build tamagotchiesAnimation: for each stage, one JSON + multiple PNG variants
// Keys look like "./0/tamagotchi.png", "./0/tamagotchi_v2.png", "./1/tamagotchi.json", etc.

type StageData = {
  animation: any;
  sheets: string[]; // array of PNG variants (data URLs from url-loader)
};

function buildAnimationData(): StageData[] {
  const stageMap = new Map<number, StageData>();

  // Load JSONs (one per stage)
  for (const key of jsonContext.keys()) {
    const match = key.match(/^\.\/(\d+)\//);
    if (!match) {continue;}
    const stageIndex = parseInt(match[1], 10);
    if (!stageMap.has(stageIndex)) {
      stageMap.set(stageIndex, { animation: null, sheets: [] });
    }
    const jsonModule = jsonContext(key);
    stageMap.get(stageIndex)!.animation = jsonModule.default || jsonModule;
  }

  // Load PNGs (multiple per stage)
  for (const key of pngContext.keys()) {
    const match = key.match(/^\.\/(\d+)\//);
    if (!match) {continue;}
    const stageIndex = parseInt(match[1], 10);
    if (!stageMap.has(stageIndex)) {
      stageMap.set(stageIndex, { animation: null, sheets: [] });
    }
    const pngModule = pngContext(key);
    stageMap.get(stageIndex)!.sheets.push(pngModule.default || pngModule);
  }

  // Convert to sorted array
  const maxStage = Math.max(...stageMap.keys());
  const result: StageData[] = [];
  for (let i = 0; i <= maxStage; i++) {
    const data = stageMap.get(i);
    if (data) {
      result.push(data);
    }
  }

  return result;
}

export const tamagotchiesAnimation: StageData[] = buildAnimationData();

export function getVariantCount(growth: number): number {
  if (growth >= tamagotchiesAnimation.length) {
    growth = tamagotchiesAnimation.length - 1;
  }
  return tamagotchiesAnimation[growth].sheets.length;
}

export function pickRandomVariant(growth: number): number {
  return Math.floor(Math.random() * getVariantCount(growth));
}

export async function createOrUpdateAnimation({
  state,
  growth,
  variant = 0,
}: {
  state: EPetState;
  growth: number;
  variant?: number;
}): Promise<ITexture[]> {
  const type =
    state === EPetState.IDLE
      ? "idle"
      : state === EPetState.EATING
      ? "eat"
      : state === EPetState.WALK
      ? "walk"
      : state === EPetState.AFFRAID
      ? "affraid"
      : "idle";
  const textureArray: ITexture[] = [];
  if (growth >= tamagotchiesAnimation.length) {
    growth = tamagotchiesAnimation.length - 1;
  }
  const stageData = tamagotchiesAnimation[growth];
  const animationJson = stageData.animation;

  // Clamp variant to available sheets
  const safeVariant = variant < stageData.sheets.length ? variant : 0;
  const sheetToUse = stageData.sheets[safeVariant];

  let frameTag = animationJson.meta.frameTags.find((tag: any) => tag.name === type);
  if (frameTag !== undefined) {
    const textLoaded = await PIXI.Assets.load(sheetToUse);
    for (let i = frameTag.from; i <= frameTag.to; i++) {
      const bossArrayFrame = animationJson.frames[i];
      let frame = new PIXI.Rectangle(
        bossArrayFrame.frame.x,
        bossArrayFrame.frame.y,
        bossArrayFrame.frame.w,
        bossArrayFrame.frame.h
      );
      let text = new PIXI.Texture(textLoaded.baseTexture, frame);
      textureArray.push({ texture: text, time: bossArrayFrame.duration });
    }
  }

  return textureArray;
}
