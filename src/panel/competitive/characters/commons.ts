import * as PIXI from "pixi.js";
export enum EPetState {
  IDLE,
  EATING,
  SLEEPING,
  PLAYING,
  DEAD,
  WALK,
  ADULTTRANSITION,
}
export type IPetHeader = {
  xpBarContainer: PIXI.Graphics;
  xpBarFill: PIXI.Graphics;
};
