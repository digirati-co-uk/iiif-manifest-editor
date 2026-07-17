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
}));

vi.mock("@iiif/helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@iiif/helpers")>();

  return {
    ...actual,
    Vault: class {
      get(reference: { id: string }) {
        return [
          fixture.manifest,
          fixture.canvas,
          fixture.page,
          fixture.annotation,
        ].find((resource) => resource.id === reference.id);
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
    },
    {
      name: "rotation only",
      transform: { rotation: 90 },
      expectedBody: {
        type: "SpecificResource",
        selector: { type: "ImageApiSelector", rotation: "90" },
      },
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
      },
    },
  ])(
    "creates a painting body for $name",
    async ({ transform, expectedBody }) => {
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
        } as IIIFBrowserCreatorPayload,
        creatorContext(),
      );

      expect(output[0]).toMatchObject({
        type: "Annotation",
        target: "https://example.org/target-canvas",
        body: expectedBody,
      });
    },
  );
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
