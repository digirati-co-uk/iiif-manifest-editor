import { Vault } from "@iiif/helpers";
import { describe, expect, test } from "vitest";
import {
  getPreviewImageTransformKey,
  getPreviewStructureKey,
} from "./preview-structure";

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

describe("getPreviewImageTransformKey", () => {
  test("changes when a normalized image crop or rotation changes", () => {
    const vault = new Vault();
    const annotationRef = { id: "annotation-1", type: "Annotation" as const };
    const canvases = [{ id: "canvas-1", type: "Canvas" }];
    vault.loadManifestSync("manifest-1", {
      id: "manifest-1",
      type: "Manifest",
      label: { en: ["Preview"] },
      items: [
        {
          ...canvases[0],
          width: 1000,
          height: 800,
          items: [
            {
              id: "page-1",
              type: "AnnotationPage",
              items: [
                {
                  ...annotationRef,
                  motivation: "painting",
                  target: "canvas-1",
                  body: {
                    type: "SpecificResource",
                    selector: {
                      type: "ImageApiSelector",
                      region: "10,20,300,400",
                      rotation: "0",
                    },
                    source: { id: "image-1", type: "Image" },
                  },
                },
              ],
            },
          ],
        },
      ],
    } as any);

    const changeSelector = (region: string, rotation: string) => {
      vault.modifyEntityField(annotationRef, "body", [
        {
          type: "SpecificResource",
          selector: { type: "ImageApiSelector", region, rotation },
          source: { id: "image-1", type: "ContentResource" },
        },
      ]);
    };

    const initial = getPreviewImageTransformKey(vault, canvases);
    changeSelector("30,40,500,600", "0");
    const cropped = getPreviewImageTransformKey(vault, canvases);
    changeSelector("30,40,500,600", "90");
    const rotated = getPreviewImageTransformKey(vault, canvases);

    expect(new Set([initial, cropped, rotated])).toHaveLength(3);
  });

  test("ignores unrelated painting annotation content", () => {
    const annotation = {
      id: "annotation-1",
      type: "Annotation",
      motivation: "painting",
      label: { en: ["Before"] },
      body: [
        {
          type: "SpecificResource",
          selector: { type: "ImageApiSelector", rotation: "90" },
        },
      ],
    };
    const resources: Record<string, any> = {
      "canvas-1": { id: "canvas-1", type: "Canvas", items: [{ id: "page-1" }] },
      "page-1": {
        id: "page-1",
        type: "AnnotationPage",
        items: [{ id: "annotation-1" }],
      },
      "annotation-1": annotation,
    };
    const vault = { get: (resource: { id: string }) => resources[resource.id] };
    const canvases = [{ id: "canvas-1", type: "Canvas" }];

    const initial = getPreviewImageTransformKey(vault, canvases);
    annotation.label.en = ["After"];

    expect(getPreviewImageTransformKey(vault, canvases)).toBe(initial);
  });
});
