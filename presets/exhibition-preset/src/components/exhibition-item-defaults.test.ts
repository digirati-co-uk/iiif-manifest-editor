import { describe, expect, test } from "vitest";
import { isExhibitionItem } from "../helpers";
import {
  needsExhibitionSummary,
  withExhibitionDefaults,
} from "./exhibition-item-defaults";

describe("exhibition item defaults", () => {
  test("treats splash as an existing exhibition configuration", () => {
    expect(isExhibitionItem({ behavior: ["splash"] } as any)).toBe(true);
  });

  test("replaces layout defaults without mutating or losing other behaviours", () => {
    const behavior = ["splash", "custom", "w-4", "h-3", "w-8"];
    const defaults = withExhibitionDefaults(behavior, 1000, 1000);

    expect(defaults).toEqual(["splash", "custom", "w-12", "h-12"]);
    expect(behavior).toEqual(["splash", "custom", "w-4", "h-3", "w-8"]);
    expect(withExhibitionDefaults(defaults, 1000, 1000)).toEqual(defaults);
    expect(
      withExhibitionDefaults(["custom", "w-12", "h-12", "w-12"], 1000, 1000),
    ).toEqual(["custom", "w-12", "h-12"]);
  });

  test("seeds only an empty summary", () => {
    expect(needsExhibitionSummary(undefined)).toBe(true);
    expect(needsExhibitionSummary({ en: [""] })).toBe(true);
    expect(
      needsExhibitionSummary({
        en: ["<p>Existing HTML</p>"],
        fr: ["Résumé existant"],
      }),
    ).toBe(false);
  });
});
