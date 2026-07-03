import { describe, expect, test, vi } from "vitest";
import { imageBrowserSlideCreator } from "./image-browser-slide-creator";
import { imageSlideCreator } from "./image-slide-creator";

describe("imageBrowserSlideCreator", () => {
  test("copies imported manifest tracking onto the exhibition slide canvas", async () => {
    const manifestTracking = {
      requiredStatement: {
        label: { en: ["Attribution"] },
        value: { en: ["Provided by Example"] },
      },
      rights: "https://creativecommons.org/licenses/by/4.0/",
      metadata: [{ label: { en: ["Shelfmark"] }, value: { en: ["ABC 123"] } }],
      partOf: [{ id: "https://example.org/manifest", type: "Manifest", label: { en: ["Source manifest"] } }],
    };
    const annotation = [{ id: "https://example.org/annotation", type: "Annotation" }];
    const ctx: any = {
      config: {},
      options: { targetType: "Canvas" },
      embed: vi.fn((resource) => ({
        get: () => resource,
        ref: () => ({ id: resource.id, type: resource.type }),
      })),
      generateId: vi.fn((type) => `https://example.org/${type}`),
      create: vi.fn(async (definition, payload) => {
        if (definition === "@manifest-editor/iiif-browser-creator") {
          payload.trackSize({ width: 640, height: 480 });
          payload.trackManifest(manifestTracking);
          return annotation;
        }

        if (definition === "@exhibitions/image-slide-creator") {
          return imageSlideCreator.create(payload, ctx);
        }

        throw new Error(`Unexpected creator: ${definition}`);
      }),
    };

    const slide = await imageBrowserSlideCreator.create({ output: [] }, ctx);

    expect(slide.get()).toMatchObject({
      requiredStatement: manifestTracking.requiredStatement,
      rights: manifestTracking.rights,
      metadata: manifestTracking.metadata,
      partOf: manifestTracking.partOf,
      width: 640,
      height: 480,
    });
  });
});
