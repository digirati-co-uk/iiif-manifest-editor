import { describe, expect, test } from "vitest";
import {
  exhibitionTemplates,
  getTemplateConfigurationValue,
  setTemplateConfigurationValue,
} from "../exhibition-templates";
import { getExhibitionTemplate } from "./exhibition-template";

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

test("template configuration paths create the nested viewer theme shape", () => {
  const values = setTemplateConfigurationValue({}, "scroll.options.titleBlock.fullHeight", false);
  expect(values).toEqual({ scroll: { options: { titleBlock: { fullHeight: false } } } });
  expect(getTemplateConfigurationValue(values, "scroll.options.titleBlock.fullHeight")).toBe(false);
});
