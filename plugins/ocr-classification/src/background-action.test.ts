import { Vault } from "@iiif/helpers/vault";
import {
  createBackgroundActionsStore,
  createManifestEditorTagsApi,
  getBackgroundActionInstanceKey,
  getResourceTags,
  runBackgroundAction,
  type BackgroundActionContext,
  type BackgroundActionTarget,
  type ManifestEditorTag,
} from "@manifest-editor/shell";
import { describe, expect, test, vi } from "vitest";
import {
  createOcrClassificationBackgroundAction,
  type OcrClassificationActionResult,
} from "./background-action";
import { OCR_DIFFICULTY_TAG_TYPE, selectOcrDifficulty } from "./ocr-difficulty";

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
    label: { en: ["OCR fixture"] },
    items: [
      createCanvas("https://example.org/canvas/1"),
      createCanvas("https://example.org/canvas/2"),
      createCanvas("https://example.org/canvas/3"),
    ],
  });
  return vault;
}

function createCanvas(id: string) {
  return {
    id,
    type: "Canvas",
    label: { en: [id] },
    width: 100,
    height: 100,
    items: [],
  };
}

function createContext(vault: Vault, definition: ReturnType<typeof createOcrClassificationBackgroundAction>): BackgroundActionContext {
  return {
    rootResource: manifestTarget,
    currentCanvas: undefined,
    vault,
    tags: createManifestEditorTagsApi(vault),
    config: {} as any,
    layoutState: {} as any,
    layoutActions: {} as any,
    definition,
    target: manifestTarget,
    instanceKey: getBackgroundActionInstanceKey(definition.id, manifestTarget),
  };
}

function createRun(scores: number[]) {
  return {
    scores,
    prediction: selectOcrDifficulty(scores),
    inferenceMs: 1,
  };
}

describe("OCR classification background action", () => {
  test("registers a results renderer and results handler", () => {
    const vault = createVault();
    const definition = createOcrClassificationBackgroundAction({
      prepareClassifier: vi.fn(),
      getCanvasImage: vi.fn(),
      classifyImage: vi.fn(),
    });

    expect(definition.render).toBeTypeOf("function");
    expect(definition.onResults).toBeTypeOf("function");
    expect(() => definition.onResults?.(createContext(vault, definition))).not.toThrow();
  });

  test("classifies canvases and upserts OCR difficulty tags", async () => {
    const vault = createVault();
    const previousTag: ManifestEditorTag = {
      type: OCR_DIFFICULTY_TAG_TYPE,
      id: "easy",
      label: "OCR Easy",
      backgroundColor: "#047857",
      textColor: "#ffffff",
    };
    createManifestEditorTagsApi(vault).addTag({ id: "https://example.org/canvas/1", type: "Canvas" }, previousTag);

    const definition = createOcrClassificationBackgroundAction({
      prepareClassifier: vi.fn(),
      getCanvasImage: vi.fn(async (_ctx, canvas) =>
        canvas.id.endsWith("/3")
          ? null
          : {
              url: `${canvas.id}/image.jpg`,
              blob: new Blob(["image"], { type: "image/jpeg" }),
            },
      ),
      classifyImage: vi
        .fn()
        .mockResolvedValueOnce(createRun([0.1, 0.8, 0.3]))
        .mockResolvedValueOnce(createRun([0.1, 0.2, 0.9])),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect(getResourceTags(vault, { id: "https://example.org/canvas/1", type: "Canvas" })).toEqual([
      expect.objectContaining({
        type: OCR_DIFFICULTY_TAG_TYPE,
        id: "medium",
        label: "OCR Medium",
      }),
    ]);
    expect(getResourceTags(vault, { id: "https://example.org/canvas/2", type: "Canvas" })).toEqual([
      expect.objectContaining({
        type: OCR_DIFFICULTY_TAG_TYPE,
        id: "difficult",
        label: "OCR Difficult",
      }),
    ]);
    expect(getResourceTags(vault, { id: "https://example.org/canvas/3", type: "Canvas" })).toEqual([]);

    const instance = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)];
    const result = instance?.result as OcrClassificationActionResult;

    expect(instance?.status).toBe("complete");
    expect(result.classified).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.counts).toMatchObject({
      medium: 1,
      difficult: 1,
    });
    expect(result.skippedCanvases).toEqual([
      {
        canvasId: "https://example.org/canvas/3",
        reason: "No painting image found",
      },
    ]);
  });

  test("records a skipped canvas when classification fails", async () => {
    const vault = createVault();
    const definition = createOcrClassificationBackgroundAction({
      prepareClassifier: vi.fn(),
      getCanvasImage: vi.fn(async (_ctx, canvas) => ({
        url: `${canvas.id}/image.jpg`,
        blob: new Blob(["image"], { type: "image/jpeg" }),
      })),
      classifyImage: vi.fn().mockRejectedValue(new Error("Unable to decode image")),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    const instance = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)];
    const result = instance?.result as OcrClassificationActionResult;

    expect(instance?.status).toBe("complete");
    expect(result.classified).toBe(0);
    expect(result.skipped).toBe(3);
    expect(result.skippedCanvases.map((item) => item.reason)).toEqual([
      "Unable to decode image",
      "Unable to decode image",
      "Unable to decode image",
    ]);
  });
});
