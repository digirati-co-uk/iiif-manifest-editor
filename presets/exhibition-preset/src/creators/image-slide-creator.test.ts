import { describe, expect, test, vi } from "vitest";
import { infoBoxCreator } from "./info-box-creator";
import { imageSlideCreator } from "./image-slide-creator";

function ctx() {
  let id = 0;
  return {
    config: {},
    options: { initialData: { imageSlideBehavior: ["splash"] } },
    embed: vi.fn((resource) => ({
      get: () => resource,
      ref: () => ({ id: resource.id, type: resource.type }),
    })),
    generateId: vi.fn((type) => `https://example.org/${type}/${++id}`),
    create: vi.fn(async () => ({ id: `https://example.org/body/${++id}`, type: "TextualBody" })),
  } as any;
}

describe("scroll template image defaults", () => {
  test("image slide creator consumes the initial splash behaviour", () => {
    const slide = imageSlideCreator.create({ type: "default" }, ctx());

    expect(slide.get().behavior).toEqual(["splash", "multi-image"]);
  });

  test("info box creator ignores the image-only splash default", async () => {
    const slide = await infoBoxCreator.create({}, ctx());

    expect(slide.get().behavior).toEqual(["w-4", "h-4", "info"]);
  });
});
