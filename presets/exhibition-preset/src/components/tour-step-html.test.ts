import { describe, expect, test } from "vitest";
import {
  DEFAULT_TOUR_STEP_HTML,
  joinTourStepHtml,
  splitTourStepHtml,
} from "./tour-step-html";

describe("tour step HTML", () => {
  test("splits the first heading into the label", () => {
    expect(splitTourStepHtml("<h2>Step one</h2><p>Summary</p>")).toEqual({
      label: "Step one",
      summary: "<p>Summary</p>",
    });
  });

  test("joins a plain label and HTML summary", () => {
    expect(joinTourStepHtml("A < B", "<p>Summary</p>")).toBe(
      "<h2>A &lt; B</h2><p>Summary</p>",
    );
  });

  test("preserves heading-free and explicitly empty headings", () => {
    expect(splitTourStepHtml("<p>Summary</p>")).toEqual({
      label: undefined,
      summary: "<p>Summary</p>",
    });
    expect(splitTourStepHtml("<h2></h2><p>Summary</p>")).toEqual({
      label: "",
      summary: "<p>Summary</p>",
    });
    expect(joinTourStepHtml("", "<p>Summary</p>")).toBe("<p>Summary</p>");
    expect(joinTourStepHtml(undefined, "")).toBe("");
  });

  test("does not promote a heading after other content", () => {
    const value = "<p>Introduction</p><h2>Later heading</h2>";
    expect(splitTourStepHtml(value)).toEqual({
      label: undefined,
      summary: value,
    });
  });

  test("uses a heading-free creation aid", () => {
    expect(DEFAULT_TOUR_STEP_HTML).toBe("<p>Description</p>");
  });
});
