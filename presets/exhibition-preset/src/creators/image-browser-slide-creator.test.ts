vi.mock("@manifest-editor/editors", () => ({ CanvasLayoutForm: () => null }));
import { Vault } from "@iiif/helpers/vault";
import { matchBasedOnResource } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import { imageBrowserSlideCreator, keepIIIFBrowserNested } from "./image-browser-slide-creator";
import { imageSlideCreator } from "./image-slide-creator";

vi.mock("@manifest-editor/components", () => ({ EmptyCanvasIcon: () => null, ImageListIcon: () => null }));
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
    expect(imageBrowserSlideCreator.tags).toContain("exhibition-slideshow-slide");
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
    const annotation = [{ id: "https://example.org/annotation", type: "Annotation" }];
    const ctx: any = {
      config: {},
      options: { targetType: "Canvas", initialData: { imageSlideBehavior: ["splash"] } },
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
      behavior: ["splash"],
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
      generateId: vi.fn((type) => (type === "canvas" ? canvasId : `https://example.org/${type}`)),
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

    const slide = unwrap(await imageBrowserSlideCreator.create({ output: [] }, ctx));

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
    expect(ctx.create.mock.calls.map(([definition]: [string]) => definition)).toEqual([
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
        { vault }
      );

    vault.loadSync(manifest.id, { ...manifest, items: [] });
    expect(available({ imageSlideBehavior: ["splash"] })).toEqual([imageBrowserSlideCreator]);

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
        { vault }
      ).filter(
        (creator) =>
          creator.configKey === imageBrowserSlideCreator.configKey ||
          creator.id === "@manifest-editor/iiif-browser-creator"
      )
    ).toEqual([imageBrowserSlideCreator]);
    expect(genericBrowser.additionalTypes).toEqual(["Annotation"]);
    expect(imageBrowserSlideCreator.configKey).toBe("@manifest-editor/iiif-browser-creator");
    expect(
      matchBasedOnResource(
        {
          type: "Canvas",
          parent: {
            id: "https://example.org/page",
            type: "AnnotationPage",
          },
          property: "items",
          isPainting: true,
        },
        creators,
        { vault }
      ).filter(
        (creator) =>
          creator.configKey === imageBrowserSlideCreator.configKey ||
          creator.id === "@manifest-editor/iiif-browser-creator"
      )
    ).toEqual([]);
    expect(
      matchBasedOnResource(
        {
          type: "Annotation",
          parent: {
            id: "https://example.org/page",
            type: "AnnotationPage",
          },
          property: "items",
          isPainting: true,
        },
        creators,
        { vault }
      ).filter(
        (creator) =>
          creator.configKey === imageBrowserSlideCreator.configKey ||
          creator.id === "@manifest-editor/iiif-browser-creator"
      )
    ).toEqual([genericBrowser]);
  });
});

function unwrap(value: any): any {
  if (value?.get instanceof Function) return unwrap(value.get());
  if (Array.isArray(value)) return value.map(unwrap);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, unwrap(nested)]));
}

test("imports a timed audio canvas with accompanying artwork and configured metadata", async () => {
  const source = {
    id: "https://example.org/source-canvas",
    type: "Canvas",
    duration: 42,
    label: { en: ["Interview"] },
    summary: { en: ["A recorded conversation"] },
    accompanyingCanvas: { id: "https://example.org/artwork", type: "Canvas", width: 600, height: 400, items: [] },
    metadata: [{ label: { en: ["Speaker"] }, value: { en: ["Jane"] } }],
    items: [
      {
        id: "https://example.org/source-page",
        type: "AnnotationPage",
        items: [
          {
            id: "https://example.org/source-annotation",
            type: "Annotation",
            motivation: "painting",
            target: "https://example.org/source-canvas",
            body: { id: "https://example.org/audio.mp3", type: "Sound", duration: 42 },
          },
        ],
      },
    ],
  };
  const ctx: any = {
    config: {},
    options: { initialData: { audioSlideBehavior: ["no-audio-waveform", "image-cover"] } },
    generateId: (type: string) => `https://example.org/new/${type}`,
    embed: (resource: any) => ({ get: () => resource }),
    create: vi.fn(async (_creator, data) => {
      data.trackManifest({
        metadata: [{ label: { en: ["Credit"] }, value: { en: ["Archive"] } }],
        partOf: [{ id: "https://example.org/source", type: "Manifest" }],
      });
      data.trackCanvas(source);
      return [];
    }),
  };
  const result = await imageBrowserSlideCreator.create({ output: [] }, ctx);
  expect(result.get()).toMatchObject({
    id: "https://example.org/new/canvas",
    duration: 42,
    label: source.label,
    summary: source.summary,
    accompanyingCanvas: source.accompanyingCanvas,
    behavior: ["no-audio-waveform", "image-cover", "audio", "w-12", "h-8"],
    metadata: [...source.metadata, { label: { en: ["Credit"] }, value: { en: ["Archive"] } }],
    items: [{ items: [{ target: "https://example.org/new/canvas", body: { type: "Sound" } }] }],
  });
});

