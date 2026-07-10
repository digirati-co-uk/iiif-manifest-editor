import { describe, expect, test } from "vitest";
import {
  type ExhibitionThemeConfig,
  getThemeCssVariables,
  getThemePreset,
} from "./theme-service";

describe("Leeds exhibition theme presets", () => {
  test("provides Leeds full page, scrolling, and slideshow exemplars", () => {
    expect(getThemePreset("leeds-full-page").preset).toBe("leeds-full-page");
    expect(getThemePreset("leeds-scroll").preset).toBe("leeds-scroll");
    expect(getThemePreset("leeds-slideshow").preset).toBe("leeds-slideshow");
  });

  test("uses Leeds typography tokens", () => {
    const theme = getThemePreset("leeds-full-page");
    const cssVariables = getThemeCssVariables(theme);

    expect(theme.shared.fontDisplay).toContain("UoL Sans");
    expect(theme.shared.fontSans).toContain("UoL Sans");
    expect(theme.shared.fontMono).toContain("UoL Inter");
    expect(cssVariables["--f-display-font"]).toContain("UoL Sans");
    expect(cssVariables["--f-font"]).toContain("UoL Sans");
    expect(cssVariables["--f-mono-font"]).toContain("UoL Inter");
  });

  test("uses Leeds portal colours", () => {
    const theme = getThemePreset("leeds-full-page");

    expect(theme.delft.tokens.backgroundPrimary).toBe("#ffffff");
    expect(theme.delft.tokens.backgroundSecondary).toBe("#000000");
    expect(theme.delft.tokens.titleCard).toBe("#55ff55");
    expect(theme.delft.tokens.titleCardText).toBe("#000000");
    expect(theme.delft.tokens.infoBlock).toBe("#000000");
    expect(theme.delft.tokens.infoBlockText).toBe("#ffffff");
    expect(theme.delft.tokens.controlBar).toBe("#000000");
    expect(theme.delft.tokens.progressBar).toBe("#55ff55");
    expect(theme.scroll.tokens.titleBackground).toBe("#ffffff");
  });

  test("uses Leeds colour-combination exemplars", () => {
    const scroll = getThemePreset("leeds-scroll");
    const slideshow = getThemePreset("leeds-slideshow");

    expect(scroll.delft.tokens.backgroundPrimary).toBe("#fff1df");
    expect(scroll.delft.tokens.viewerBackground).toBe("#fff1df");
    expect(scroll.delft.tokens.titleCard).toBe("#fff1df");
    expect(scroll.delft.tokens.titleCardText).toBe("#000000");
    expect(scroll.delft.tokens.infoBlock).toBe("#4a2f29");
    expect(scroll.delft.tokens.infoBlockText).toBe("#ffffff");
    expect(scroll.delft.tokens.progressBar).toBe("#f28df7");
    expect(scroll.scroll.tokens.titleBackground).toBe("#fff1df");
    expect(scroll.scroll.tokens.titleColor).toBe("#000000");
    expect(scroll.scroll.tokens.annotationBackground).toBe("#f28df7");
    expect(scroll.scroll.tokens.annotationColor).toBe("#000000");
    expect(scroll.scroll.tokens.infoBlockBackground).toBe("#4a2f29");
    expect(scroll.scroll.tokens.infoBlockColor).toBe("#ffffff");
    expect(slideshow.delft.tokens.backgroundPrimary).toBe("#ffffff");
    expect(slideshow.delft.tokens.backgroundSecondary).toBe("#8de3ef");
    expect(slideshow.delft.tokens.titleCard).toBe("#8de3ef");
    expect(slideshow.delft.tokens.titleCardText).toBe("#000000");
    expect(slideshow.delft.tokens.infoBlock).toBe("#9c381c");
    expect(slideshow.delft.tokens.infoBlockText).toBe("#ffffff");
    expect(slideshow.delft.tokens.controlBar).toBe("#000000");
    expect(slideshow.delft.tokens.controlBarBorder).toBe("#000000");
    expect(slideshow.delft.tokens.progressBar).toBe("#9c381c");
  });

  test("keeps text-bearing colour pairs accessible", () => {
    for (const preset of [
      "leeds-full-page",
      "leeds-scroll",
      "leeds-slideshow",
    ] as const) {
      const theme = getThemePreset(preset);

      for (const pair of getTextColourPairs(theme)) {
        expect(
          contrastRatio(pair.foreground, pair.background),
          `${preset}: ${pair.name}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("uses black or white for Leeds text colours", () => {
    for (const preset of [
      "leeds-full-page",
      "leeds-scroll",
      "leeds-slideshow",
    ] as const) {
      const theme = getThemePreset(preset);

      for (const colour of [
        theme.delft.tokens.textPrimary,
        theme.delft.tokens.textSecondary,
        theme.delft.tokens.imageCaption,
        theme.delft.tokens.closeText,
        theme.delft.tokens.titleCardText,
        theme.delft.tokens.infoBlockText,
        theme.scroll.tokens.titleColor,
        theme.scroll.tokens.annotationColor,
        theme.scroll.tokens.infoBlockColor,
      ]) {
        expect(["#000000", "#ffffff"]).toContain(colour);
      }
    }
  });

  test("keeps Leeds presets compatible with the theme settings panel", () => {
    for (const preset of [
      "leeds-full-page",
      "leeds-scroll",
      "leeds-slideshow",
    ] as const) {
      const theme = getThemePreset(preset);

      expect(theme.scroll.options.showTitleBlock).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.showTableOfContents).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.tableOfContentsPlacement).toMatch(/^(header|footer)$/);
      expect(theme.scroll.options.showProgressBar).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.showProgressTableOfContents).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.showScrollToTop).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.showNavigationControls).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.ignoreCanvasBackgrounds).toEqual(expect.any(Boolean));
      expect(theme.scroll.options.titleBlock.fullHeight).toEqual(expect.any(Boolean));
    }
  });
});

function getTextColourPairs(theme: ExhibitionThemeConfig) {
  return [
    {
      name: "title card",
      foreground: theme.delft.tokens.titleCardText,
      background: theme.delft.tokens.titleCard,
    },
    {
      name: "info block",
      foreground: theme.delft.tokens.infoBlockText,
      background: theme.delft.tokens.infoBlock,
    },
    {
      name: "close control",
      foreground: theme.delft.tokens.closeText,
      background: theme.delft.tokens.closeBackground,
    },
    {
      name: "scroll title",
      foreground: theme.scroll.tokens.titleColor,
      background: theme.scroll.tokens.titleBackground,
    },
    {
      name: "scroll annotation",
      foreground: theme.scroll.tokens.annotationColor,
      background: theme.scroll.tokens.annotationBackground,
    },
    {
      name: "scroll info block",
      foreground: theme.scroll.tokens.infoBlockColor,
      background: theme.scroll.tokens.infoBlockBackground,
    },
  ];
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(hexToRgb(foreground));
  const backgroundLuminance = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const scaleChannel = (channel: number) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  const rs = scaleChannel(r);
  const gs = scaleChannel(g);
  const bs = scaleChannel(b);

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}
