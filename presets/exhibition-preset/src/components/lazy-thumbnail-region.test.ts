import { getRegionIntersection } from "@manifest-editor/components";
import { describe, expect, test } from "vitest";

describe("getRegionIntersection", () => {
  test("returns the overlapping canvas region", () => {
    expect(
      getRegionIntersection(
        { x: 10, y: 10, width: 50, height: 40 },
        { x: 40, y: 20, width: 50, height: 20 },
      ),
    ).toEqual({ x: 40, y: 20, width: 20, height: 20 });
  });

  test("returns null when regions do not overlap", () => {
    expect(
      getRegionIntersection(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 0, width: 10, height: 10 },
      ),
    ).toBeNull();
  });
});
