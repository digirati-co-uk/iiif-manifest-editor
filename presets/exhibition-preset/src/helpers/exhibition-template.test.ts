import { describe, expect, test } from "vitest";
import { exhibitionTemplates } from "../exhibition-onboarding";
import { getExhibitionTemplate } from "./exhibition-template";

describe("getExhibitionTemplate", () => {
  test("prefers the saved template id and falls back to its type", () => {
    expect(getExhibitionTemplate(exhibitionTemplates, ["scroll", "template-exhibition-slideshow"])?.id).toBe(
      "exhibition-slideshow",
    );
    expect(getExhibitionTemplate(exhibitionTemplates, ["scroll"])?.id).toBe("exhibition-scroll");
  });
});
