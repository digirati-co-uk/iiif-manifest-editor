import { describe, expect, test, vi } from "vitest";
import {
  clampIntervalToNeighbors,
  createTemporalCanvasReference,
  formatTemporalFragmentValue,
  formatTime,
  getSegmentsForCanvas,
  getTemporalGaps,
  getTemporalSegmentsFromStructures,
  parseTemporalRangeItem,
  parseTimeInput,
  validateTemporalSegments,
} from "./temporal-range-utils";

describe("temporal range utils", () => {
  test("serializes temporal canvas references", () => {
    expect(
      createTemporalCanvasReference("https://example.org/canvas/1", 12.42, 42),
    ).toEqual({
      type: "SpecificResource",
      source: { id: "https://example.org/canvas/1", type: "Canvas" },
      selector: { type: "FragmentSelector", value: "t=12.42,42" },
    });
    expect(formatTemporalFragmentValue(1.23456, 9.8)).toBe("t=1.235,9.8");
  });

  test("parses temporal selectors and ignores spatial fragments", () => {
    expect(
      parseTemporalRangeItem({
        type: "SpecificResource",
        source: { id: "https://example.org/canvas/1", type: "Canvas" },
        selector: {
          type: "FragmentSelector",
          value: "xywh=10,10,100,100&t=1.5,4",
        },
      }),
    ).toEqual({ canvasId: "https://example.org/canvas/1", start: 1.5, end: 4 });

    expect(
      parseTemporalRangeItem({
        type: "SpecificResource",
        source: { id: "https://example.org/canvas/1#t=2,8", type: "Canvas" },
      }),
    ).toEqual({ canvasId: "https://example.org/canvas/1", start: 2, end: 8 });

    expect(
      parseTemporalRangeItem({
        type: "SpecificResource",
        source: { id: "https://example.org/canvas/1", type: "Canvas" },
        selector: { type: "FragmentSelector", value: "xywh=10,10,100,100" },
      }),
    ).toBeNull();
  });

  test("flattens temporal ranges and sorts canvas-local segments", () => {
    const ranges: Record<string, any> = {
      r1: {
        id: "r1",
        type: "Range",
        label: { en: ["Second"] },
        items: [createTemporalCanvasReference("c1", 10, 20)],
      },
      r2: {
        id: "r2",
        type: "Range",
        label: { en: ["First"] },
        items: [createTemporalCanvasReference("c1", 0, 5)],
      },
      r3: {
        id: "r3",
        type: "Range",
        label: { en: ["Nested"] },
        items: [{ id: "r2", type: "Range" }],
      },
    };
    const vault = {
      get: vi.fn((ref: any) => ranges[ref.id]),
    };

    const segments = getSegmentsForCanvas(
      getTemporalSegmentsFromStructures(vault, {
        id: "m1",
        type: "Manifest",
        structures: [
          { id: "r1", type: "Range" },
          { id: "r3", type: "Range" },
        ],
      }),
      "c1",
    );

    expect(segments.map((segment) => segment.id)).toEqual(["r2", "r1"]);
    expect(segments[0]?.parentRef).toEqual({ id: "r3", type: "Range" });
    expect(segments[0]?.parentKey).toBe("items");
  });

  test("validates time bounds, overlap, and blank titles", () => {
    expect(
      validateTemporalSegments(
        [
          { id: "r1", title: "One", start: 0, end: 10 },
          { id: "r2", title: "", start: 9, end: 15 },
          { id: "r3", title: "Bad", start: 20, end: 19 },
        ],
        12,
        { requireTitle: true },
      ).issues.map((issue) => issue.code),
    ).toEqual([
      "out-of-bounds",
      "blank-title",
      "invalid-time",
      "out-of-bounds",
      "overlap",
    ]);
  });

  test("calculates gaps and clamps against neighbors", () => {
    expect(
      getTemporalGaps(
        [
          { start: 5, end: 10 },
          { start: 20, end: 25 },
        ],
        30,
      ),
    ).toEqual([
      { start: 0, end: 5, duration: 5 },
      { start: 10, end: 20, duration: 10 },
      { start: 25, end: 30, duration: 5 },
    ]);

    expect(
      clampIntervalToNeighbors(
        { start: 8, end: 22 },
        [
          { id: "a", start: 0, end: 10 },
          { id: "b", start: 20, end: 30 },
        ] as any,
        40,
      ),
    ).toEqual({ start: 10, end: 20 });
  });

  test("formats and parses readable times", () => {
    expect(formatTime(3.5)).toBe("00:03.500");
    expect(formatTime(3723.04)).toBe("01:02:03.040");
    expect(parseTimeInput("01:02:03.040")).toBe(3723.04);
    expect(parseTimeInput("02:03.500")).toBe(123.5);
    expect(parseTimeInput("12.25")).toBe(12.25);
  });
});
