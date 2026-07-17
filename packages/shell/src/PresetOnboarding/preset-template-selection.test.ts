import { describe, expect, test } from "vitest";
import type { PresetTemplateDefinition } from "../AppContext/AppContext";
import { resolvePresetTemplateSelection } from "./preset-template-selection";

const template = (id: string, type: PresetTemplateDefinition["type"]): PresetTemplateDefinition => ({
  id,
  type,
  label: id,
  summary: id,
  previewUrl: `https://example.org/${id}`,
  thumbnailUrl: `https://example.org/${id}.jpg`,
});

describe("resolvePresetTemplateSelection", () => {
  const templates = [template("one", "fullpage"), template("two", "slideshow")];

  test("falls back to the first permitted template", () => {
    expect(resolvePresetTemplateSelection(templates, null)?.id).toBe("one");
    expect(resolvePresetTemplateSelection(templates, "filtered-out")?.id).toBe("one");
  });

  test("prefers the manifest's permitted template", () => {
    expect(resolvePresetTemplateSelection(templates, "one", ["template-two"])?.id).toBe("two");
    expect(resolvePresetTemplateSelection(templates, null, ["slideshow"])?.id).toBe("two");
  });

  test("retains a permitted selected template when the manifest has no format", () => {
    expect(resolvePresetTemplateSelection(templates, "two")?.id).toBe("two");
  });

  test("returns an explicit empty selection when no templates are permitted", () => {
    expect(resolvePresetTemplateSelection([], "filtered-out", ["template-filtered-out"])).toBeNull();
  });
});
