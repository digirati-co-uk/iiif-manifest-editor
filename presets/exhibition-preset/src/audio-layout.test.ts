import { describe, expect, test } from "vitest";
import {
  getGridUnit,
  getScrollAudioPlacement,
  resolveAudioLayoutKind,
  setAudioOverlay,
  setGridUnit,
  setScrollAudioPlacement,
} from "./audio-layout";

describe("audio layout parity with the viewer", () => {
  test("resolves the layout kind from template controls", () => {
    expect(resolveAudioLayoutKind({ showGridSizing: true, isSlideshow: false, scrollContext: false })).toBe("fullpage");
    expect(resolveAudioLayoutKind({ showGridSizing: false, isSlideshow: true, scrollContext: false })).toBe("slideshow");
    expect(resolveAudioLayoutKind({ showGridSizing: false, isSlideshow: false, scrollContext: true })).toBe("scroll");
  });

  test("scroll defaults to a top-left floating card, like ScrollAudioBlock", () => {
    expect(getScrollAudioPlacement(["audio"])).toEqual({ mode: "floating", position: "float-top-left" });
    expect(getScrollAudioPlacement(["audio", "right"]).mode).toBe("right");
    expect(getScrollAudioPlacement(["left", "float-bottom"])).toEqual({ mode: "floating", position: "float-bottom" });
    expect(getScrollAudioPlacement(["floating"])).toEqual({ mode: "floating", position: "float-bottom-left" });
  });

  test("scroll placement replaces only placement behaviors", () => {
    const behavior = ["audio", "audio-waveform", "float-top-left", "w-12"];
    expect(setScrollAudioPlacement(behavior, { mode: "right", position: "float-top-left" })).toEqual([
      "audio",
      "audio-waveform",
      "w-12",
      "right",
    ]);
    expect(setScrollAudioPlacement(["left", "audio"], { mode: "floating", position: "float-bottom-right" })).toEqual([
      "audio",
      "float-bottom-right",
    ]);
  });

  test("overlay toggles without disturbing text placement", () => {
    expect(setAudioOverlay(["audio", "left"], "float-top")).toEqual(["audio", "left", "float-top"]);
    expect(setAudioOverlay(["audio", "left", "float-top", "floating"], null)).toEqual(["audio", "left"]);
  });

  test("grid units read the last value and replace cleanly", () => {
    expect(getGridUnit(["w-6", "w-8"], "w-", 12)).toBe(8);
    expect(getGridUnit(["audio"], "h-", 8)).toBe(8);
    expect(setGridUnit(["audio", "w-12", "h-8"], "w-", 6)).toEqual(["audio", "h-8", "w-6"]);
  });
});
