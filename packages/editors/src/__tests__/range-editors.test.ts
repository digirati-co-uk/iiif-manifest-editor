import { describe, expect, test } from "vitest";
import { allEditors } from "../definitions";

describe("Range editor tabs", () => {
  const rangeTabs = allEditors.filter((editor) => (editor.supports.resourceTypes as string[]).includes("Range"));

  test("Overview is the first tab, ahead of Structure", () => {
    const ids = rangeTabs.map((editor) => editor.id);
    expect(ids[0]).toBe("@manifest-editor/range-overview");
    expect(ids.indexOf("@manifest-editor/range-overview")).toBeLessThan(
      ids.indexOf("@manifest-editor/range-structural")
    );
  });

  test("ranges use the dedicated overview rather than the combined overview", () => {
    expect(rangeTabs.map((editor) => editor.id)).not.toContain("@manifest-editor/overview");
  });
});
