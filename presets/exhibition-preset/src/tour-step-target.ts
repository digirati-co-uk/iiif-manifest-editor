import { constrainSlideContentBox } from "./slideshow-content-positioning";

function isFiniteBox(box: any) {
  return (
    box &&
    [box.x, box.y, box.width, box.height].every(Number.isFinite) &&
    box.width > 0 &&
    box.height > 0
  );
}

function hasFinitePoints(polygon: any) {
  return (
    !polygon ||
    (Array.isArray(polygon.points) &&
      polygon.points.length &&
      polygon.points.every(
        (point: any) =>
          Array.isArray(point) &&
          Number.isFinite(point[0]) &&
          Number.isFinite(point[1]),
      ))
  );
}

function hasFiniteTarget(target: any) {
  if (target?.type === "FragmentSelector") {
    const values = target.value?.replace(/^xywh=/, "").split(",").map(Number);
    return (
      values?.length === 4 &&
      values.every(Number.isFinite) &&
      values[2] > 0 &&
      values[3] > 0
    );
  }

  return (
    target?.type === "SvgSelector" &&
    typeof target.value === "string" &&
    !/\b(?:NaN|Infinity|undefined)\b/.test(target.value)
  );
}

export function normaliseTourStepAnnotationResponse(response: any, canvas: any) {
  const canvasWidth = Number(canvas?.width) || 1920;
  const canvasHeight = Number(canvas?.height) || 1080;
  const box = response?.boundingBox;
  if (
    hasFinitePoints(response?.polygon) &&
    isFiniteBox(box) &&
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= canvasWidth &&
    box.y + box.height <= canvasHeight &&
    hasFiniteTarget(response?.target)
  ) {
    return response;
  }

  const recoveredBox = constrainSlideContentBox(
    canvas,
    isFiniteBox(response?.boundingBox)
      ? response.boundingBox
      : { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
  );

  return {
    ...response,
    polygon: null,
    boundingBox: recoveredBox,
    target: {
      type: "FragmentSelector",
      value: `xywh=${recoveredBox.x},${recoveredBox.y},${recoveredBox.width},${recoveredBox.height}`,
    },
  };
}
