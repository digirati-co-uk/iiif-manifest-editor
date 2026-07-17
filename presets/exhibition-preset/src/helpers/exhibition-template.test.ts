import { describe, expect, test } from "vitest";
import {
  exhibitionTemplates,
  getTemplateConfigurationValue,
  setTemplateConfigurationValue,
} from "../exhibition-templates";
import { getExhibitionTemplate, getExhibitionTemplatePreviews } from "./exhibition-template";

describe("getExhibitionTemplate", () => {
  test("prefers the saved template id and falls back to its type", () => {
    expect(getExhibitionTemplate(exhibitionTemplates, ["scroll", "template-exhibition-slideshow"])?.id).toBe(
      "exhibition-slideshow",
    );
    expect(getExhibitionTemplate(exhibitionTemplates, ["scroll"])?.id).toBe("exhibition-scroll");
  });

  test("returns null when no behavior declares a template", () => {
    expect(getExhibitionTemplate(exhibitionTemplates, [])).toBe(null);
  });
});

test("template previews retain the current format when another type is selected", () => {
  const selected = exhibitionTemplates.find((template) => template.id === "exhibition-scroll")!;
  const current = exhibitionTemplates.find((template) => template.id === "exhibition-slideshow")!;
  expect(getExhibitionTemplatePreviews(exhibitionTemplates, selected, current).map((template) => template.id)).toEqual([
    "exhibition-slideshow",
    "exhibition-scroll",
    "leeds-exhibition-scroll",
  ]);
});

test("template configuration paths create the nested viewer theme shape", () => {
  const values = setTemplateConfigurationValue({}, "scroll.options.titleBlock.fullHeight", false);
  expect(values).toEqual({ scroll: { options: { titleBlock: { fullHeight: false } } } });
  expect(getTemplateConfigurationValue(values, "scroll.options.titleBlock.fullHeight")).toBe(false);
});
