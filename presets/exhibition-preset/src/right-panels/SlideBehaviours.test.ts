import { describe, expect, test } from "vitest";
import {
  buildSimpleLayoutBehaviors,
  getAdvancedExhibitionConfigs,
  getExhibitionTemplateControls,
  hasCoverBehavior,
  hasScrollBehavior,
  updateFloatingBehavior,
} from "./SlideBehaviours";

const base = {
  behavior: [] as string[],
  layoutPreset: "image" as const,
  displayWidth: 12 as const,
  canvasWidth: 1920,
  canvasHeight: 1080,
  floating: false,
  cover: false,
  scrollEnabled: false,
  splash: false,
  fixed: false,
  invert: false,
  backdrop: "" as const,
  showGridSizing: false,
  showFloating: false,
  showImageCover: false,
  showScrollToggle: false,
  showScrollDisplay: false,
  scrollContext: false,
};

describe("exhibition slide behaviours", () => {
  test("changing a floating position preserves image-only layout and unrelated behaviours", () => {
    expect(updateFloatingBehavior(["image", "cover", "float-top-left"], "float-bottom-right")).toEqual([
      "image",
      "cover",
      "float-bottom-right",
    ]);
    expect(updateFloatingBehavior(["image", "floating", "float-top-left"], "")).toEqual(["image"]);
  });
  test("full-page scroll toggle adds scroll and removes grid sizing", () => {
    expect(
      buildSimpleLayoutBehaviors({
        ...base,
        behavior: ["w-12", "h-8", "start-4", "image"],
        scrollEnabled: true,
        showScrollToggle: true,
        showScrollDisplay: true,
        scrollContext: true,
      }),
    ).toEqual(["scroll"]);
  });

  test("scroll layouts keep left/right alignment labels", () => {
    expect(getExhibitionTemplateControls("scroll").layoutOptions).toEqual([
      { value: "left", label: "Annotations on left" },
      { value: "right", label: "Annotations on right" },
    ]);
    expect(getExhibitionTemplateControls("scroll", false, false).layoutOptions).toEqual([]);
  });

  test("scroll display behaviours round-trip as configured strings", () => {
    expect(
      buildSimpleLayoutBehaviors({
        ...base,
        layoutPreset: "right",
        cover: true,
        splash: true,
        fixed: true,
        invert: true,
        backdrop: "backdrop-dark",
        showImageCover: true,
        showScrollDisplay: true,
        scrollContext: true,
      }),
    ).toEqual(["right", "cover", "splash", "fixed", "invert", "backdrop-dark"]);
  });

  test("legacy scroll and cover values are recognised by advanced controls", () => {
    expect(hasScrollBehavior(["page-scroll"])).toBe(true);
    expect(hasCoverBehavior(["image-cover"])).toBe(true);
    expect(getAdvancedExhibitionConfigs("fullpage", ["page-scroll", "image-cover"]).map((config) => config.id)).toEqual([
      "layout",
      "scroll",
      "display",
      "floating",
    ]);
  });

  test("cover controls only show for a cover canvas", () => {
    expect(getAdvancedExhibitionConfigs("scroll", ["splash"], false).map((config) => config.id)).toEqual(["layout", "display", "floating"]);
  });

  test("opening cover options match the viewer for each template", () => {
    expect(getAdvancedExhibitionConfigs("fullpage", [], true).map((config) => config.id)).toEqual([
      "layout",
      "scroll",
      "display",
      "size",
    ]);
    expect(getAdvancedExhibitionConfigs("slideshow", [], true).map((config) => config.id)).toEqual([
      "layout",
      "cover",
      "floating",
    ]);
  });

  test("an active opening cover hides normal canvas layout controls", () => {
    const controls = getExhibitionTemplateControls("slideshow", false, true, true);
    expect(controls.layoutOptions).toEqual([]);
    expect(controls.showFloating).toBe(false);
    expect(controls.showImageCover).toBe(false);
    expect(controls.showGridSizing).toBe(false);
    expect(getAdvancedExhibitionConfigs("slideshow", ["splash"], true).map((config) => config.id)).toEqual([
      "cover",
    ]);
  });

  test("scroll alignment controls hide when there are no tour steps", () => {
    expect(getAdvancedExhibitionConfigs("scroll", [], true, false).map((config) => config.id)).toEqual([
      "display",
      "cover",
      "floating",
    ]);
  });
});
