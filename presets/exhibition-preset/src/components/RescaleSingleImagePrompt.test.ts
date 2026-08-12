import { describe, expect, test } from "vitest";
import { getSingleImageAnnotationToRescale } from "./single-image-rescale";

const annotation = {
  id: "annotation",
  type: "Annotation",
  motivation: "painting",
  target: {
    type: "SpecificResource",
    source: { id: "canvas", type: "Canvas" },
    selector: { type: "FragmentSelector", value: "xywh=10,20,30,40" },
  },
  body: {
    type: "SpecificResource",
    source: { id: "image", type: "Image" },
    selector: { type: "ImageApiSelector", region: "1,2,300,400" },
  },
};

function vaultWith(items = [annotation]) {
  return {
    get: (resource: any) =>
      resource.id === "page"
        ? { id: "page", type: "AnnotationPage", items }
        : resource,
  };
}

const canvas = {
  id: "canvas",
  type: "Canvas",
  behavior: ["multi-image"],
  items: [{ id: "page", type: "AnnotationPage" }],
};

describe("single-image rescale prompt", () => {
  test("finds the legacy empty-slide image", () => {
    expect(getSingleImageAnnotationToRescale(vaultWith(), canvas)).toBe(
      annotation,
    );
  });

  test("does not prompt for direct or genuinely multi-image slides", () => {
    expect(
      getSingleImageAnnotationToRescale(vaultWith(), {
        ...canvas,
        behavior: [],
      }),
    ).toBeNull();
    expect(
      getSingleImageAnnotationToRescale(
        vaultWith([annotation, { ...annotation, id: "second" }]),
        canvas,
      ),
    ).toBeNull();
    expect(
      getSingleImageAnnotationToRescale(
        vaultWith([{ ...annotation, target: "canvas" as any }]),
        canvas,
      ),
    ).toBeNull();
  });
});
