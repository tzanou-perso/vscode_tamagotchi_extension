import * as PIXI from "pixi.js";

import tamagotchiSheet0 from "../../../../../media/images/pets/tamagotchi/singles/0/tamagotchi.png";
import tamagotchiJson0 from "../../../../../media/images/pets/tamagotchi/singles/0/tamagotchi.json";

import tamagotchiSheet1 from "../../../../../media/images/pets/tamagotchi/singles/1/tamagotchi.png";
import tamagotchiJson1 from "../../../../../media/images/pets/tamagotchi/singles/1/tamagotchi.json";

import tamagotchiSheet2 from "../../../../../media/images/pets/tamagotchi/singles/2/tamagotchi.png";
import tamagotchiJson2 from "../../../../../media/images/pets/tamagotchi/singles/2/tamagotchi.json";

import tamagotchiSheet3 from "../../../../../media/images/pets/tamagotchi/singles/3/tamagotchi.png";
import tamagotchiJson3 from "../../../../../media/images/pets/tamagotchi/singles/3/tamagotchi.json";

import tamagotchiSheet4 from "../../../../../media/images/pets/tamagotchi/singles/4/tamagotchi.png";
import tamagotchiJson4 from "../../../../../media/images/pets/tamagotchi/singles/4/tamagotchi.json";

import tamagotchiSheet5 from "../../../../../media/images/pets/tamagotchi/singles/5/tamagotchi.png";
import tamagotchiJson5 from "../../../../../media/images/pets/tamagotchi/singles/5/tamagotchi.json";

import tamagotchiSheet6 from "../../../../../media/images/pets/tamagotchi/singles/6/tamagotchi.png";
import tamagotchiJson6 from "../../../../../media/images/pets/tamagotchi/singles/6/tamagotchi.json";

import tamagotchiSheet7 from "../../../../../media/images/pets/tamagotchi/singles/7/tamagotchi.png";
import tamagotchiJson7 from "../../../../../media/images/pets/tamagotchi/singles/7/tamagotchi.json";

import tamagotchiSheet8 from "../../../../../media/images/pets/tamagotchi/singles/8/tamagotchi.png";
import tamagotchiJson8 from "../../../../../media/images/pets/tamagotchi/singles/8/tamagotchi.json";
import { EPetState } from "../commons";
import { ITexture } from "../../sprite/sprite_element";
import Pet from "./pet";

export const tamagotchiesAnimation = [
  {
    animation: tamagotchiJson0,
    sheet: tamagotchiSheet0,
  },
  {
    animation: tamagotchiJson1,
    sheet: tamagotchiSheet1,
  },
  {
    animation: tamagotchiJson2,
    sheet: tamagotchiSheet2,
  },
  {
    animation: tamagotchiJson3,
    sheet: tamagotchiSheet3,
  },
  {
    animation: tamagotchiJson4,
    sheet: tamagotchiSheet4,
  },
  {
    animation: tamagotchiJson5,
    sheet: tamagotchiSheet5,
  },
  {
    animation: tamagotchiJson6,
    sheet: tamagotchiSheet6,
  },
  {
    animation: tamagotchiJson7,
    sheet: tamagotchiSheet7,
  },
  {
    animation: tamagotchiJson8,
    sheet: tamagotchiSheet8,
  },
];

export async function createOrUpdateAnimation({
  state,
  growth,
}: {
  state: EPetState;
  growth: number;
}): Promise<ITexture[]> {
  const type =
    state === EPetState.IDLE
      ? "idle"
      : state === EPetState.EATING
      ? "eat"
      : state === EPetState.WALK
      ? "walk"
      : "idle";
  const textureArray: ITexture[] = [];
  if (growth >= tamagotchiesAnimation.length) {
    growth = tamagotchiesAnimation.length - 1;
  }
  const animationJson = tamagotchiesAnimation[growth].animation;
  let frameTag = animationJson.meta.frameTags.find((tag) => tag.name === type);
  if (frameTag !== undefined) {
    const textLoaded = await PIXI.Assets.load(
      tamagotchiesAnimation[growth].sheet
    );
    for (let i = frameTag.from; i <= frameTag.to; i++) {
      // const row = `${type}.${i}` as keyof typeof bossArray.frames;
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
