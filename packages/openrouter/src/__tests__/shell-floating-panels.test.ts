import { describe, expect, it } from "vitest";
import { extendApp, mapApp } from "@manifest-editor/shell";

describe("shell floating panels", () => {
  it("merges floating panels when extending an app", () => {
    const app = mapApp({
      default: {
        id: "manifest-editor",
        title: "Manifest Editor",
      },
      leftPanels: [],
      rightPanels: [],
      centerPanels: [],
      floatingPanels: [
        {
          id: "floating-base",
          label: "Base floating panel",
          render: () => null,
        },
      ],
    });

    const extended = extendApp(app, app.metadata, {
      floatingPanels: [
        {
          id: "floating-extension",
          label: "Extension floating panel",
          render: () => null,
        },
      ],
    });

    expect(extended.layout.floatingPanels?.map((panel) => panel.id)).toEqual([
      "floating-base",
      "floating-extension",
    ]);
  });
});
