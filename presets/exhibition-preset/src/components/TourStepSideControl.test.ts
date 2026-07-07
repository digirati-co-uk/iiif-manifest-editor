import { describe, expect, test } from "vitest";
import { withTourStepSideBehavior } from "./TourStepSideControl";

describe("tour step side behaviour", () => {
  test("default removes left and right", () => {
    expect(withTourStepSideBehavior(["left", "splash"], "")).toEqual(["splash"]);
  });

  test("left and right replace each other", () => {
    expect(withTourStepSideBehavior(["right", "fixed"], "left")).toEqual(["fixed", "left"]);
    expect(withTourStepSideBehavior(["left", "fixed"], "right")).toEqual(["fixed", "right"]);
  });
});
