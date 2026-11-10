import { describe, expect, test, vi } from "vitest";
import { createFromIIIFBrowserOutput } from "./iiif-browser-creator";
import { formatIIIFBrowserOutput } from "./iiif-browser-output";
import type { CreatorFunctionContext } from "@manifest-editor/creator-api";

const service = { id: "https://example.org/image", type: "ImageService3", profile: "level1", width: 1200, height: 800 };
function context() {
  let nextId = 0;
  return {
    options: { targetType: "Canvas" },
    embed: (value: unknown) => value,
    generateId: (type: string) => `https://example.org/${type}/${++nextId}`,
    create: vi.fn(async () => ({ id: `${service.id}/full/max/0/default.jpg`, type: "Image", service: [service] })),
  } as unknown as CreatorFunctionContext;
}

describe("image services from the notebook browser", () => {
  test("looks up image services by ID instead of their browser-only resource type", () => {
    const get = vi.fn(() => service);
    const output = formatIIIFBrowserOutput({ id: service.id, type: "ImageService" }, null, { get } as any);
    expect(get).toHaveBeenCalledWith(service.id);
    expect(output[0].resource).toBe(service);
  });

  test("creates a canvas with a painting annotation from an image service", async () => {
    const result = await createFromIIIFBrowserOutput(
      { output: [{ resource: service, parent: undefined, selector: undefined, rotation: undefined }] },
      context()
    );
    expect(result[0]).toMatchObject({
      type: "Canvas",
      width: 1200,
      height: 800,
      items: [
        {
          type: "AnnotationPage",
          items: [{ type: "Annotation", motivation: "painting", body: { type: "Image", service: [service] } }],
        },
      ],
    });
    expect(result[0].items[0].items[0].target).toBe(result[0].id);
  });

  test("preserves a cropped, rotated service and its resulting canvas dimensions", async () => {
    const result = await createFromIIIFBrowserOutput(
      {
        output: [
          {
            resource: service,
            parent: undefined,
            selector: { type: "BoxSelector", spatial: { x: 10, y: 20, width: 300, height: 200 } } as any,
            rotation: 90,
          },
        ],
      },
      context()
    );
    expect(result[0]).toMatchObject({ type: "Canvas", width: 200, height: 300 });
    expect(result[0].items[0].items[0].body).toMatchObject({
      type: "SpecificResource",
      selector: { type: "ImageApiSelector", region: "10,20,300,200", rotation: "90" },
    });
  });
});
