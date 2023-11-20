import * as PIXI from "pixi.js";
export default class PetHeader {
  xpBarContainer: PIXI.Graphics;
  xpBarFill: PIXI.Graphics;
  healthBarContainer: PIXI.Graphics;
  healthBarFill: PIXI.Graphics;
  width: number;
  height: number;
  maxXp: number;
  maxHealth: number;
  health: number;
  headerContainer: PIXI.Graphics;
  constructor({
    width,
    height,
    maxXp,
    health,
    maxHealth,
  }: {
    width: number;
    height: number;
    maxXp: number;
    health: number;
    maxHealth: number;
  }) {
    this.xpBarContainer = new PIXI.Graphics();
    this.xpBarFill = new PIXI.Graphics();
    this.healthBarContainer = new PIXI.Graphics();
    this.healthBarFill = new PIXI.Graphics();

    this.width = width;
    this.height = height;
    this.maxXp = maxXp;
    this.health = health;
    this.maxHealth = maxHealth;
    this.headerContainer = new PIXI.Graphics();

    this.headerContainer.beginFill();
    this.headerContainer.drawRect(0, 0, this.width, this.height);
    this.headerContainer.endFill();

    this.xpBarContainer.addChild(this.xpBarFill as PIXI.DisplayObject);

    this.xpBarContainer.beginFill(0x000000);
    this.xpBarContainer.drawRect(0, 0, this.width, this.height);
    this.xpBarContainer.endFill();

    // fill the xp bar with green color based on the xp value
    this.xpBarFill.beginFill(0x00ff00);
    this.xpBarFill.drawRect(0, 0, this.width, this.height);
    this.xpBarFill.endFill();
    this.xpBarFill.width = 0;

    this.healthBarContainer.addChild(this.healthBarFill as PIXI.DisplayObject);
    this.healthBarContainer.beginFill(0x000000);
    this.healthBarContainer.drawRect(0, 0, this.width, this.height);
    this.healthBarContainer.endFill();

    // fill the health bar with red color based on the health value
    this.healthBarFill.beginFill(0xff0000);
    this.healthBarFill.drawRect(0, 0, this.width, this.height);
    this.healthBarFill.endFill();

    this.headerContainer.addChild(this.xpBarContainer as PIXI.DisplayObject);
    this.headerContainer.addChild(
      this.healthBarContainer as PIXI.DisplayObject
    );
    this.xpBarContainer.y = 0;
  }

  updateXpBarFill(xp: number, newMaxXp?: number) {
    this.maxXp = newMaxXp || this.maxXp;

    this.xpBarFill.width = this.width * (xp / this.maxXp);
    // this.xpBarContainer.width = this.width;
    console.log(
      "xp bar fill width",
      this.xpBarFill.width,
      this.xpBarContainer.width,
      this.width,
      xp,
      this.maxXp
    );
  }

  updateHealthBarFill(health: number, newMaxHealth?: number) {
    this.maxHealth = newMaxHealth || this.maxHealth;
    this.health = health;

    this.healthBarFill.width = this.width * (health / this.maxHealth);
    this.healthBarContainer.width = this.width;
    console.log(
      "health bar fill width",
      this.healthBarFill.width,
      this.healthBarContainer.width,
      this.width,
      health,
      this.maxHealth
    );
  }

  getContainer() {
    return this.headerContainer;
  }
}
