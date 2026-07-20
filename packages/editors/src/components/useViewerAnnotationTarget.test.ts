import { describe, expect, test } from "vitest";
import {
  getSafeViewerAnnotationTarget,
  safelyGetViewerAnnotationTarget,
} from "./viewer-annotation-target";

const canvas = { width: 1024, height: 817 };

describe("getSafeViewerAnnotationTarget", () => {
  test("uses the whole canvas for painting targets without a selector", () => {
    expect(getSafeViewerAnnotationTarget(null, canvas)).toEqual({
      type: "BoxSelector",
      spatial: { x: 0, y: 0, width: 1024, height: 817 },
    });
  });

  test("uses the whole canvas for malformed SVG points", () => {
    expect(
      getSafeViewerAnnotationTarget(
        {
          type: "SvgSelector",
          points: [
            [Number.NaN, Number.NaN],
            [Number.NaN, Number.NaN],
          ],
        },
        canvas,
      ),
    ).toEqual({
      type: "BoxSelector",
      spatial: { x: 0, y: 0, width: 1024, height: 817 },
    });
  });

  test("uses the whole canvas when parsing a malformed SVG throws", () => {
    expect(
      safelyGetViewerAnnotationTarget(() => {
        throw new Error("malformed path data");
      }, canvas),
    ).toEqual({
      type: "BoxSelector",
      spatial: { x: 0, y: 0, width: 1024, height: 817 },
    });
  });

  test("keeps valid SVG points and derives their badge region", () => {
    expect(
      getSafeViewerAnnotationTarget(
        {
          type: "SvgSelector",
          points: [
            [10, 20],
            [30, 20],
            [30, 50],
          ],
        },
        canvas,
      ),
    ).toMatchObject({
      type: "SvgSelector",
      spatial: { x: 10, y: 20, width: 20, height: 30 },
    });
  });
});
