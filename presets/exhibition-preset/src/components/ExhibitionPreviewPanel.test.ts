import { describe, expect, test } from "vitest";
import { getPreviewStructureKey } from "./preview-structure";

describe("getPreviewStructureKey", () => {
  const root = { id: "https://example.org/manifest", type: "Manifest" };
  const first = { id: "https://example.org/canvas/1", type: "Canvas" };
  const second = { id: "https://example.org/canvas/2", type: "Canvas" };

  test("changes for canvas additions, moves, and deletions", () => {
    const initial = getPreviewStructureKey(root, [first]);
    const added = getPreviewStructureKey(root, [first, second]);
    const moved = getPreviewStructureKey(root, [second, first]);
    const deleted = getPreviewStructureKey(root, [second]);

    expect(new Set([initial, added, moved, deleted])).toHaveLength(4);
  });

  test("does not include selection or canvas content", () => {
    expect(getPreviewStructureKey(root, [first])).toBe(
      getPreviewStructureKey(root, [
        { ...first, label: { en: ["Changed"] } } as typeof first,
      ]),
    );
  });
});
