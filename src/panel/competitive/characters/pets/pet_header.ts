import * as PIXI from "pixi.js";
export default class PetHeader {
  xpBarContainer: PIXI.Graphics;
  xpBarFill: PIXI.Graphics;
  width: number;
  height: number;
  maxXp: number;
  constructor({
    width,
    height,
    maxXp,
  }: {
    width: number;
    height: number;
    maxXp: number;
  }) {
    this.xpBarContainer = new PIXI.Graphics();
    this.xpBarFill = new PIXI.Graphics();
    this.width = width;
    this.height = height;
    this.maxXp = maxXp;
    this.xpBarContainer.addChild(this.xpBarFill as PIXI.DisplayObject);

    this.xpBarContainer.beginFill(0x000000);
    this.xpBarContainer.drawRect(0, 0, this.width, this.height);
    this.xpBarContainer.endFill();

    // fill the xp bar with green color based on the xp value
    this.xpBarFill.beginFill(0x00ff00);
    this.xpBarFill.drawRect(0, 0, this.width, this.height);
    this.xpBarFill.endFill();
    this.xpBarFill.width = 0;
  }

  updateXpBarFill(xp: number) {
    this.xpBarFill.width = this.width * (xp / this.maxXp);
  }

  getContainer() {
    return this.xpBarContainer;
  }
}
