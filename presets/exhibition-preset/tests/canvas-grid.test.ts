import { expect, test } from "vitest";
import { fitCanvasGridBehavior } from "../src/helpers";

test("grid sizing keeps width and other behaviors when height fits", () => {
  expect(fitCanvasGridBehavior(["image", "w-8", "h-4", "cover"], 1200, 900)).toEqual(["image", "cover", "w-8", "h-6"]);
});
test("portrait sizing reduces width only when twelve rows cannot fit it", () => {
  expect(fitCanvasGridBehavior(["image", "w-12", "h-8"], 400, 1200)).toEqual(["image", "w-4", "h-12"]);
  expect(fitCanvasGridBehavior(["image", "w-4", "h-8"], 400, 1200)).toEqual(["image", "w-4", "h-12"]);
});
test("grid sizing accounts for space occupied by text", () => {
  expect(fitCanvasGridBehavior(["left", "w-12", "h-8"], 1000, 1000)).toEqual(["left", "w-12", "h-8"]);
  expect(fitCanvasGridBehavior(["bottom", "w-8", "h-8"], 1000, 1000)).toEqual(["bottom", "w-8", "h-12"]);
});
test("grid dimensions remain valid for extreme and invalid canvas sizes", () => {
  expect(fitCanvasGridBehavior(["image", "w-12", "h-8"], 1, 10000)).toEqual(["image", "w-1", "h-12"]);
  expect(fitCanvasGridBehavior(["image", "w-12", "h-8"], 10000, 1)).toEqual(["image", "w-12", "h-1"]);
  expect(fitCanvasGridBehavior(["w-8", "h-4"], 0, 100)).toEqual(["w-8", "h-4"]);
});
