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
  bestCombo: number;
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
  clickScore: 1,
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

export type BgCover = {
  container: PIXI.Container<PIXI.DisplayObject>;
  doResize: () => void;
};

/*
 *  PixiJS Background Cover/Contain Script
 *   Returns object
 * . {
 *       container: PixiJS Container
 * .     doResize: Resize callback
 *   }
 *   ARGS:
 *   bgSize: Object with x and y representing the width and height of background. Example: {x:1280,y:720}
 *   inputSprite: Pixi Sprite containing a loaded image or other asset.  Make sure you preload assets into this sprite.
 *   type: String, either "cover" or "contain".
 *   forceSize: Optional object containing the width and height of the source sprite, example:  {x:1280,y:720}
 */
export function background(
  bgSize: { x: number; y: number },
  inputSprite: PIXI.Sprite,
  type: string,
  forceSize: { x: number; y: number } | undefined = undefined
): BgCover {
  var sprite = inputSprite;
  var bgContainer = new PIXI.Container();
  var mask = new PIXI.Graphics()
    .beginFill(0x8bc5ff)
    .drawRect(0, 0, bgSize.x, bgSize.y)
    .endFill();
  bgContainer.mask = mask;
  bgContainer.addChild(mask as PIXI.DisplayObject);
  bgContainer.addChild(sprite as PIXI.DisplayObject);

  function resize() {
    var sp = { x: sprite.width, y: sprite.height };
    if (forceSize) sp = forceSize;
    var winratio = bgSize.x / bgSize.y;
    var spratio = sp.x / sp.y;
    var scale = 1;
    var pos = new PIXI.Point(0, 0);

    if (type === "coverFromBottom") {
      if (winratio > spratio) {
        scale = bgSize.x / sp.x;
      } else {
        scale = bgSize.y / sp.y;
        pos.x = (bgSize.x - sp.x * scale) / 2;
      }
      pos.y = bgSize.y - sp.y * scale; // Position sprite at the bottom of the screen
      // sprite.anchor.set(1, 1);
    }
    if (type === "cover") {
      if (type == "cover" ? winratio > spratio : winratio < spratio) {
        //photo is wider than background
        scale = bgSize.x / sp.x;
        pos.y = -(sp.y * scale - bgSize.y) / 2;
      } else {
        //photo is taller than background
        scale = 1;
        pos.x = -(sp.x * scale - bgSize.x) / 2;
      }
    }
    sprite.scale = new PIXI.Point(scale, scale);
    sprite.position = pos;
  }

  resize();
  const res: BgCover = {
    container: bgContainer,
    doResize: resize,
  };
  return res;
}
