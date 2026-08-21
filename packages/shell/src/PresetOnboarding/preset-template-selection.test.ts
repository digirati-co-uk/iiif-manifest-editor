import { describe, expect, test } from "vitest";
import type { PresetTemplateDefinition } from "../AppContext/AppContext";
import {
  applyPresetTemplateSelection,
  getConfiguredPresetTemplate,
  resolvePresetTemplateSelection,
} from "./preset-template-selection";

const template = (id: string, type: PresetTemplateDefinition["type"]): PresetTemplateDefinition => ({
  id,
  type,
  label: id,
  summary: id,
  previewUrl: `https://example.org/${id}`,
  thumbnailUrl: `https://example.org/${id}.jpg`,
});

describe("resolvePresetTemplateSelection", () => {
  const templates = [template("one", "fullpage"), template("two", "slideshow"), template("three", "scroll")];

  test("falls back to the first permitted template", () => {
    expect(resolvePresetTemplateSelection(templates, null)?.id).toBe("one");
    expect(resolvePresetTemplateSelection(templates, "filtered-out")?.id).toBe("one");
  });

  test("prefers the manifest's permitted template", () => {
    expect(resolvePresetTemplateSelection(templates, "one", ["template-two"])?.id).toBe("two");
    expect(resolvePresetTemplateSelection(templates, null, ["slideshow"])?.id).toBe("two");
  });

  test("only treats a valid manifest behavior as configured", () => {
    expect(getConfiguredPresetTemplate(templates, ["template-two"])?.id).toBe("two");
    expect(getConfiguredPresetTemplate(templates, ["scroll"])?.id).toBe("three");
    expect(getConfiguredPresetTemplate(templates, [])).toBeNull();
    expect(getConfiguredPresetTemplate(templates, ["template-missing"])).toBeNull();
  });

  test("retains a permitted selected template when the manifest has no format", () => {
    expect(resolvePresetTemplateSelection(templates, "two")?.id).toBe("two");
  });

  test("returns an explicit empty selection when no templates are permitted", () => {
    expect(resolvePresetTemplateSelection([], "filtered-out", ["template-filtered-out"])).toBeNull();
  });

  test("keeps each loaded manifest authoritative until an explicit selection", () => {
    const slideshow = ["template-two"];
    const scrolling = ["scroll"];
    const unconfigured: string[] = [];

    expect(resolvePresetTemplateSelection(templates, "two", scrolling)?.id).toBe("three");
    expect(scrolling).toEqual(["scroll"]);

    const fullpage = applyPresetTemplateSelection(scrolling, templates[0]!);
    expect(fullpage).toEqual(["fullpage", "template-one"]);
    expect(resolvePresetTemplateSelection(templates, "one", fullpage)?.id).toBe("one");
    expect(resolvePresetTemplateSelection(templates, "one", slideshow)?.id).toBe("two");

    expect(resolvePresetTemplateSelection(templates, "two", unconfigured)?.id).toBe("two");
    expect(unconfigured).toEqual([]);
    expect(applyPresetTemplateSelection(unconfigured, templates[1]!)).toEqual(["slideshow", "template-two"]);
  });

  test("replaces conflicting format behaviours exactly once", () => {
    expect(
      applyPresetTemplateSelection(
        ["paged", "scroll", "slideshow", "fullpage", "template-old", "template-old"],
        templates[1]!,
      ),
    ).toEqual(["paged", "slideshow", "template-two"]);
  });
});
