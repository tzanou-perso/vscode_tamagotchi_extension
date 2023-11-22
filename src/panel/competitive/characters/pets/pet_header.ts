import * as PIXI from "pixi.js";

export const containerBorderSize = 1.5;
export const containerBorderColor = "#000000";
export const containerColor = "#6e6e6e";
export const xpContainerFillColor = "#24b302";
export const healthContainerFillColor = "#bb0303";
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
  petScale: number;
  constructor({
    width,
    height,
    maxXp,
    health,
    maxHealth,
    petScale,
  }: {
    width: number;
    height: number;
    maxXp: number;
    health: number;
    maxHealth: number;
    petScale: number;
  }) {
    this.petScale = petScale;
    this.xpBarContainer = new PIXI.Graphics();
    this.xpBarFill = new PIXI.Graphics();
    this.healthBarContainer = new PIXI.Graphics();
    this.healthBarFill = new PIXI.Graphics();

    this.width = width;
    this.height = height / petScale;
    this.maxXp = maxXp;
    this.health = health;
    this.maxHealth = maxHealth;
    this.headerContainer = new PIXI.Graphics();

    this.headerContainer.beginFill();
    this.headerContainer.drawRect(
      0,
      0,
      this.width / petScale,
      this.height / petScale
    );
    this.headerContainer.endFill();
    this.headerContainer.pivot.set(
      (this.width / 2 + containerBorderSize / 2) / petScale,
      (this.height + containerBorderSize) / petScale
    );

    this.xpBarContainer.addChild(this.xpBarFill as PIXI.DisplayObject);
    this.xpBarContainer.lineStyle(
      containerBorderSize / petScale,
      containerBorderColor
    );
    this.xpBarContainer.beginFill(containerColor);
    this.xpBarContainer.drawRect(
      0,
      0,
      this.width + containerBorderSize / petScale,
      this.height + containerBorderSize / petScale
    );

    this.xpBarContainer.endFill();

    // fill the xp bar with green color based on the xp value
    this.xpBarFill.beginFill(xpContainerFillColor);
    this.xpBarFill.drawRect(
      (0 + containerBorderSize / 2) / petScale,
      (0 + containerBorderSize / 2) / petScale,
      this.width / petScale,
      this.height / petScale
    );
    this.xpBarFill.endFill();
    this.xpBarFill.width = 0;

    this.healthBarContainer.addChild(this.healthBarFill as PIXI.DisplayObject);
    this.healthBarContainer.lineStyle(
      containerBorderSize / petScale,
      containerBorderColor
    );
    this.healthBarContainer.beginFill(containerColor);
    this.healthBarContainer.drawRect(
      0,
      0,
      this.width + containerBorderSize / petScale,
      this.height + containerBorderSize / petScale
    );
    this.healthBarContainer.endFill();

    // fill the health bar with red color based on the health value
    this.healthBarFill.beginFill(healthContainerFillColor);
    this.healthBarFill.drawRect(
      (0 + containerBorderSize / 2) / petScale,
      (0 + containerBorderSize / 2) / petScale,
      this.width,
      this.height
    );
    this.healthBarFill.endFill();

    this.headerContainer.addChild(this.xpBarContainer as PIXI.DisplayObject);
    this.headerContainer.addChild(
      this.healthBarContainer as PIXI.DisplayObject
    );
    this.xpBarContainer.y = 0;
  }

  updateXpBarFill(xp: number, petScale: number, newMaxXp?: number) {
    this.maxXp = newMaxXp || this.maxXp;
    this.height = this.height / petScale;
    this.xpBarFill.width = this.width * (xp / this.maxXp);
    if (this.xpBarFill.width < 0) {
      this.xpBarFill.width = 0;
    }
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

  updateHealthBarFill(health: number, petScale: number, newMaxHealth?: number) {
    this.maxHealth = newMaxHealth || this.maxHealth;
    this.health = health;
    this.healthBarContainer.width = this.width;
    this.healthBarFill.width = this.width * (health / this.maxHealth);
    this.height = this.height / petScale;
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
