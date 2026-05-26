import { Vault } from "@iiif/helpers/vault";
import { FLAG_TAG, setResourceTags, type ManifestEditorTag } from "@manifest-editor/shell";
import { describe, expect, test } from "vitest";
import { manifestHasCanvasTags } from "./tags";

const manifestRef = { id: "https://example.org/manifest", type: "Manifest" };
const collectionRef = { id: "https://example.org/collection", type: "Collection" };
const canvasRef = { id: "https://example.org/canvas/1", type: "Canvas" };
const canvasRef2 = { id: "https://example.org/canvas/2", type: "Canvas" };

const reviewTag: ManifestEditorTag = {
  type: "review",
  id: "review",
  label: "Review",
  backgroundColor: "#111827",
  textColor: "#ffffff",
};

function createVault(canvases: Array<{ id: string; type: "Canvas" }> = [canvasRef, canvasRef2]) {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    ...manifestRef,
    label: { en: ["Test manifest"] },
    items: canvases.map((canvas, index) => ({
      ...canvas,
      label: { en: [`Canvas ${index + 1}`] },
      height: 100,
      width: 100,
      items: [],
    })),
  });
  return vault;
}

describe("tags panel support", () => {
  test("hides without a vault or manifest root resource", () => {
    const vault = createVault();

    expect(manifestHasCanvasTags(undefined, manifestRef)).toBe(false);
    expect(manifestHasCanvasTags(vault, undefined)).toBe(false);
    expect(manifestHasCanvasTags(vault, collectionRef)).toBe(false);
  });

  test("hides when the manifest has no canvases", () => {
    const vault = createVault([]);

    expect(manifestHasCanvasTags(vault, manifestRef)).toBe(false);
  });

  test("hides when canvases have no tags", () => {
    const vault = createVault();

    expect(manifestHasCanvasTags(vault, manifestRef)).toBe(false);
  });

  test("shows when at least one canvas has a tag", () => {
    const vault = createVault();

    setResourceTags(vault, canvasRef, [FLAG_TAG]);

    expect(manifestHasCanvasTags(vault, manifestRef)).toBe(true);
  });

  test("hides again after the last canvas tag is removed", () => {
    const vault = createVault();

    setResourceTags(vault, canvasRef, [reviewTag]);
    setResourceTags(vault, canvasRef2, [FLAG_TAG]);

    expect(manifestHasCanvasTags(vault, manifestRef)).toBe(true);

    setResourceTags(vault, canvasRef, []);
    setResourceTags(vault, canvasRef2, []);

    expect(manifestHasCanvasTags(vault, manifestRef)).toBe(false);
  });
});
