import { Vault } from "@iiif/helpers/vault";
import { describe, expect, it, vi } from "vitest";
import { buildOpenRouterNavigationToolDefinitions } from "../navigation-tools";

function createVault() {
  const manifest = {
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Fixture manifest"] },
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Canvas 1"] },
        items: [],
        annotations: [],
      },
    ],
    structures: [
      {
        id: "https://example.org/range/1",
        type: "Range",
        label: { en: ["Range 1"] },
        items: [],
      },
    ],
  };

  const vault = new Vault();
  vault.loadManifestSync(manifest.id, manifest as any);
  return vault;
}

describe("openrouter navigation tools", () => {
  it("registers only the navigation tools supported by the active preset", () => {
    const definitions = buildOpenRouterNavigationToolDefinitions({
      vault: createVault(),
      hasCanvasNavigation: true,
      hasRangeNavigation: false,
      currentLayout: {
        leftPanelId: null,
        centerPanelId: null,
        rightPanelId: "@manifest-editor/editor",
        rightPanelTab: null,
      },
      focusCanvas: vi.fn(),
      focusRange: vi.fn(),
    });

    expect(definitions.map((definition) => definition.name)).toEqual(["me_focus_canvas"]);
  });

  it("focuses canvases and ranges using the provided callbacks", async () => {
    const focusCanvas = vi.fn();
    const focusRange = vi.fn();
    const definitions = buildOpenRouterNavigationToolDefinitions({
      vault: createVault(),
      hasCanvasNavigation: true,
      hasRangeNavigation: true,
      currentLayout: {
        leftPanelId: "overview",
        centerPanelId: "overview",
        rightPanelId: "@manifest-editor/editor",
        rightPanelTab: "descriptive",
      },
      focusCanvas,
      focusRange,
    });

    const focusCanvasTool = definitions.find((definition) => definition.name === "me_focus_canvas");
    const focusRangeTool = definitions.find((definition) => definition.name === "me_focus_range");

    expect(focusCanvasTool).toBeTruthy();
    expect(focusRangeTool).toBeTruthy();

    const canvasResult = await focusCanvasTool!.execute({
      canvas: { id: "https://example.org/canvas/1", type: "Canvas" },
    });
    const rangeResult = await focusRangeTool!.execute({
      range: { id: "https://example.org/range/1", type: "Range" },
    });

    expect(focusCanvas).toHaveBeenCalledWith({ id: "https://example.org/canvas/1", type: "Canvas" });
    expect(focusRange).toHaveBeenCalledWith({ id: "https://example.org/range/1", type: "Range" });
    expect(canvasResult.data.layout.leftPanelId).toBe("canvas-listing");
    expect(canvasResult.data.layout.centerPanelId).toBe("current-canvas");
    expect(rangeResult.data.layout.leftPanelId).toBe("@manifest-editor/ranges-listing");
    expect(rangeResult.data.layout.centerPanelId).toBe("range-workbench");
  });
});
