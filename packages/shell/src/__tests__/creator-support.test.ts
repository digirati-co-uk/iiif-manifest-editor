import { Vault } from "@iiif/helpers/vault";
import { matchBasedOnResource } from "@manifest-editor/creator-api";
import { describe, expect, it } from "vitest";
import { getSupportedCreatorResource } from "../BaseCreator/BaseCreator.hooks";

describe("creator support resource", () => {
  it("passes painting context through to creator matching", () => {
    const paintingCanvasCreator = {
      id: "test/painting-canvas",
      label: "Painting canvas",
      create: () => null,
      resourceType: "Annotation",
      additionalTypes: ["Canvas"],
      resourceFields: [],
      compatibility: {
        viewers: ["theseus", "universal-viewer"],
      },
      supports: {
        onlyPainting: true,
        parentTypes: ["Manifest"],
        parentFields: ["items"],
      },
    } as any;

    const withoutPaintingContext = matchBasedOnResource(
      {
        type: "Canvas",
        parent: { id: "manifest-1", type: "Manifest" },
        property: "items",
        index: 0,
      },
      [paintingCanvasCreator],
      { vault: new Vault() },
    );

    const withPaintingContext = matchBasedOnResource(
      getSupportedCreatorResource(
        { id: "manifest-1", type: "Manifest" },
        "items",
        "Canvas",
        undefined,
        { isPainting: true },
      ),
      [paintingCanvasCreator],
      { vault: new Vault() },
    );

    expect(withoutPaintingContext).toHaveLength(0);
    expect(withPaintingContext.map((creator) => creator.id)).toEqual([
      "test/painting-canvas",
    ]);
  });
});
