import { describe, expect, test } from "vitest";
import { replaceLayoutBehavior, toggleCoverBehavior, toggleImageBehavior } from "./slide-behavior-transforms";

describe("slide behavior transforms", () => {
  test.each([
    {
      name: "preserves image when moving annotations",
      behavior: ["image", "left", "non-linear-tour"],
      preset: "right" as const,
      expected: ["image", "right", "non-linear-tour"],
    },
    {
      name: "only replaces mutually exclusive positions",
      behavior: ["custom-before", "top", "cover", "custom-after"],
      preset: "bottom" as const,
      expected: ["custom-before", "bottom", "cover", "custom-after"],
    },
    {
      name: "removes positions for image-only layout",
      behavior: ["custom", "image", "left"],
      preset: "image" as const,
      expected: ["custom", "image"],
    },
  ])("$name", ({ behavior, preset, expected }) => {
    expect(replaceLayoutBehavior(behavior, preset)).toEqual(expected);
  });

  test("image and cover toggles preserve aliases, tours, and unknown behaviours", () => {
    expect(toggleImageBehavior(["custom", "non-linear-tour"], true)).toEqual(["custom", "non-linear-tour", "image"]);
    expect(toggleImageBehavior(["custom", "image", "non-linear-tour"], false)).toEqual(["custom", "non-linear-tour"]);
    expect(toggleCoverBehavior(["custom", "image-cover", "non-linear-tour"], true)).toEqual([
      "custom",
      "cover",
      "non-linear-tour",
    ]);
  });

  test("an image-oriented tour needs no annotation position", () => {
    expect(replaceLayoutBehavior(["image", "non-linear-tour", "custom"], "image")).toEqual([
      "image",
      "non-linear-tour",
      "custom",
    ]);
  });
});
