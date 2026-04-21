import { Vault } from "@iiif/helpers/vault";
import {
  type BackgroundActionContext,
  type BackgroundActionTarget,
  createBackgroundActionsStore,
  createManifestEditorCanvasProgressApi,
  createManifestEditorTagsApi,
  getBackgroundActionInstanceKey,
  getResourceTags,
  runBackgroundAction,
} from "@manifest-editor/shell";
import { describe, expect, test } from "vitest";
import {
  createLanguageTag,
  createTranslationLanguageTagsBackgroundAction,
  TRANSLATION_LANGUAGE_TAG_TYPE,
  type TranslationLanguageTagActionResult,
} from "./language-tags-background-action";

const manifestTarget: BackgroundActionTarget = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: "Manifest",
  scope: "root",
};

const canvas1 = { id: "https://example.org/canvas/1", type: "Canvas" };
const canvas2 = { id: "https://example.org/canvas/2", type: "Canvas" };
const canvas3 = { id: "https://example.org/canvas/3", type: "Canvas" };

function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestTarget.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestTarget.id,
    type: "Manifest",
    label: { en: ["Language tag fixture"] },
    items: [
      {
        ...canvas1,
        label: { en: ["English canvas"] },
        width: 1000,
        height: 1000,
        items: [],
      },
      {
        ...canvas2,
        label: {
          en: ["Welsh canvas translation"],
          cy: ["Cynfas Gymraeg"],
        },
        summary: { cy: ["Disgrifiad Cymraeg"] },
        metadata: [
          {
            label: { cy: ["Iaith"] },
            value: { cy: ["Cymraeg"] },
          },
        ],
        width: 1000,
        height: 1000,
        items: [],
      },
      {
        ...canvas3,
        label: "Canvas without a language map",
        width: 1000,
        height: 1000,
        items: [],
      },
    ],
  });
  return vault;
}

function createContext(
  vault: Vault,
  definition: ReturnType<typeof createTranslationLanguageTagsBackgroundAction>,
): BackgroundActionContext {
  return {
    rootResource: manifestTarget,
    currentCanvas: undefined,
    vault,
    tags: createManifestEditorTagsApi(vault),
    canvasProgress: createManifestEditorCanvasProgressApi(vault),
    plugins: { getSettings: <T extends Record<string, unknown>>() => ({}) as T },
    config: {} as any,
    layoutState: {} as any,
    layoutActions: {} as any,
    definition,
    target: manifestTarget,
    instanceKey: getBackgroundActionInstanceKey(definition.id, manifestTarget),
  };
}

describe("translation language tag background action", () => {
  test("tags each canvas with its primary detected language and clears stale language tags", async () => {
    const vault = createVault();
    const tags = createManifestEditorTagsApi(vault);
    tags.addTag(canvas2, createLanguageTag("en"));
    tags.addTag(canvas3, createLanguageTag("en"));

    const definition = createTranslationLanguageTagsBackgroundAction();
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    expect(getResourceTags(vault, canvas1)).toEqual([
      expect.objectContaining({
        type: TRANSLATION_LANGUAGE_TAG_TYPE,
        id: "en",
        label: "English",
      }),
    ]);
    expect(getResourceTags(vault, canvas2)).toEqual([
      expect.objectContaining({
        type: TRANSLATION_LANGUAGE_TAG_TYPE,
        id: "cy",
        label: "Welsh",
      }),
    ]);
    expect(getResourceTags(vault, canvas3)).toEqual([]);

    const instance = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)];
    const result = instance?.result as TranslationLanguageTagActionResult;

    expect(instance?.status).toBe("complete");
    expect(instance?.resultsAvailable).toBe(false);
    expect(result.tagged).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.counts).toMatchObject({ en: 1, cy: 1 });
    expect(result.skippedCanvases).toEqual([
      {
        canvasId: canvas3.id,
        canvasLabel: "Canvas without a language map",
        reason: "No supported language detected",
      },
    ]);
  });
});
