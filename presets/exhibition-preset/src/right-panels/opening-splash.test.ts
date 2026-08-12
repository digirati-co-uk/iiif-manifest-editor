import { describe, expect, test } from "vitest";
import { isOpeningSplashCanvas } from "./opening-splash";

const items = [{ id: "canvas-1" }, { id: "canvas-2" }];

describe("opening splash", () => {
  test("only the first splash canvas is the opening splash", () => {
    expect(
      isOpeningSplashCanvas({ id: "canvas-1", behavior: ["splash"] }, items),
    ).toBe(true);
    expect(
      isOpeningSplashCanvas({ id: "canvas-2", behavior: ["splash"] }, items),
    ).toBe(false);
    expect(
      isOpeningSplashCanvas({ id: "canvas-1", behavior: ["image"] }, items),
    ).toBe(false);
    expect(isOpeningSplashCanvas(undefined, items)).toBe(false);
  });

  test("follows the current canvas order", () => {
    const splash = { id: "canvas-1", behavior: ["splash"] };

    expect(isOpeningSplashCanvas(splash, items)).toBe(true);
    expect(isOpeningSplashCanvas(splash, [...items].reverse())).toBe(false);
  });
});
