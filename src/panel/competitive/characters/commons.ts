import * as PIXI from "pixi.js";
export enum EPetState {
  IDLE,
  EATING,
  SLEEPING,
  PLAYING,
  DEAD,
  WALK,
  ADULTTRANSITION,
  ATTACK,
  AFFRAID,
  HIT,
}
export type IPetHeader = {
  xpBarContainer: PIXI.Graphics;
  xpBarFill: PIXI.Graphics;
};

export function moveToPos({
  obj,
  targetX,
  targetY,
  speed = 1,
  scale,
}: {
  obj: PIXI.Sprite;
  targetX: number;
  targetY: number;
  speed?: number;
  scale?: { start: number; end: number };
}): void {
  const dx = targetX - obj.x;
  const dy = targetY - obj.y;

  // Calculate the total distance to the target position
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the fractions of the total distance that correspond to the x and y distances
  const fractionX = dx / distance;
  const fractionY = dy / distance;

  // Update the sprite's position
  if (obj.x !== targetX) {
    obj.x += fractionX * speed;
  }

  if (obj.y !== targetY) {
    obj.y += fractionY * speed;
  }

  if (scale !== undefined) {
    // Calculate the total distance to the target position
    const totalDistance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the total number of frames based on the total distance
    const totalFrames = totalDistance / speed;

    // Calculate the amount to decrease the scale in each frame
    const scaleDecrease = (scale.start - scale.end) / totalFrames;

    // Decrease the scale by the calculated amount each frame
    if (obj.scale.x > scale.end) {
      obj.scale.x -= scaleDecrease;
    }

    if (obj.scale.y > scale.end) {
      obj.scale.y -= scaleDecrease;
    }
  }
}

// Quadratic Bezier Curve Function
function quadraticBezier(
  start: number,
  control: number,
  end: number,
  t: number
): number {
  const tInv = 1 - t;
  return tInv * tInv * start + 2 * tInv * t * control + t * t * end;
}

// Easing function for smooth acceleration and deceleration
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function moveToPosCurved({
  obj,
  targetX,
  targetY,
  duration,
  controlX,
  controlY,
  tolerance,
  startTime,
}: {
  obj: PIXI.Sprite;
  targetX: number;
  targetY: number;
  duration: number;
  controlX: number;
  tolerance: number;
  controlY: number;
  startTime: number;
}): void {
  const elapsed = Date.now() - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const curveProgress = easeInOutQuad(progress);

  const newX = quadraticBezier(obj.x, controlX, targetX, curveProgress);
  const newY = quadraticBezier(obj.y, controlY, targetY, curveProgress);

  obj.position.set(newX, newY);

  // Check if the ball is close enough to the target position
  if (
    Math.abs(newX - targetX) < tolerance &&
    Math.abs(newY - targetY) < tolerance
  ) {
    // Animation complete
  }
}
