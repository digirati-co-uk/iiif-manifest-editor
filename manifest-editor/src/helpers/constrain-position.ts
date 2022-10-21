import invariant from "tiny-invariant";
import { centerRectangles } from "@/helpers/center-rectangles";

export function constrainPosition(
  canvas: { width: number; height: number },
  position: { x: number; y: number; width: number; height: number }
) {
  let deltaX = 0;
  let deltaY = 0;

  invariant(canvas.width, "Canvas must have width");
  invariant(canvas.height, "Canvas must have height");

  //
  if (position.x < 0) {
    deltaX = -position.x;
  }
  if (position.y < 0) {
    deltaY = -position.y;
  }

  const xOvershoot = canvas.width - (position.x + position.width);

  if (xOvershoot < 0) {
    // 2 possibilities, too big or position.
    if (position.width > canvas.width) {
      // we need to scale.
      return centerRectangles(canvas, position);
    }

    deltaX = xOvershoot;
  }

  const yOvershoot = canvas.width - (position.y + position.width);
  if (position.y + position.height > canvas.height) {
    // 2 possibilities, too big or position.
    if (position.height > canvas.height) {
      // we need to scale.
      return centerRectangles(canvas, position);
    }

    // @todo translate.
    deltaY = yOvershoot;
  }

  if (!deltaX && !deltaY) {
    return position;
  }

  return {
    x: position.x + deltaX,
    y: position.y + deltaY,
    width: position.width,
    height: position.height,
  };
}
