import { Vault } from "@iiif/helpers/vault";
import { describe, expect, it } from "vitest";
import {
  buildManifestEditorAiContextSummary,
  buildManifestEditorSystemPrompt,
} from "../ai-context";

function createManifest(options: { canvasCount?: number; topLevelRangeCount?: number } = {}) {
  const canvasCount = options.canvasCount ?? 3;
  const topLevelRangeCount = options.topLevelRangeCount ?? 2;

  const canvases = Array.from({ length: canvasCount }, (_, index) => ({
    id: `https://example.org/canvas/${index + 1}`,
    type: "Canvas",
    label: { en: [`Canvas ${index + 1}`] },
    width: 1000 + index,
    height: 1200 + index,
    items: [],
    annotations: [],
  }));

  const structures = Array.from({ length: topLevelRangeCount }, (_, index) => ({
    id: `https://example.org/range/${index + 1}`,
    type: "Range",
    label: { en: [`Range ${index + 1}`] },
    items:
      index === 0
        ? [
            {
              id: "https://example.org/range/1/child",
              type: "Range",
              label: { en: ["Chapter 1"] },
              items: [canvases[0], canvases[1]].filter(Boolean),
            },
          ]
        : [canvases[index] || canvases[0]].filter(Boolean),
  }));

  return {
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Fixture manifest"] },
    summary: { en: ["Manifest summary"] },
    items: canvases,
    structures,
    annotations: [],
  };
}

function createSummary(options: { canvasCount?: number; topLevelRangeCount?: number } = {}) {
  const manifest = createManifest(options);
  const vault = new Vault();
  vault.loadManifestSync(manifest.id, manifest as any);

  const rootEntity = vault.get({ id: manifest.id, type: "Manifest" } as any);
  const activeCanvasEntity = vault.get({ id: manifest.items[1]!.id, type: "Canvas" } as any);
  const activeRangeEntity = vault.get({ id: "https://example.org/range/1/child", type: "Range" } as any);

  return buildManifestEditorAiContextSummary({
    mode: "manifest",
    vault,
    rootEntity,
    currentEntity: activeCanvasEntity,
    stackEntities: [rootEntity, activeCanvasEntity, activeRangeEntity],
    activeCanvasEntity,
    activeRangeEntity,
    layout: {
      leftPanelId: "canvas-listing",
      centerPanelId: "current-canvas",
      rightPanelId: "@manifest-editor/editor",
      rightPanelTab: null,
    },
    previewLink: "https://preview.example.org",
  });
}

describe("ai context helpers", () => {
  it("builds manifest, canvas, and range context summaries", () => {
    const summary = createSummary();

    expect(summary.manifest.canvasCount).toBe(3);
    expect(summary.manifest.topLevelRangeCount).toBe(2);
    expect(summary.manifest.canvases).toEqual([
      { id: "https://example.org/canvas/1", label: "Canvas 1", index: 0 },
      { id: "https://example.org/canvas/2", label: "Canvas 2", index: 1 },
      { id: "https://example.org/canvas/3", label: "Canvas 3", index: 2 },
    ]);
    expect(summary.activeCanvas?.index).toBe(1);
    expect(summary.activeCanvas?.totalCanvases).toBe(3);
    expect(summary.activeCanvas?.width).toBe(1001);
    expect(summary.activeRange?.path).toEqual([
      { id: "https://example.org/range/1", label: "Range 1" },
      { id: "https://example.org/range/1/child", label: "Chapter 1" },
    ]);
    expect(summary.activeRange?.childRangeCount).toBe(0);
    expect(summary.activeRange?.canvasItemCount).toBe(2);
  });

  it("truncates large manifest outlines and builds the stricter system prompt", () => {
    const summary = createSummary({ canvasCount: 55, topLevelRangeCount: 28 });
    const prompt = buildManifestEditorSystemPrompt(summary);

    expect(summary.manifest.canvases).toHaveLength(50);
    expect(summary.manifest.canvasesTruncated).toBe(true);
    expect(summary.manifest.topLevelRanges).toHaveLength(25);
    expect(summary.manifest.topLevelRangesTruncated).toBe(true);
    expect(prompt).toContain("Before every mutation");
    expect(prompt).toContain("creator-backed workflows");
    expect(prompt).toContain("For multiple image services");
    expect(prompt).toContain("data.topLevelRange");
    expect(prompt).toContain("synthetic, placeholder, or test data");
    expect(prompt).toContain("non-empty `patches` array");
    expect(prompt).toContain('"canvasCount": 55');
  });
});
