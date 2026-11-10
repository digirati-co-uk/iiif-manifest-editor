import { createHelper } from "polygon-editor";
import { describe, expect, test } from "vitest";
import { installCompositionModifiers } from "./composition-modifiers";

function dragCorner(composition: boolean) {
  const helper = createHelper({ tool: "pointer" }, () => {});
  helper.setShape({
    points: [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ],
    open: false,
  });
  helper.selectAllPoints();
  helper.unlockAspectRatio();
  const restore = installCompositionModifiers(helper, () => composition);
  helper.modifiers.set("Shift");
  helper.pointer([[100, 100]]);
  helper.pointerDown();
  // The viewer refreshes Shift from every pointer event.
  helper.modifiers.set("Shift");
  helper.pointer([[125, 100]]);
  helper.pointerUp();
  restore();
  return helper.state.polygon.points;
}

describe("composition modifier adapter", () => {
  test("keeps a Shift-drag unconstrained despite pointer modifier refreshes", () => {
    const points = dragCorner(true);
    expect(Math.max(...points.map((point) => point[0]))).toBe(125);
    expect(Math.max(...points.map((point) => point[1]))).toBe(100);
  });
  test("preserves the polygon helper's normal Shift constraint outside composition", () => {
    const points = dragCorner(false);
    expect(Math.max(...points.map((point) => point[0]))).toBe(Math.max(...points.map((point) => point[1])));
  });
});