test("creates a separate slide for every selected audio canvas", async () => {
  let sequence = 0;
  const makeCanvas = (index: number) => ({
    id: `https://example.org/audio/${index}`,
    type: "Canvas",
    duration: index * 10,
    items: [
      {
        id: `https://example.org/page/${index}`,
        type: "AnnotationPage",
        items: [
          {
            id: `https://example.org/annotation/${index}`,
            type: "Annotation",
            motivation: "painting",
            target: `https://example.org/audio/${index}`,
            body: { id: `https://example.org/${index}.mp3`, type: "Sound" },
          },
        ],
      },
    ],
  });
  const ctx: any = {
    config: {},
    options: { initialData: {} },
    generateId: (type: string) => `https://example.org/new/${type}/${++sequence}`,
    embed: (resource: any) => ({ get: () => resource }),
    create: vi.fn(async (_creator, data) => {
      data.trackManifest({ partOf: [{ id: "https://example.org/manifest/1", type: "Manifest" }] });
      data.trackCanvas(makeCanvas(1));
      data.trackManifest({ partOf: [{ id: "https://example.org/manifest/2", type: "Manifest" }] });
      data.trackCanvas(makeCanvas(2));
      return [];
    }),
  };
  const result: any = await imageBrowserSlideCreator.create({ output: [] }, ctx);
  expect(result).toHaveLength(2);
  expect(result[0].get()).toMatchObject({ duration: 10, partOf: [{ id: "https://example.org/manifest/1" }] });
  expect(result[1].get()).toMatchObject({ duration: 20, partOf: [{ id: "https://example.org/manifest/2" }] });
  expect(result[0].get().id).not.toBe(result[1].get().id);
  for (const slide of result) expect(slide.get().items[0].items[0].target).toBe(slide.get().id);
});

test.each([false, true])(
  "real audio import preserves credits with an existing or empty canvas statement (%s)",
  async (empty) => {
    const { createFromIIIFBrowserOutput } =
      await import("../../../../packages/creators/src/ContentResource/IIIFBrowserCreator/iiif-browser-creator");
    const manifestId = `https://example.org/audio-import-${empty}`;
    const canvasId = manifestId + "/canvas";
    const credit = { label: { en: ["Restrictions on use"] }, value: { en: ["Archive credit"] } };
    const statement = { label: { en: ["Credit"] }, value: { en: empty ? [] : ["Canvas credit"] } };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            id: manifestId,
            type: "Manifest",
            metadata: [credit],
            items: [
              {
                id: canvasId,
                type: "Canvas",
                duration: 10,
                requiredStatement: statement,
                items: [
                  {
                    id: canvasId + "/p",
                    type: "AnnotationPage",
                    items: [
                      {
                        id: canvasId + "/a",
                        type: "Annotation",
                        motivation: "painting",
                        target: canvasId,
                        body: { id: manifestId + "/file.mp3", type: "Sound", duration: 10 },
                      },
                    ],
                  },
                ],
              },
            ],
          }),
          { headers: { "Content-Type": "application/json" } }
        )
    ) as typeof fetch;
    try {
      const vault = new Vault();
      const ctx: any = {
        vault,
        getTarget: () => ({ id: "https://example.org/imported", type: "Canvas" }),
        config: { requiredStatementMetadataLabels: ["Restrictions on use"] },
        options: { targetType: "Canvas", initialData: {} },
        generateId: (type: string) => `https://example.org/imported-${empty}/${type}`,
        embed: (resource: any) => ({ get: () => resource }),
        create: async (_creator: string, payload: any) =>
          createFromIIIFBrowserOutput(payload, {
            ...ctx,
            options: { targetType: "Annotation", target: { id: "https://example.org/imported", type: "Canvas" } },
          }),
      };
      const result = await imageBrowserSlideCreator.create(
        {
          output: [
            {
              resource: { id: canvasId, type: "Canvas" },
              parent: { id: manifestId, type: "Manifest" },
            },
          ],
        } as any,
        ctx
      );
      const slide = result.get();
      expect(slide.requiredStatement).toEqual(empty ? credit : statement);
      expect(slide.metadata).toEqual(empty ? [] : [credit]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
);
