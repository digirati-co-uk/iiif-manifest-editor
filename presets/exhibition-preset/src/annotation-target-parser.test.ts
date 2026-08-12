import { afterEach, describe, expect, test } from "vitest";
import { expandTarget, parseSelector } from "@iiif/helpers";
import { AnnotationTargetEditor } from "../../../packages/editor-api/src/AnnotationTargetEditor";

const malformedSvg =
  "<svg xmlns='http://www.w3.org/2000/svg'><path d='MNaN,NaN NaN,NaN NaN,NaN NaN,NaN' /></svg>";

const domParser = {
  parseFromString() {
    return {
      querySelector: () => ({
        children: [
          {
            tagName: "path",
            getAttribute: (name: string) =>
              name === "d" ? "MNaN,NaN NaN,NaN NaN,NaN NaN,NaN" : null,
          },
        ],
      }),
    };
  },
};

afterEach(() => {
  delete (globalThis as any).window;
});

describe("AnnotationTargetEditor", () => {
  test("contains malformed SVG errors in the shared selector parser", () => {
    const selector = { type: "SvgSelector", value: malformedSvg };

    expect(
      parseSelector(selector as any, { domParser } as any).selector,
    ).toBeNull();
    expect(
      expandTarget(
        { type: "SpecificResource", source: "canvas", selector } as any,
        { domParser } as any,
      ).selector,
    ).toBeNull();
  });

  test("contains malformed SVG parser errors", () => {
    (globalThis as any).window = {
      DOMParser: class {
        parseFromString = domParser.parseFromString;
      },
    };

    const editor = new AnnotationTargetEditor({
      reference: { id: "annotation", type: "Annotation" },
      vault: {
        get: () => ({
          target: {
            source: "canvas",
            selector: { type: "SvgSelector", value: malformedSvg },
          },
        }),
      },
      tracker: { track: () => undefined },
      context: {},
      validators: [],
    } as any);

    expect(editor.getParsedSelector()).toBeNull();
  });

  test("does not save malformed SVG selectors", () => {
    const updates: unknown[] = [];
    const editor = new AnnotationTargetEditor({
      reference: { id: "annotation", type: "Annotation" },
      vault: {
        get: () => ({
          target: { source: "canvas" },
        }),
        modifyEntityField: (_ref: unknown, _field: string, value: unknown) =>
          updates.push(value),
      },
      tracker: { track: () => undefined },
      context: {},
      validators: [],
    } as any);

    editor.setSelector({ type: "SvgSelector", value: malformedSvg });

    expect(updates).toEqual([]);
  });
});
