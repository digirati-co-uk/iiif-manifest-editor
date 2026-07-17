import { Vault } from "@iiif/helpers/vault";
import { matchBasedOnResource } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import {
  imageBrowserSlideCreator,
  keepIIIFBrowserNested,
} from "./image-browser-slide-creator";
import { imageSlideCreator } from "./image-slide-creator";

vi.mock("@manifest-editor/creators", () => ({
  iiifBrowserCreator: {
    id: "@manifest-editor/iiif-browser-creator",
    label: "IIIF Browser",
    resourceType: "ContentResource",
    resourceFields: ["id", "type"],
    supports: {
      initialData: true,
      onlyPainting: true,
      parentTypes: ["Annotation", "Manifest", "AnnotationPage"],
      parentFields: ["body", "items"],
    },
  },
}));

describe("imageBrowserSlideCreator", () => {
  test("does not inherit IIIF browser canvas side effects", () => {
    expect(imageBrowserSlideCreator.sideEffects).toEqual([]);
  });

  test("copies imported manifest tracking onto the exhibition slide canvas", async () => {
    const manifestTracking = {
      requiredStatement: {
        label: { en: ["Attribution"] },
        value: { en: ["Provided by Example"] },
      },
      rights: "https://creativecommons.org/licenses/by/4.0/",
      metadata: [{ label: { en: ["Shelfmark"] }, value: { en: ["ABC 123"] } }],
      partOf: [
        {
          id: "https://example.org/manifest",
          type: "Manifest",
          label: { en: ["Source manifest"] },
        },
      ],
    };
    const annotation = [
      { id: "https://example.org/annotation", type: "Annotation" },
    ];
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

  test("creates a second slide with painting content and exhibition behaviour", async () => {
    const canvasId = "https://example.org/canvas";
    const annotation = {
      id: "https://example.org/annotation",
      type: "Annotation",
      motivation: "painting",
      body: {
        id: "https://example.org/image.jpg",
        type: "Image",
        format: "image/jpeg",
        width: 1200,
        height: 800,
      },
      target: canvasId,
    };
    const ctx: any = {
      config: {},
      options: { targetType: "Canvas", initialData: {} },
      embed: vi.fn((resource) => ({
        get: () => resource,
        ref: () => ({ id: resource.id, type: resource.type }),
      })),
      generateId: vi.fn((type) =>
        type === "canvas" ? canvasId : `https://example.org/${type}`,
      ),
      create: vi.fn(async (definition, payload) => {
        if (definition === "@manifest-editor/iiif-browser-creator") {
          payload.trackSize({ width: 1200, height: 800 });
          return [annotation];
        }

        if (definition === "@exhibitions/image-slide-creator") {
          return imageSlideCreator.create(payload, ctx);
        }

        throw new Error(`Unexpected creator: ${definition}`);
      }),
    };

    const slide = unwrap(
      await imageBrowserSlideCreator.create({ output: [] }, ctx),
    );

    expect(slide).toMatchObject({
      id: canvasId,
      type: "Canvas",
      behavior: ["w-12", "h-8"],
      width: 1200,
      height: 800,
      items: [
        {
          type: "AnnotationPage",
          items: [annotation],
        },
      ],
      annotations: [{ type: "AnnotationPage", items: [] }],
    });
    expect(
      ctx.create.mock.calls.map(([definition]: [string]) => definition),
    ).toEqual([
      "@manifest-editor/iiif-browser-creator",
      "@exhibitions/image-slide-creator",
    ]);
  });

  test("is the only Canvas-level Browser before and after the first scroll section", () => {
    const genericBrowser = keepIIIFBrowserNested({
      ...imageBrowserSlideCreator,
      id: "@manifest-editor/iiif-browser-creator",
      tags: ["image", "image-service"],
      resourceType: "ContentResource",
      additionalTypes: ["Annotation", "Canvas"],
    } as any);
    const creators = [imageBrowserSlideCreator, genericBrowser];
    const vault = new Vault();
    const manifest = {
      id: "https://example.org/manifest",
      type: "Manifest" as const,
    };
    const available = (initialData?: Record<string, unknown>) =>
      matchBasedOnResource(
        {
          type: "Canvas",
          parent: manifest,
          property: "items",
          filter: "exhibition-slide",
          isPainting: true,
          initialData,
        },
        creators,
        { vault },
      );

    vault.loadSync(manifest.id, { ...manifest, items: [] });
    expect(available({ imageSlideBehavior: ["splash"] })).toEqual([
      imageBrowserSlideCreator,
    ]);

    vault.loadSync(manifest.id, {
      ...manifest,
      items: [{ id: "https://example.org/first", type: "Canvas" }],
    });
    expect(available()).toEqual([imageBrowserSlideCreator]);
    expect(
      matchBasedOnResource(
        {
          type: "Canvas",
          parent: manifest,
          property: "items",
          isPainting: true,
        },
        creators,
        { vault },
      ).filter((creator) => creator.label === "IIIF Browser"),
    ).toEqual([imageBrowserSlideCreator]);
  });
});

function unwrap(value: any): any {
  if (value?.get instanceof Function) return unwrap(value.get());
  if (Array.isArray(value)) return value.map(unwrap);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, unwrap(nested)]),
  );
}
