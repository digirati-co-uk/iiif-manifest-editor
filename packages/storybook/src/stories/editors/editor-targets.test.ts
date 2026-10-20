import { Vault } from "@iiif/helpers";
import type { Manifest } from "@iiif/presentation-3";
import { afterEach, expect, test, vi } from "vitest";
import type { LoadedResource } from "../../support/load-resource";
import { selectEditorTarget } from "./editor-targets";

afterEach(() => vi.unstubAllGlobals());

async function fixture(): Promise<LoadedResource> {
  const data: Manifest = {
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Target selection"] },
    items: [
      {
        id: "https://example.org/canvas",
        type: "Canvas",
        height: 100,
        width: 100,
        items: [
          {
            id: "https://example.org/painting-page",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/painting",
                type: "Annotation",
                motivation: "painting",
                target: "https://example.org/canvas",
                body: { id: "https://example.org/image.jpg", type: "Image", format: "image/jpeg" },
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://example.org/comment-page",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/comment",
                type: "Annotation",
                motivation: "commenting",
                target: "https://example.org/canvas",
                body: { type: "TextualBody", value: "Comment", format: "text/plain" },
              },
            ],
          },
        ],
      },
    ],
  };
  const vault = new Vault();
  await vault.load(data.id, data);
  return { vault, resource: { id: data.id, type: "Manifest" }, data };
}

test("selects supplementary annotations instead of painting content, preserving the parent context", async () => {
  const loaded = await fixture();
  const selected = await selectEditorTarget(loaded, "annotation");
  expect(selected).toEqual({
    reference: { id: "https://example.org/comment", type: "Annotation" },
    context: {
      parent: { id: "https://example.org/comment-page", type: "AnnotationPage" },
      property: "items",
      index: 0,
    },
    canvasId: "https://example.org/canvas",
  });
  const body = await selectEditorTarget(loaded, "paintingBody");
  expect(body.reference).toEqual({ id: "https://example.org/image.jpg", type: "ContentResource" });
  expect(body.context?.parent.id).toBe("https://example.org/painting");
});

test("reports missing nested resources without selecting an unrelated editor target", async () => {
  await expect(selectEditorTarget(await fixture(), "range")).rejects.toThrow("no range resource");
});

test("adds a real partOf reference without importing collection summaries over the source Manifest", async () => {
  const loaded = await fixture();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "https://example.org/collection",
          type: "Collection",
          label: { en: ["Parent collection"] },
          items: [{ ...loaded.resource, label: { en: ["Brief collection reference"] } }],
        })
      )
    )
  );
  const selection = await selectEditorTarget(loaded, "partOf");
  expect(selection.context).toEqual({ parent: loaded.resource, property: "partOf", index: 0 });
  expect(selection.jsonReference).toBe(loaded.resource);
  expect(loaded.vault.toPresentation3(loaded.resource)).toMatchObject({
    label: { en: ["Target selection"] },
    partOf: [{ id: "https://example.org/collection", label: { en: ["Parent collection"] } }],
  });
});
