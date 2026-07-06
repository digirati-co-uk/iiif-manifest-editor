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
    expect(cssVariables["--f-display-font"]).toContain("UoL Sans");
    expect(cssVariables["--f-font"]).toContain("UoL Sans");
  });

  test("uses Leeds portal colours", () => {
    const theme = getThemePreset("leeds-full-page");

    expect(theme.delft.tokens.backgroundPrimary).toBe("#000000");
    expect(theme.delft.tokens.backgroundSecondary).toBe("#000000");
    expect(theme.delft.tokens.titleCard).toBe("#af1b00");
    expect(theme.delft.tokens.titleCardText).toBe("#ffffff");
    expect(theme.delft.tokens.infoBlock).toBe("#000000");
    expect(theme.delft.tokens.infoBlockText).toBe("#ffffff");
    expect(theme.delft.tokens.controlBar).toBe("#000000");
    expect(theme.delft.tokens.progressBar).toBe("#af1b00");
    expect(theme.scroll.tokens.titleBackground).toBe("#000000");
  });

  test("keeps Leeds display templates black-led", () => {
    const scroll = getThemePreset("leeds-scroll");
    const slideshow = getThemePreset("leeds-slideshow");

    expect(scroll.delft.tokens.backgroundPrimary).toBe("#000000");
    expect(scroll.delft.tokens.viewerBackground).toBe("#000000");
    expect(scroll.delft.tokens.titleCard).toBe("#ffa8ff");
    expect(scroll.delft.tokens.titleCardText).toBe("#000000");
    expect(scroll.delft.tokens.progressBar).toBe("#af1b00");
    expect(scroll.scroll.tokens.titleBackground).toBe("#ffa8ff");
    expect(scroll.scroll.tokens.titleColor).toBe("#000000");
    expect(scroll.scroll.tokens.infoBlockBackground).toBe("#ffa8ff");
    expect(scroll.scroll.tokens.infoBlockColor).toBe("#000000");
    expect(slideshow.delft.tokens.backgroundPrimary).toBe("#000000");
    expect(slideshow.delft.tokens.backgroundSecondary).toBe("#000000");
    expect(slideshow.delft.tokens.titleCard).toBe("#88ffb8");
    expect(slideshow.delft.tokens.titleCardText).toBe("#000000");
    expect(slideshow.delft.tokens.infoBlock).toBe("#88ffb8");
    expect(slideshow.delft.tokens.infoBlockText).toBe("#000000");
    expect(slideshow.delft.tokens.controlBar).toBe("#000000");
    expect(slideshow.delft.tokens.controlBarBorder).toBe("#af1b00");
    expect(slideshow.delft.tokens.progressBar).toBe("#af1b00");
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
