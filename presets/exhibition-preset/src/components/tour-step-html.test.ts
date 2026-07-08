import { describe, expect, test } from "vitest";
import { joinTourStepHtml, splitTourStepHtml } from "./tour-step-html";

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
});
