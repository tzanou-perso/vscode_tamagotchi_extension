import Boss from "./characters/boss/boss";
import { EPetState } from "./characters/commons";
import Pet from "./characters/pets/pet";
import Portal, { EPortalState } from "./portal/portal";
import * as PIXI from "pixi.js";

export type FilesSaved = {
  numberOfCharacters: number;
  fileId: string;
  petInGrow: Pet;
  pets: Pet[];
  bosses: Boss[];
  keystrokeCount: number;
};

export const DEFAULT_PET = {
  elapsed: 0.0,
  moveDir: 0,
  growth: 0,
  xp: 0,
  maxXp: 2,
  health: 1,
  maxHealth: 1,
  speed: 1,
  state: EPetState.IDLE,
  isAdult: false,
  speedFall: 1,
  attackSpeed: 1,
  strength: 1,
  indexInActiveFile: 0,
};

export const COOLDOWN_COMBO = 800;

const randomSpeed = (min: number, max: number) => {
  return Math.floor(Math.random() * 3) + 1;
};
/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export default class CommonsCompetitiveSingleton {
  private static instance: CommonsCompetitiveSingleton;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  constructor() {
    if (CommonsCompetitiveSingleton.instance) {
      throw new Error("Error - use Singleton.getInstance()");
    }
  }

  static getInstance(): CommonsCompetitiveSingleton {
    CommonsCompetitiveSingleton.instance =
      CommonsCompetitiveSingleton.instance || new CommonsCompetitiveSingleton();
    return CommonsCompetitiveSingleton.instance;
  }

  /**
   * Finally, any singleton should define some business logic, which can be
   * executed on its instance.
   */
}
