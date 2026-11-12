import { expect, test } from "vitest";
import { exhibitionTemplates, resolveTemplateConfiguration } from "./exhibition-templates";

test("every current exhibition template exposes the shared audio defaults", () => {
  expect(exhibitionTemplates).toHaveLength(6);
  for (const template of exhibitionTemplates) {
    expect(template.configuration?.map((field) => field.id)).toEqual(
      expect.arrayContaining(["audio.autoplay", "audio.showWaveform", "audio.imageFit", "audio.waveformOpacity"])
    );
    expect(template.configuration?.find((field) => field.id === "audio.autoplay")?.defaultValue).toBe(false);
  }
});

test("changing preview configuration preserves extension values and audio customization", () => {
  const stored = {
    audio: { progressColor: "tomato", waveformOpacity: 0.7, autoplay: true },
    extension: { futureOption: "kept" },
  };
  const result = resolveTemplateConfiguration(exhibitionTemplates[0]!.configuration!, stored);
  expect(result.audio).toMatchObject({
    progressColor: "tomato",
    waveformOpacity: 0.7,
    autoplay: true,
    showWaveform: true,
    imageFit: "contain",
  });
  expect(result.extension).toEqual({ futureOption: "kept" });
  expect(stored.audio).not.toHaveProperty("showWaveform");
});
