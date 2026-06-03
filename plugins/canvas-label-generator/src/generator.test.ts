import { describe, expect, test } from "vitest";
import {
  createCanvasLabelPreview,
  extractFilenameFromSource,
  generateCanvasLabel,
  getDefaultRunOptions,
  getLabelFingerprint,
  isUntitledLabel,
  type CanvasLabelPreviewInput,
} from "./generator";

function input(overrides: Partial<CanvasLabelPreviewInput> = {}): CanvasLabelPreviewInput {
  const currentLabel = overrides.currentLabel ?? { en: [""] };
  return {
    canvasId: "https://example.org/canvas/1",
    canvasIndex: 0,
    currentLabel,
    currentLabelText: "",
    currentLanguageValue: "",
    labelFingerprint: getLabelFingerprint(currentLabel),
    filename: "0001_front-cover.tif",
    filenameSource: "painting",
    rangeLabel: "Chapter 1",
    rangeIndex: 1,
    warnings: [],
    ...overrides,
  };
}

describe("canvas label generator", () => {
  test("generates page, plate, and image labels with padded numbering", () => {
    expect(generateCanvasLabel(input({ canvasIndex: 4 }), { pattern: "Page {n:02}" })).toBe("Page 05");
    expect(generateCanvasLabel(input({ canvasIndex: 1 }), { pattern: "Plate {n}", start: 3 })).toBe("Plate 4");
    expect(generateCanvasLabel(input({ canvasIndex: 2 }), { pattern: "Image {n}", increment: 2 })).toBe("Image 5");
  });

  test("supports roman, alphabetic, and folio numbering", () => {
    expect(generateCanvasLabel(input({ canvasIndex: 3 }), { pattern: "Plate {n}", numberStyle: "roman-lower" })).toBe(
      "Plate iv",
    );
    expect(generateCanvasLabel(input({ canvasIndex: 26 }), { pattern: "Sheet {n}", numberStyle: "alphabetic-upper" })).toBe(
      "Sheet AA",
    );
    expect(generateCanvasLabel(input({ canvasIndex: 2 }), { pattern: "Folio {n}", numberStyle: "folio" })).toBe(
      "Folio 2r",
    );
  });

  test("cleans source filenames", () => {
    expect(generateCanvasLabel(input({ filename: "MS_001-front%20cover.tif" }), { pattern: "{filename}" })).toBe(
      "MS 001 front cover",
    );
    expect(
      extractFilenameFromSource("https://images.example.org/iiif/0001/full/1200,/0/default.jpg", "fallback"),
    ).toBe("0001");
  });

  test("normalises imported IIIF labels", () => {
    expect(
      generateCanvasLabel(input({ currentLabel: { en: ["  front   cover "] } }), {
        pattern: "{label}",
        filename: { ...getDefaultRunOptions().filename, titleCase: true },
      }),
    ).toBe("Front Cover");
  });

  test("generates range-prefixed labels and cleans missing range punctuation", () => {
    expect(
      generateCanvasLabel(input({ canvasIndex: 8, rangeIndex: 2 }), {
        pattern: "{range}: Page {n}",
        restartPerRange: true,
      }),
    ).toBe("Chapter 1: Page 2");

    expect(generateCanvasLabel(input({ rangeLabel: "" }), { pattern: "{range}: Page {n}" })).toBe("Page 1");
  });

  test("detects duplicates and untitled labels", () => {
    const preview = createCanvasLabelPreview(
      [
        input({ canvasId: "https://example.org/canvas/1", rangeIndex: 1 }),
        input({ canvasId: "https://example.org/canvas/2", canvasIndex: 1, rangeIndex: 1 }),
      ],
      { pattern: "Page {rangeIndex}" },
    );

    expect(preview.warnings).toBe(2);
    expect(preview.items.every((item) => item.warnings.includes("Generated label duplicates another canvas"))).toBe(true);
    expect(isUntitledLabel(undefined)).toBe(true);
    expect(isUntitledLabel({ en: ["Untitled canvas"] })).toBe(true);
    expect(isUntitledLabel({ en: ["Manuscript page"] })).toBe(false);
  });

  test("skips non-untitled canvases when protected mode is enabled", () => {
    const preview = createCanvasLabelPreview(
      [
        input({ canvasId: "https://example.org/canvas/1", currentLabel: { en: ["Untitled"] } }),
        input({ canvasId: "https://example.org/canvas/2", canvasIndex: 1, currentLabel: { en: ["Existing"] } }),
      ],
      { pattern: "Page {n}", onlyUntitled: true },
    );

    expect(preview.changed).toBe(1);
    expect(preview.skipped).toBe(1);
    expect(preview.items[1]?.skipReason).toBe("Canvas is not untitled");
  });
});
