import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createFromIIIFBrowserOutput,
  type IIIFBrowserCreatorPayload,
} from "../../../../packages/creators/src/ContentResource/IIIFBrowserCreator/iiif-browser-creator";

const fixture = vi.hoisted(() => ({
  manifest: {} as any,
  canvas: {} as any,
  page: {} as any,
  annotation: {} as any,
  alternatePainting: {} as any,
}));

vi.mock("@iiif/helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@iiif/helpers")>();

  return {
    ...actual,
    Vault: class {
      get(reference: { id: string }) {
        return [fixture.manifest, fixture.canvas, fixture.page, fixture.annotation, fixture.alternatePainting].find(
          (resource) => resource.id === reference.id
        );
      }

      async loadManifest() {
        return fixture.manifest;
      }

      toPresentation3(resource: any) {
        return structuredClone(resource);
      }
    },
  };
});

describe("createFromIIIFBrowserOutput transforms", () => {
  beforeEach(() => {
    fixture.manifest = {
      id: "https://example.org/manifest",
      type: "Manifest",
      items: [{ id: "https://example.org/canvas", type: "Canvas" }],
    };
    fixture.canvas = {
      id: "https://example.org/canvas",
      type: "Canvas",
      items: [{ id: "https://example.org/page", type: "AnnotationPage" }],
    };
    fixture.page = {
      id: "https://example.org/page",
      type: "AnnotationPage",
      items: [{ id: "https://example.org/annotation", type: "Annotation" }],
    };
    fixture.annotation = {
      id: "https://example.org/annotation",
      type: "Annotation",
      motivation: "painting",
      target: fixture.canvas.id,
      body: {
        id: "https://example.org/image/full/max/0/default.jpg",
        type: "Image",
        format: "image/jpeg",
        width: 1000,
        height: 800,
        service: [
          {
            id: "https://example.org/image",
            type: "ImageService3",
            profile: "level2",
            width: 1000,
            height: 800,
          },
        ],
      },
    };
  });

  test.each([
    {
      name: "no transform",
      transform: {},
      expectedBody: { type: "Image" },
      expectedSize: { width: 1000, height: 800 },
    },
    {
      name: "rotation only",
      transform: { rotation: 90 },
      expectedBody: {
        type: "SpecificResource",
        selector: { type: "ImageApiSelector", rotation: "90" },
      },
      expectedSize: { width: 800, height: 1000 },
    },
    {
      name: "crop only",
      transform: {
        selector: {
          type: "BoxSelector",
          spatial: { x: 10, y: 20, width: 300, height: 400 },
        },
      },
      expectedBody: {
        type: "SpecificResource",
        selector: { type: "ImageApiSelector", region: "10,20,300,400" },
      },
      expectedSize: { width: 300, height: 400 },
    },
    {
      name: "a translated crop with the painting's inherited rotation",
      transform: {
        selector: {
          type: "BoxSelector",
          spatial: { x: 20, y: 30, width: 80, height: 60 },
        },
        imageSelector: {
          type: "BoxSelector",
          spatial: { x: 130, y: 300, width: 60, height: 80 },
        },
        imageRotation: 90,
      },
      expectedBody: {
        type: "SpecificResource",
        selector: { type: "ImageApiSelector", region: "130,300,60,80", rotation: "90" },
        source: { id: "https://example.org/image/130,300,60,80/max/90/default.jpg" },
      },
      expectedSize: { width: 80, height: 60 },
    },
    {
      name: "crop and rotation",
      transform: {
        selector: {
          type: "BoxSelector",
          spatial: { x: 10, y: 20, width: 300, height: 400 },
        },
        rotation: 270,
      },
      expectedBody: {
        type: "SpecificResource",
        selector: {
          type: "ImageApiSelector",
          region: "10,20,300,400",
          rotation: "270",
        },
        source: {
          id: "https://example.org/image/10,20,300,400/max/270/default.jpg",
        },
      },
      expectedSize: { width: 400, height: 300 },
    },
  ])("creates a painting body for $name", async ({ transform, expectedBody, expectedSize }) => {
    const trackSize = vi.fn();
    const output = await createFromIIIFBrowserOutput(
      {
        output: [
          {
            resource: fixture.canvas,
            parent: { id: fixture.manifest.id, type: "Manifest" },
            selector: undefined,
            rotation: undefined,
            ...transform,
          },
        ],
        trackSize,
      } as IIIFBrowserCreatorPayload,
      creatorContext()
    );

    expect(output[0]).toMatchObject({
      type: "Annotation",
      target: "https://example.org/target-canvas",
      body: expectedBody,
    });
    expect(trackSize).toHaveBeenLastCalledWith(expectedSize);
  });

  test("applies the crop to the selected painting when a canvas has multiple images", async () => {
    const image = "https://example.org/alternate";
    fixture.alternatePainting = {
      ...fixture.annotation,
      id: "https://example.org/alternate-painting",
      body: {
        ...fixture.annotation.body,
        id: `${image}/full/max/0/default.jpg`,
        service: [{ id: image, type: "ImageService3", profile: "level2" }],
      },
    };
    fixture.page.items.push({ id: fixture.alternatePainting.id, type: "Annotation" });
    const crop = { type: "BoxSelector" as const, spatial: { x: 200, y: 100, width: 300, height: 150 } };
    const result = await createFromIIIFBrowserOutput(
      {
        output: [
          {
            resource: fixture.canvas,
            parent: { id: fixture.manifest.id, type: "Manifest" },
            selector: crop,
            imageSelector: crop,
            rotation: 90,
            selectedPainting: {
              id: fixture.alternatePainting.body.id,
              type: "Image",
              annotationId: fixture.alternatePainting.id,
            },
          },
        ],
      },
      creatorContext()
    );
    expect(result[0].body.source.id).toBe(`${image}/200,100,300,150/max/90/default.jpg`);
  });
});

function creatorContext(): any {
  return {
    config: {},
    options: { targetType: "Annotation" },
    embed: (resource: any) => resource,
    generateId: (type: string) => `https://example.org/generated-${type}`,
    getTarget: () => "https://example.org/target-canvas",
    vault: { loadSync: vi.fn() },
  };
}
