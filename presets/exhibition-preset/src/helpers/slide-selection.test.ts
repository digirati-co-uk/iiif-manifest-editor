import { describe, expect, test } from "vitest";
import { getSlideSelectionAfterDeletion } from "./slide-selection";

const slides = [{ id: "first" }, { id: "middle" }, { id: "last" }];

describe("getSlideSelectionAfterDeletion", () => {
  test.each([
    ["first", "middle"],
    ["middle", "last"],
    ["last", "middle"],
  ])("deleting selected %s selects %s", (deletedId, expectedId) => {
    expect(getSlideSelectionAfterDeletion(slides, deletedId, deletedId)).toBe(expectedId);
  });

  test("deleting a non-selected slide preserves the selection", () => {
    expect(getSlideSelectionAfterDeletion(slides, "last", "first")).toBe("last");
  });

  test("deleting the only slide clears the selection", () => {
    expect(getSlideSelectionAfterDeletion([{ id: "only" }], "only", "only")).toBeUndefined();
  });
});
