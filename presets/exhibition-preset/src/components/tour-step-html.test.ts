import { describe, expect, test } from "vitest";
import { DEFAULT_TOUR_STEP_HTML, joinTourStepHtml, splitTourStepHtml } from "./tour-step-html";

describe("tour step HTML", () => {
  test("splits the first heading into the label", () => {
    expect(splitTourStepHtml("<h2>Step one</h2><p>Summary</p>")).toEqual({
      label: "Step one",
      summary: "<p>Summary</p>",
    });
  });

  test("joins a plain label and HTML summary", () => {
    const html = joinTourStepHtml("A < B", "<p>Summary</p>");
    expect(html).toBe("<h2>A &lt; B</h2><p>Summary</p>");
    expect(splitTourStepHtml(html).label).toBe("A < B");
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
    expect(joinTourStepHtml("", "<p>Summary</p>")).toBe("<h2></h2><p>Summary</p>");
    expect(joinTourStepHtml(undefined, "")).toBe("");
  });

  test("keeps a cleared label empty after save and rehydration", () => {
    const saved = joinTourStepHtml("", "<p>Summary</p>");
    const rehydrated = splitTourStepHtml(saved);

    expect(rehydrated.label ?? "").toBe("");
    expect(rehydrated.summary).toBe("<p>Summary</p>");
  });

  test("does not promote a summary heading after a cleared label", () => {
    const saved = joinTourStepHtml("", "<h3>Summary heading</h3><p>Body</p>");
    expect(splitTourStepHtml(saved)).toEqual({
      label: "",
      summary: "<h3>Summary heading</h3><p>Body</p>",
    });
  });

  test("does not promote a heading after other content", () => {
    const value = "<p>Introduction</p><h4>Later heading</h4>";
    expect(splitTourStepHtml(value)).toEqual({
      label: undefined,
      summary: value,
    });
  });

  test("ignores comments before the first meaningful heading", () => {
    expect(splitTourStepHtml("<!-- note --><h2>Step one</h2><p>Summary</p>")).toEqual({
      label: "Step one",
      summary: "<p>Summary</p>",
    });
  });

  test("sanitizes imported summary HTML before previewing it", () => {
    expect(splitTourStepHtml('<h2>Step</h2><img src="javascript:alert(1)" onerror="alert(1)" alt="Unsafe">')).toEqual({
      label: "Step",
      summary: '<img alt="Unsafe">',
    });
  });

  test("uses a heading-free creation aid", () => {
    expect(DEFAULT_TOUR_STEP_HTML).toBe("<p>Description</p>");
  });
});
