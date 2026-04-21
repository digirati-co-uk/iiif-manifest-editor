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
  createTranslationBackgroundAction,
  type TranslationActionDependencies,
} from "./background-action";
import type { TranslationActionResult, TranslationRunOptions } from "./types";

const manifestTarget: BackgroundActionTarget = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: "Manifest",
  scope: "root",
};

const options: TranslationRunOptions = {
  sourceLanguage: "en",
  targetLanguage: "cy",
  runtime: "wasm",
  writePolicy: "fill-missing",
  contentFilters: {
    annotationBodies: true,
    canvasLabels: true,
  },
};

function createVault(overrides: Record<string, unknown> = {}) {
  const vault = new Vault();
  vault.loadManifestSync(manifestTarget.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestTarget.id,
    type: "Manifest",
    label: { en: ["Shared text"] },
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Shared text"] },
        width: 1000,
        height: 1000,
        items: [],
      },
    ],
    ...overrides,
  });
  return vault;
}

function createContext(
  vault: Vault,
  definition: ReturnType<typeof createTranslationBackgroundAction>,
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
    config: {
      i18n: {
        defaultLanguage: "en",
        availableLanguages: ["en", "cy"],
        advancedLanguageMode: false,
      },
    } as any,
    layoutState: {} as any,
    layoutActions: {} as any,
    definition,
    target: manifestTarget,
    instanceKey: getBackgroundActionInstanceKey(definition.id, manifestTarget),
  };
}

function createClient(
  dependencies: {
    translate?: TranslationActionDependencies["createClient"];
  } = {},
) {
  return {
    preload: vi.fn(async () => undefined),
    translate: vi.fn(async (request) => ({
      text: `${request.text} [${request.targetLanguage}]`,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      runtime: "wasm" as const,
      durationMs: 1,
    })),
    onEvent: vi.fn(() => () => undefined),
    terminate: vi.fn(),
    ...dependencies,
  };
}

describe("translation background action", () => {
  test("deduplicates source strings, translates once, and writes all missing occurrences", async () => {
    const vault = createVault();
    const client = createClient();
    const definition = createTranslationBackgroundAction({
      createClient: () => client,
      requestConfig: vi.fn(async () => options),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    expect(client.translate).toHaveBeenCalledTimes(1);
    expect((vault.get(manifestTarget as any) as any).label.cy).toEqual([
      "Shared text [cy]",
    ]);
    expect(
      (
        vault.get({
          id: "https://example.org/canvas/1",
          type: "Canvas",
        } as any) as any
      ).label.cy,
    ).toEqual(["Shared text [cy]"]);

    const result = store.getState().instances[
      getBackgroundActionInstanceKey(definition.id, manifestTarget)
    ]?.result as TranslationActionResult;
    expect(result.translated).toBe(1);
    expect(result.applied).toBe(2);
  });

  test("never overwrites existing target-language values", async () => {
    const vault = createVault({
      label: { en: ["Shared text"], cy: ["Existing manifest value"] },
    });
    const client = createClient();
    const definition = createTranslationBackgroundAction({
      createClient: () => client,
      requestConfig: vi.fn(async () => options),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    expect((vault.get(manifestTarget as any) as any).label.cy).toEqual([
      "Existing manifest value",
    ]);
    expect(
      (
        vault.get({
          id: "https://example.org/canvas/1",
          type: "Canvas",
        } as any) as any
      ).label.cy,
    ).toEqual(["Shared text [cy]"]);
  });

  test("skips stale occurrences when the source changes before write-back", async () => {
    const vault = createVault();
    const client = createClient();
    client.translate.mockImplementationOnce(async (request) => {
      vault.modifyEntityField(manifestTarget as any, "label", {
        en: ["Changed source"],
      });
      return {
        text: `${request.text} [${request.targetLanguage}]`,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        runtime: "wasm" as const,
        durationMs: 1,
      };
    });
    const definition = createTranslationBackgroundAction({
      createClient: () => client,
      requestConfig: vi.fn(async () => options),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    expect((vault.get(manifestTarget as any) as any).label.cy).toBeUndefined();
    expect(
      (
        vault.get({
          id: "https://example.org/canvas/1",
          type: "Canvas",
        } as any) as any
      ).label.cy,
    ).toEqual(["Shared text [cy]"]);

    const result = store.getState().instances[
      getBackgroundActionInstanceKey(definition.id, manifestTarget)
    ]?.result as TranslationActionResult;
    expect(result.stale).toBe(1);
    expect(result.applied).toBe(1);
  });

  test("terminates the worker client on cancellation", async () => {
    const vault = createVault();
    const client = createClient();
    let translateStarted = false;
    client.translate.mockImplementation(
      () =>
        new Promise((resolve) => {
          translateStarted = true;
          setTimeout(
            () =>
              resolve({
                text: "Shared text [cy]",
                sourceLanguage: "en",
                targetLanguage: "cy",
                runtime: "wasm",
                durationMs: 1,
              }),
            20,
          );
        }) as any,
    );
    const definition = createTranslationBackgroundAction({
      createClient: () => client,
      requestConfig: vi.fn(async () => options),
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(
      definition.id,
      manifestTarget,
    );

    const promise = runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });
    await waitUntil(() => translateStarted);
    store.getState().cancelAction(instanceKey);
    await promise;

    expect(client.terminate).toHaveBeenCalled();
    expect(store.getState().instances[instanceKey]?.status).toBe("cancelled");
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
