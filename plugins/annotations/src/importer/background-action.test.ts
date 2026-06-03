import { Vault } from "@iiif/helpers/vault";
import {
  FLAG_TAG,
  createBackgroundActionsStore,
  createManifestEditorCanvasProgressApi,
  createManifestEditorTagsApi,
  getBackgroundActionInstanceKey,
  runBackgroundAction,
  type BackgroundActionContext,
  type BackgroundActionTarget,
} from "@manifest-editor/shell";
import { describe, expect, test, vi } from "vitest";
import { createBulkAnnotationImportBackgroundAction } from "./background-action";
import type { ExternalAnnotationPageInlineResult } from "./importer";

const manifestTarget: BackgroundActionTarget = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: "Manifest",
  scope: "root",
};

function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestTarget.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestTarget.id,
    type: "Manifest",
    label: { en: ["Fixture"] },
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Canvas 1"] },
        width: 100,
        height: 100,
        items: [],
        annotations: [
          {
            id: "https://external.example/page/1",
            type: "AnnotationPage",
          },
        ],
      },
      {
        id: "https://example.org/canvas/2",
        type: "Canvas",
        label: { en: ["Canvas 2"] },
        width: 100,
        height: 100,
        items: [],
        annotations: [
          {
            id: "https://external.example/page/missing",
            type: "AnnotationPage",
          },
        ],
      },
      {
        id: "https://example.org/canvas/3",
        type: "Canvas",
        label: { en: ["Canvas 3"] },
        width: 100,
        height: 100,
        items: [],
        annotations: [
          {
            id: "https://example.org/canvas/3/inline-annotations",
            type: "AnnotationPage",
            items: [],
          },
        ],
      },
    ],
  });
  return vault;
}

function createContext(
  vault: Vault,
  definition: ReturnType<typeof createBulkAnnotationImportBackgroundAction>,
): BackgroundActionContext {
  return {
    rootResource: manifestTarget,
    currentCanvas: undefined,
    vault,
    tags: createManifestEditorTagsApi(vault),
    canvasProgress: createManifestEditorCanvasProgressApi(vault),
    plugins: {
      getSettings: <T extends Record<string, unknown>>() => ({}) as T,
    },
    config: {} as any,
    layoutState: {} as any,
    layoutActions: {} as any,
    definition,
    target: manifestTarget,
    instanceKey: getBackgroundActionInstanceKey(definition.id, manifestTarget),
  };
}

describe("bulk annotation import background action", () => {
  test("loads existing external annotation pages and writes them inline", async () => {
    const vault = createVault();
    const definition = createBulkAnnotationImportBackgroundAction({
      requestConfig: async (_ctx, _references, defaults) => defaults,
      fetchPage: async (pageId) => {
        if (pageId === "https://external.example/page/missing") {
          throw new Error("Not found");
        }

        return {
          id: pageId,
          type: "AnnotationPage",
          items: [
            {
              id: "https://external.example/annotation/1",
              type: "Annotation",
              body: "Matched",
              target: "https://old.example/canvas#xywh=1,2,3,4",
            },
          ],
        };
      },
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    const canvas = vault.get({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    }) as any;
    const page = vault.get(canvas.annotations[0]) as any;
    const annotation = vault.get(page.items[0]) as any;
    const instance =
      store.getState().instances[
        getBackgroundActionInstanceKey(definition.id, manifestTarget)
      ];
    const result = instance?.result as ExternalAnnotationPageInlineResult;

    expect(result.totalExternalPages).toBe(2);
    expect(result.pagesInlined).toBe(1);
    expect(result.skippedPages).toEqual([
      expect.objectContaining({
        pageId: "https://external.example/page/missing",
        reason: "Not found",
      }),
    ]);
    expect(page["iiif-parser:isExternal"]).toBe(false);
    expect(annotation.target).toBe("https://example.org/canvas/1#xywh=1,2,3,4");
  });

  test("filters external pages by canvas tag and annotations by motivation", async () => {
    const vault = createVault();
    const fetchPage = vi.fn(async (pageId) => ({
      id: pageId,
      type: "AnnotationPage",
      items: [
        {
          id: "https://external.example/annotation/comment",
          type: "Annotation",
          motivation: "commenting",
          body: "Comment",
          target: "https://old.example/canvas#xywh=1,2,3,4",
        },
        {
          id: "https://external.example/annotation/tag",
          type: "Annotation",
          motivation: "tagging",
          body: "Tag",
          target: "https://old.example/canvas#xywh=5,6,7,8",
        },
      ],
    }));
    const definition = createBulkAnnotationImportBackgroundAction({
      requestConfig: async () => ({
        scope: "tag",
        tagKey: `${FLAG_TAG.type}:${FLAG_TAG.id}`,
        motivationMode: "selected",
        motivations: ["commenting"],
      }),
      fetchPage,
    });
    const store = createBackgroundActionsStore([definition]);
    const context = createContext(vault, definition);
    context.tags.addTag(
      { id: "https://example.org/canvas/1", type: "Canvas" },
      FLAG_TAG,
    );

    await runBackgroundAction({ store, context });

    const canvas1 = vault.get({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    }) as any;
    const canvas2 = vault.get({
      id: "https://example.org/canvas/2",
      type: "Canvas",
    }) as any;
    const page1 = vault.get(canvas1.annotations[0]) as any;
    const page2 = vault.get(canvas2.annotations[0]) as any;
    const instance =
      store.getState().instances[
        getBackgroundActionInstanceKey(definition.id, manifestTarget)
      ];
    const result = instance?.result as ExternalAnnotationPageInlineResult;

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(
      "https://external.example/page/1",
      expect.any(Object),
      expect.any(Object),
    );
    expect(result.totalExternalPages).toBe(1);
    expect(result.annotationsWritten).toBe(1);
    expect(page1.items).toHaveLength(1);
    expect(page1.items[0].id).toBe(
      "https://external.example/annotation/comment",
    );
    expect(page2["iiif-parser:isExternal"]).toBe(true);
  });
});
