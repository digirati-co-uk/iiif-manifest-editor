import { imageServiceCreator } from "@manifest-editor/creators";
import { describe, expect, test, vi } from "vitest";
import { imageServiceSlideCreator } from "./image-service-slide-creator";
import { imageSlideCreator } from "./image-slide-creator";

vi.mock("@manifest-editor/creators", () => ({
  imageServiceCreator: {
    id: "@manifest-editor/image-service-creator",
    label: "Image Service",
    resourceType: "ContentResource",
    resourceFields: ["id", "type", "height", "width", "service"],
    supports: { initialData: true, parentFields: ["body"] },
    create: (data: any, ctx: any) =>
      ctx.embed({
        id: `${data.service.id}/full/max/0/default.jpg`,
        type: "Image",
        format: "image/jpeg",
        width: data.service.width,
        height: data.service.height,
        service: [data.service],
      }),
  },
}));

const service = {
  id: "https://images.example.org/iiif/3/example",
  type: "ImageService3",
  profile: "level1",
  width: 1200,
  height: 800,
};

async function createSlide(
  payload: Record<string, unknown> = {},
  initialData: Record<string, unknown> = {},
) {
  let id = 0;
  const ctx: any = {
    config: {},
    options: { initialData },
    embed: vi.fn((resource) => ({
      get: () => resource,
      ref: () => ({ id: resource.id, type: resource.type }),
    })),
    generateId: vi.fn((type) => `https://example.org/${type}/${++id}`),
  };
  ctx.create = vi.fn(async (definition, creatorPayload) => {
    if (definition === imageServiceCreator.id) {
      return imageServiceCreator.create(creatorPayload, ctx);
    }
    if (definition === imageSlideCreator.id) {
      return imageSlideCreator.create(creatorPayload, ctx);
    }
    throw new Error(`Unexpected creator: ${definition}`);
  });

  const slide = await imageServiceSlideCreator.create({ url: service.id, service, ...payload }, ctx);
  return unwrap(slide);
}

function unwrap(value: any): any {
  if (value?.get instanceof Function) return unwrap(value.get());
  if (Array.isArray(value)) return value.map(unwrap);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, unwrap(nested)]));
}

describe("imageServiceSlideCreator", () => {
  test("creates a complete exhibition Canvas from an Image Service", async () => {
    const canvas = await createSlide({}, { imageSlideBehavior: ["splash"] });

    expect(canvas).toMatchObject({
      type: "Canvas",
      width: 1200,
      height: 800,
      behavior: ["splash"],
    });
    expect(canvas.items[0].items[0]).toMatchObject({
      type: "Annotation",
      motivation: "painting",
      body: [
        {
          type: "Image",
          width: 1200,
          height: 800,
          service: [service],
        },
      ],
    });
    expect(canvas.annotations).toHaveLength(1);
  });

  test("payload layout overrides the preset initial data", async () => {
    const canvas = await createSlide(
      {
        imageSlideBehavior: ["w-12", "h-8", "image"],
        slideType: "right",
      },
      { imageSlideBehavior: ["splash"] },
    );

    expect(canvas.behavior).toEqual(["w-12", "h-8", "image", "right"]);
  });
});
