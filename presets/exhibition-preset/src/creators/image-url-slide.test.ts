import { imageUrlCreator } from "@manifest-editor/creators";
import { describe, expect, test, vi } from "vitest";
import { imageSlideCreator } from "./image-slide-creator";
import { imageUrlSlideCreator } from "./image-url-slide";

vi.mock("@manifest-editor/components", () => ({ EmptyCanvasIcon: () => null }));
vi.mock("@manifest-editor/creators", () => ({
  imageUrlCreator: {
    id: "@manifest-editor/image-url-creator",
    create: (data: any, ctx: any) =>
      ctx.embed({
        id: data.url,
        type: "Image",
        width: data.width,
        height: data.height,
      }),
  },
}));

test("creates a whole-canvas slideshow image without multi-image behaviour", async () => {
  let id = 0;
  const ctx: any = {
    config: {},
    options: { initialData: {} },
    embed: (resource: any) => ({
      get: () => resource,
      ref: () => ({ id: resource.id, type: resource.type }),
    }),
    generateId: (type: string) => `https://example.org/${type}/${++id}`,
  };
  ctx.create = async (definition: string, payload: any) => {
    if (definition === imageUrlCreator.id)
      return imageUrlCreator.create(payload, ctx);
    if (definition === imageSlideCreator.id)
      return imageSlideCreator.create(payload, ctx);
    throw new Error(`Unexpected creator: ${definition}`);
  };

  const slide = await imageUrlSlideCreator.create(
    { url: "https://example.org/image.jpg", width: 1200, height: 800 },
    ctx,
  );
  const canvas = unwrap(slide);

  expect(imageUrlSlideCreator.label).toBe("Image from URL");
  expect(imageUrlSlideCreator.tags).toContain("exhibition-slideshow-slide");
  expect(canvas).toMatchObject({
    width: 1200,
    height: 800,
    behavior: ["w-12", "h-8"],
    items: [
      {
        items: [
          {
            motivation: "painting",
            target: {
              type: "SpecificResource",
              source: { id: canvas.id, type: "Canvas" },
            },
          },
        ],
      },
    ],
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
