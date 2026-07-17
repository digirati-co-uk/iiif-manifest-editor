import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import { CreatorResource } from "../../../../packages/creator-api/src/CreatorResource";

describe("CreatorResource", () => {
  test("preserves a SpecificResource when its source already exists", () => {
    const vault = new Vault();
    const source = {
      id: "https://example.org/image.jpg",
      type: "Image",
      width: 1200,
      height: 800,
    };
    vault.loadSync("https://example.org/existing-annotation", {
      id: "https://example.org/existing-annotation",
      type: "Annotation",
      motivation: "painting",
      target: "https://example.org/existing-canvas",
      body: source,
    });

    const annotation = new CreatorResource(
      {
        id: "https://example.org/annotation",
        type: "Annotation",
        motivation: "painting",
        target: "https://example.org/canvas",
        body: {
          id: "https://example.org/specific-resource",
          type: "SpecificResource",
          source,
          selector: {
            type: "ImageApiSelector",
            rotation: "90",
          },
        },
      },
      vault,
    );

    expect(annotation.getVaultResource().body[0]).toEqual({
      id: "https://example.org/specific-resource",
      type: "SpecificResource",
      source: {
        id: source.id,
        type: "ContentResource",
      },
      selector: {
        type: "ImageApiSelector",
        rotation: "90",
      },
    });
  });
});
