import { Vault } from "@iiif/helpers/vault";
import {
  createBackgroundActionsStore,
  createManifestEditorCanvasProgressApi,
  createManifestEditorTagsApi,
  getBackgroundActionInstanceKey,
  runBackgroundAction,
  type BackgroundActionContext,
  type BackgroundActionTarget,
} from "@manifest-editor/shell";
import { describe, expect, test, vi } from "vitest";
import {
  createCanvasLabelGeneratorBackgroundAction,
  type CanvasLabelGeneratorActionResult,
} from "./background-action";
import { getDefaultRunOptions } from "./generator";

const manifestTarget: BackgroundActionTarget = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: "Manifest",
  scope: "root",
};

function createVault(canvases = [createCanvas("https://example.org/canvas/1")], structures: any[] = []) {
  const vault = new Vault();
  vault.loadManifestSync(manifestTarget.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestTarget.id,
    type: "Manifest",
    label: { en: ["Canvas label fixture"] },
    items: canvases,
    structures,
  });
  return vault;
}

function createCanvas(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    type: "Canvas",
    label: { en: ["Old label"] },
    width: 1000,
    height: 1000,
    items: [
      {
        id: `${id}/page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${id}/painting`,
            type: "Annotation",
            motivation: "painting",
            body: {
              id: `${id}/image/full/1000,/0/default.jpg`,
              type: "Image",
              format: "image/jpeg",
              width: 1000,
              height: 1000,
            },
            target: id,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function createContext(
  vault: Vault,
  definition: ReturnType<typeof createCanvasLabelGeneratorBackgroundAction>,
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

describe("canvas label generator background action", () => {
  test("registers a config renderer and results handler", () => {
    const vault = createVault();
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async () => getDefaultRunOptions()),
    });

    expect(definition.render).toBeTypeOf("function");
    expect(definition.onResults).toBeTypeOf("function");
    expect(() => definition.onResults?.(createContext(vault, definition))).not.toThrow();
  });

  test("applies default page labels to all canvases", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1"),
      createCanvas("https://example.org/canvas/2"),
    ]);
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async () => getDefaultRunOptions()),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect((vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }) as any).label).toMatchObject({
      en: ["Page 1"],
    });
    expect((vault.get({ id: "https://example.org/canvas/2", type: "Canvas" }) as any).label).toMatchObject({
      en: ["Page 2"],
    });

    const result = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)]
      ?.result as CanvasLabelGeneratorActionResult;
    expect(result.applied).toBe(2);
    expect(result.previewedChanges).toBe(2);
  });

  test("preserves other language entries when writing the configured language", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", {
        label: { en: ["Old label"], fr: ["Ancienne etiquette"] },
      }),
    ]);
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async () => ({ ...getDefaultRunOptions(), language: "en", pattern: "Plate {n}" })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect((vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }) as any).label).toEqual({
      en: ["Plate 1"],
      fr: ["Ancienne etiquette"],
    });
  });

  test("only updates untitled canvases when protected mode is enabled", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", { label: { en: ["Untitled canvas"] } }),
      createCanvas("https://example.org/canvas/2", { label: { en: ["Existing label"] } }),
    ]);
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async () => ({ ...getDefaultRunOptions(), onlyUntitled: true })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect((vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }) as any).label.en).toEqual(["Page 1"]);
    expect((vault.get({ id: "https://example.org/canvas/2", type: "Canvas" }) as any).label.en).toEqual([
      "Existing label",
    ]);

    const result = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)]
      ?.result as CanvasLabelGeneratorActionResult;
    expect(result.applied).toBe(1);
    expect(result.skippedCanvases[0]?.reason).toBe("Canvas is not untitled");
  });

  test("uses range prefixes and restarts numbering per range", async () => {
    const vault = createVault(
      [
        createCanvas("https://example.org/canvas/1"),
        createCanvas("https://example.org/canvas/2"),
      ],
      [
        {
          id: "https://example.org/range/chapter-1",
          type: "Range",
          label: { en: ["Chapter 1"] },
          items: [
            { id: "https://example.org/canvas/1", type: "Canvas" },
            { id: "https://example.org/canvas/2", type: "Canvas" },
          ],
        },
      ],
    );
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async () => ({
        ...getDefaultRunOptions(),
        pattern: "{range}: Page {n}",
        restartPerRange: true,
      })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect((vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }) as any).label.en).toEqual([
      "Chapter 1: Page 1",
    ]);
    expect((vault.get({ id: "https://example.org/canvas/2", type: "Canvas" }) as any).label.en).toEqual([
      "Chapter 1: Page 2",
    ]);
  });

  test("falls back to canvas id for filename labels when painting content is missing", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/missing-image", {
        items: [],
      }),
    ]);
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async () => ({ ...getDefaultRunOptions(), pattern: "{filename}" })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect((vault.get({ id: "https://example.org/canvas/missing-image", type: "Canvas" }) as any).label.en).toEqual([
      "missing image",
    ]);

    const result = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)]
      ?.result as CanvasLabelGeneratorActionResult;
    expect(result.warningCanvases[0]?.warnings).toContain("No painting body source found; using canvas id");
  });

  test("skips stale preview rows when a canvas label changes before apply", async () => {
    const vault = createVault([createCanvas("https://example.org/canvas/1")]);
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(async (ctx, _inputs, defaults) => {
        ctx.vault.modifyEntityField({ id: "https://example.org/canvas/1", type: "Canvas" } as any, "label", {
          en: ["Changed externally"],
        });
        return defaults;
      }),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({ store, context: createContext(vault, definition) });

    expect((vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }) as any).label.en).toEqual([
      "Changed externally",
    ]);

    const result = store.getState().instances[getBackgroundActionInstanceKey(definition.id, manifestTarget)]
      ?.result as CanvasLabelGeneratorActionResult;
    expect(result.applied).toBe(0);
    expect(result.stale).toBe(1);
    expect(result.skippedCanvases[0]?.reason).toBe("Canvas label changed after preview");
  });

  test("cancels safely while waiting for configuration", async () => {
    const vault = createVault([createCanvas("https://example.org/canvas/1")]);
    let requestStarted = false;
    const definition = createCanvasLabelGeneratorBackgroundAction({
      requestConfig: vi.fn(
        async (ctx) =>
          new Promise<ReturnType<typeof getDefaultRunOptions> | false>((resolve) => {
            requestStarted = true;
            ctx.signal.addEventListener("abort", () => resolve(false), { once: true });
          }),
      ),
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(definition.id, manifestTarget);

    const promise = runBackgroundAction({ store, context: createContext(vault, definition) });
    await waitUntil(() => requestStarted);
    store.getState().cancelAction(instanceKey);
    await promise;

    expect(store.getState().instances[instanceKey]?.status).toBe("cancelled");
    expect((vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }) as any).label.en).toEqual(["Old label"]);
  });
});

async function waitUntil(predicate: () => boolean) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  throw new Error("Timed out waiting for predicate");
}
