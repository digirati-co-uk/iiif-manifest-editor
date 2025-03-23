import { describe, expect, test } from "vitest";
import { centerRectangles } from "../helpers/center-rectangles";

describe("Center rectangles helper", () => {
  test("downsizing", () => {
    const result = centerRectangles(
      { width: 10000, height: 1000 },
      { width: 2500, height: 3196 },
      0.6,
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "height": 600,
        "width": 469.3366708385482,
        "x": 4765.331664580726,
        "y": 200,
      }
    `);
  });
});
