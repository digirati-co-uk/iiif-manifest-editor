import { afterEach, expect, test, vi } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { Creator } from "@manifest-editor/creator-api";
import { iiifBrowserCreator } from "./index";

const remote = {
  id: "https://example.org/manifest",
  type: "Manifest",
  items: [
    {
      id: "https://example.org/canvas",
      type: "Canvas",
      width: 600,
      height: 400,
      items: [
        {
          id: "https://example.org/page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/annotation",
              type: "Annotation",
              motivation: "painting",
              target: "https://example.org/canvas",
              body: {
                id: "https://example.org/image.jpg",
                type: "Image",
                width: 600,
                height: 400,
                service: [{ id: "https://example.org/image", type: "ImageService3", profile: "level1" }],
              },
            },
          ],
        },
      ],
    },
  ],
};
afterEach(() => vi.unstubAllGlobals());

test.each([
  ["Canvas", false],
  ["Canvas", true],
  ["Annotation", false],
  ["Annotation", true],
  ["ContentResource", false],
  ["ContentResource", true],
] as const)("browser %s insertion (cropped: %s) undoes and redoes the complete graph", async (targetType, cropped) => {
  const fetcher = vi.fn(
    async () => new Response(JSON.stringify(remote), { headers: { "Content-Type": "application/json" } })
  );
  vi.stubGlobal("fetch", fetcher);
  const vault = new Vault({ history: true });
  vault.loadSync("m", {
    id: "m",
    type: "Manifest",
    items: [
      {
        id: "c",
        type: "Canvas",
        width: 100,
        height: 100,
        items: [{ id: "p", type: "AnnotationPage", items: [{ id: "a", type: "Annotation", target: "c", body: [] }] }],
      },
    ],
  });
  const definition = iiifBrowserCreator;
  const parent =
    targetType === "Canvas"
      ? { id: "m", type: "Manifest" }
      : targetType === "Annotation"
        ? { id: "p", type: "AnnotationPage" }
        : { id: "a", type: "Annotation" };
  const property = targetType === "ContentResource" ? "body" : "items";
  const before = vault.getState().iiif.entities;
  const result = await new Creator(vault, [definition]).create(
    definition.id,
    {
      output: [
        {
          resource: remote.items[0],
          parent: remote,
          ...(cropped
            ? { selector: { type: "BoxSelector", spatial: { x: 10, y: 20, width: 300, height: 200 } }, rotation: 90 }
            : {}),
        },
      ],
    },
    {
      targetType,
      parent: { resource: parent as any, property },
      target: { id: "c", type: "Canvas" },
    }
  );
  const reference = Array.isArray(result) ? result[0] : result;
  expect(reference.type).toBe(cropped && targetType === "ContentResource" ? "SpecificResource" : targetType);
  const after = vault.getState().iiif.entities;
  expect(vault.history!.getState().undo).toHaveLength(1);
  const undone = vault.undo();
  expect(undone, JSON.stringify(undone)).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(before);
  expect(vault.redo().ok).toBe(true);
  expect(vault.getState().iiif.entities).toEqual(after);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test("browser insertion into an empty canvas includes its painting page and placement in history", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(remote)))
  );
  const vault = new Vault({ history: { metadata: ["canvas-layout"] } });
  vault.loadSync("c", { id: "c", type: "Canvas", width: 100, height: 100, items: [] });
  const before = vault.getState().iiif.entities;
  const definition = iiifBrowserCreator;
  await new Creator(vault, [definition]).create(
    definition.id,
    { output: [{ resource: remote.items[0], parent: remote }] },
    {
      targetType: "Annotation",
      parent: { resource: { id: "p", type: "AnnotationPage" }, property: "items" },
      target: { id: "c", type: "Canvas" },
      ensurePaintingPage: { canvasId: "c", pageId: "p" },
      placeholderPosition: { canvasId: "c", bounds: { x: 10, y: 10, width: 80, height: 80 } },
    }
  );
  const page = vault.get({ id: "p", type: "AnnotationPage" });
  const annotation = vault.get(page.items[0]);
  expect(annotation.target).toMatchObject({ selector: { type: "FragmentSelector" } });
  const after = vault.getState().iiif.entities;
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo()).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(before);
  expect(vault.redo()).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(after);
});
