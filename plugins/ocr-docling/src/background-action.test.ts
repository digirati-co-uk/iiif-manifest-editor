import { Vault } from "@iiif/helpers/vault";
import {
  createBackgroundActionsStore,
  createManifestEditorCanvasProgressApi,
  createManifestEditorTagsApi,
  FLAG_TAG,
  getBackgroundActionInstanceKey,
  runBackgroundAction,
  type BackgroundActionContext,
  type BackgroundActionPersistedState,
  type BackgroundActionTarget,
  type ManifestEditorTag,
} from "@manifest-editor/shell";
import { describe, expect, test, vi } from "vitest";
import {
  createOcrDoclingBackgroundAction,
  type OcrDoclingActionResult,
} from "./background-action";
import {
  getDefaultRunOptions,
  type OcrDoclingPluginSettings,
} from "./config-modal";
import type { DoclingBatchResult, DoclingWorkerClient } from "./docling";
import { getCanvasTagOptions, getTagKey } from "./tags";

const manifestTarget: BackgroundActionTarget = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: "Manifest",
  scope: "root",
};

const REVIEW_TAG: ManifestEditorTag = {
  type: "workflow",
  id: "review",
  label: "Review",
  backgroundColor: "#111827",
  textColor: "#ffffff",
};

function createVault(
  canvases = [createCanvas("https://example.org/canvas/1")],
) {
  const vault = new Vault();
  vault.loadManifestSync(manifestTarget.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestTarget.id,
    type: "Manifest",
    label: { en: ["OCR fixture"] },
    items: canvases,
  });
  return vault;
}

function createCanvas(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    type: "Canvas",
    label: { en: [id] },
    width: 1000,
    height: 2000,
    items: [],
    annotations: [],
    ...overrides,
  };
}

function createContext(
  vault: Vault,
  definition: ReturnType<typeof createOcrDoclingBackgroundAction>,
  pluginSettings: OcrDoclingPluginSettings = {},
): BackgroundActionContext {
  return {
    rootResource: manifestTarget,
    currentCanvas: undefined,
    vault,
    tags: createManifestEditorTagsApi(vault),
    canvasProgress: createManifestEditorCanvasProgressApi(vault),
    plugins: {
      getSettings: <T extends Record<string, unknown>>() => pluginSettings as T,
    },
    config: {} as any,
    layoutState: {} as any,
    layoutActions: {} as any,
    definition,
    target: manifestTarget,
    instanceKey: getBackgroundActionInstanceKey(definition.id, manifestTarget),
  };
}

function createDoclingBatch(
  canvasId: string,
  rawDocling: string,
): DoclingBatchResult {
  return {
    document: {
      docling: rawDocling,
      html: "",
      pageCount: 1,
      durationMs: 1,
    },
    pages: [
      {
        id: canvasId,
        rawDocling,
        docling: rawDocling,
        html: "",
        canvasId,
        boxes: [],
        annotations: [],
        durationMs: 1,
      },
    ],
    annotationPages: [],
  };
}

function createClient(
  rawDocling: string,
): Pick<DoclingWorkerClient, "preload" | "convert" | "onEvent" | "terminate"> {
  return {
    preload: vi.fn(async () => undefined),
    convert: vi.fn(async (request) =>
      createDoclingBatch(request.pages[0]!.id, rawDocling),
    ),
    onEvent: vi.fn(() => () => undefined),
    terminate: vi.fn(),
  };
}

function createImage() {
  return {
    url: "https://example.org/image/full/1024,/0/default.jpg",
    blob: new Blob(["image"], { type: "image/jpeg" }),
  };
}

describe("Docling OCR background action", () => {
  test("collects all canvas tags including the built-in flag tag", () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1"),
      createCanvas("https://example.org/canvas/2", {
        annotations: [
          {
            id: "https://example.org/canvas/2/annotations",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/canvas/2/comment",
                type: "Annotation",
                motivation: "commenting",
                body: [],
                target: "https://example.org/canvas/2",
              },
            ],
          },
        ],
      }),
    ]);
    const definition = createOcrDoclingBackgroundAction();
    const ctx = {
      ...createContext(vault, definition),
      signal: new AbortController().signal,
      setActionLabel: vi.fn(),
      setActionStatus: vi.fn(),
      setActionError: vi.fn(),
      appendActionLog: vi.fn(),
      setActionProgress: vi.fn(),
      setResult: vi.fn(),
      setResultsAvailable: vi.fn(),
      plan: undefined,
      tasks: {} as any,
    };
    ctx.tags.addTag(
      { id: "https://example.org/canvas/1", type: "Canvas" },
      REVIEW_TAG,
    );
    ctx.tags.addTag(
      { id: "https://example.org/canvas/2", type: "Canvas" },
      FLAG_TAG,
    );

    const options = getCanvasTagOptions(ctx, [
      vault.get({ id: "https://example.org/canvas/1", type: "Canvas" }),
      vault.get({ id: "https://example.org/canvas/2", type: "Canvas" }),
    ]);

    expect(options.map((option) => option.key)).toEqual([
      getTagKey(FLAG_TAG),
      getTagKey(REVIEW_TAG),
    ]);
    expect(
      options.find((option) => option.key === getTagKey(FLAG_TAG))?.canvasCount,
    ).toBe(1);
    expect(
      options.find((option) => option.key === getTagKey(FLAG_TAG))
        ?.annotatedCanvasCount,
    ).toBe(1);
  });

  test("creates a default annotation page and writes scaled region annotations", async () => {
    const vault = createVault();
    const rawDocling =
      "<doctag><paragraph><loc_125><loc_250><loc_250><loc_500>Hello world</paragraph></doctag>";
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => createClient(rawDocling),
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => getDefaultRunOptions()),
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
    const body = vault.get(annotation.body[0]) as any;

    expect(page.type).toBe("AnnotationPage");
    expect(annotation.target).toBe(
      "https://example.org/canvas/1#xywh=250,1000,250,1000",
    );
    expect(annotation.motivation).toBe("supplementing");
    expect(body).toMatchObject({
      type: "TextualBody",
      format: "text/plain",
      value: "Hello world",
    });
  });

  test("replaces prior plugin annotations without removing user annotations", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", {
        annotations: [
          {
            id: "https://example.org/canvas/1/annotations",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/user-annotation",
                type: "Annotation",
                motivation: "commenting",
                body: [],
                target: "https://example.org/canvas/1",
              },
              {
                id: "https://example.org/canvas/1/ocr-docling/1/annotation",
                type: "Annotation",
                motivation: "supplementing",
                body: [],
                target: "https://example.org/canvas/1#xywh=1,1,1,1",
              },
            ],
          },
        ],
      }),
    ]);
    const rawDocling =
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>New text</paragraph></doctag>";
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => createClient(rawDocling),
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => ({
        ...getDefaultRunOptions(),
        skipAnnotatedCanvases: false,
      })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    const page = vault.get({
      id: "https://example.org/canvas/1/annotations",
      type: "AnnotationPage",
    }) as any;
    expect(page.items.map((item: any) => item.id)).toEqual([
      "https://example.org/user-annotation",
      "https://example.org/canvas/1/ocr-docling/1/annotation",
    ]);
    const annotation = vault.get({
      id: "https://example.org/canvas/1/ocr-docling/1/annotation",
      type: "Annotation",
    }) as any;
    const body = vault.get(annotation.body[0]) as any;
    expect(body.value).toBe("New text");
  });

  test("skips canvases with existing canvas annotations by default", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", {
        annotations: [
          {
            id: "https://example.org/canvas/1/annotations",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/user-annotation",
                type: "Annotation",
                motivation: "commenting",
                body: [],
                target: "https://example.org/canvas/1",
              },
            ],
          },
        ],
      }),
      createCanvas("https://example.org/canvas/2"),
    ]);
    const rawDocling =
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>Text</paragraph></doctag>";
    const convert = vi.fn(async (request) =>
      createDoclingBatch(request.pages[0]!.id, rawDocling),
    );
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => ({
        preload: vi.fn(async () => undefined),
        convert,
        onEvent: vi.fn(() => () => undefined),
        terminate: vi.fn(),
      }),
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => getDefaultRunOptions()),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    const instance =
      store.getState().instances[
        getBackgroundActionInstanceKey(definition.id, manifestTarget)
      ];
    const result = instance?.result as OcrDoclingActionResult;

    expect(convert).toHaveBeenCalledTimes(1);
    expect(convert.mock.calls[0]?.[0].pages[0]?.id).toBe(
      "https://example.org/canvas/2",
    );
    expect(result.selected).toBe(2);
    expect(result.processed).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.skippedCanvases).toEqual([
      {
        canvasId: "https://example.org/canvas/1",
        reason: "Canvas already has annotations",
      },
    ]);
  });

  test("skips canvases with missing dimensions or missing images", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1"),
      createCanvas("https://example.org/canvas/2", { width: undefined }),
      createCanvas("https://example.org/canvas/3"),
    ]);
    const rawDocling =
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>Text</paragraph></doctag>";
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => createClient(rawDocling),
      getCanvasImage: vi.fn(async (_ctx, canvas) =>
        canvas.id.endsWith("/3") ? null : createImage(),
      ),
      requestConfig: vi.fn(async () => getDefaultRunOptions()),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    const instance =
      store.getState().instances[
        getBackgroundActionInstanceKey(definition.id, manifestTarget)
      ];
    const result = instance?.result as OcrDoclingActionResult;

    expect(result.processed).toBe(1);
    expect(result.skipped).toBe(2);
    expect(result.skippedCanvases).toEqual([
      {
        canvasId: "https://example.org/canvas/2",
        reason: "Canvas dimensions unavailable",
      },
      {
        canvasId: "https://example.org/canvas/3",
        reason: "No painting image found",
      },
    ]);
  });

  test("runs only canvases matching a selected tag", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1"),
      createCanvas("https://example.org/canvas/2"),
    ]);
    const tags = createManifestEditorTagsApi(vault);
    tags.addTag(
      { id: "https://example.org/canvas/2", type: "Canvas" },
      REVIEW_TAG,
    );
    const convert = vi.fn(async (request) =>
      createDoclingBatch(request.pages[0]!.id, "<doctag></doctag>"),
    );
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => ({
        preload: vi.fn(async () => undefined),
        convert,
        onEvent: vi.fn(() => () => undefined),
        terminate: vi.fn(),
      }),
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => ({
        ...getDefaultRunOptions(),
        scope: "tag",
        tagKey: getTagKey(REVIEW_TAG),
      })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    expect(convert).toHaveBeenCalledTimes(1);
    expect(convert.mock.calls[0]?.[0].pages[0]?.id).toBe(
      "https://example.org/canvas/2",
    );
  });

  test("retains the Docling client after a successful run so the model stays warm", async () => {
    const vault = createVault();
    const rawDocling =
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>Text</paragraph></doctag>";
    const client = createClient(rawDocling);
    const createClientMock = vi.fn(() => client);
    const definition = createOcrDoclingBackgroundAction({
      createClient: createClientMock,
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => ({
        ...getDefaultRunOptions(),
        skipAnnotatedCanvases: false,
      })),
    });
    const store = createBackgroundActionsStore([definition]);

    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });
    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
    });

    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(client.preload).toHaveBeenCalledTimes(2);
    expect(client.convert).toHaveBeenCalledTimes(2);
    expect(client.terminate).not.toHaveBeenCalled();
  });

  test("recreates the retained Docling client when the worker URL setting changes", async () => {
    const firstClient = createClient(
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>First</paragraph></doctag>",
    );
    const secondClient = createClient(
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>Second</paragraph></doctag>",
    );
    const createClientMock = vi.fn((settings?: OcrDoclingPluginSettings) =>
      settings?.workerUrl === "/workers/docling-b.js"
        ? secondClient
        : firstClient,
    );
    const definition = createOcrDoclingBackgroundAction({
      createClient: createClientMock,
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => ({
        ...getDefaultRunOptions(),
        skipAnnotatedCanvases: false,
      })),
    });

    await runBackgroundAction({
      store: createBackgroundActionsStore([definition]),
      context: createContext(createVault(), definition, {
        workerUrl: "/workers/docling-a.js",
      }),
    });
    await runBackgroundAction({
      store: createBackgroundActionsStore([definition]),
      context: createContext(createVault(), definition, {
        workerUrl: "/workers/docling-b.js",
      }),
    });

    expect(createClientMock).toHaveBeenCalledTimes(2);
    expect(firstClient.terminate).toHaveBeenCalledTimes(1);
    expect(secondClient.convert).toHaveBeenCalledTimes(1);
  });

  test("aborts OCR and terminates the worker when cancelled", async () => {
    const vault = createVault();
    let rejectConvert: (error: Error) => void = () => {};
    const terminate = vi.fn(() => rejectConvert(new Error("terminated")));
    const convert = vi.fn(
      () =>
        new Promise<DoclingBatchResult>((_resolve, reject) => {
          rejectConvert = reject;
        }),
    );
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => ({
        preload: vi.fn(async () => undefined),
        convert,
        onEvent: vi.fn(() => () => undefined),
        terminate,
      }),
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig: vi.fn(async () => getDefaultRunOptions()),
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
    await waitUntil(() => convert.mock.calls.length === 1);
    store.getState().cancelAction(instanceKey);
    await promise;

    expect(terminate).toHaveBeenCalled();
    expect(store.getState().instances[instanceKey]?.status).toBe("cancelled");
  });

  test("resumes incomplete OCR tasks with persisted options", async () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1"),
      createCanvas("https://example.org/canvas/2"),
    ]);
    const rawDocling =
      "<doctag><paragraph><loc_0><loc_0><loc_100><loc_100>Text</paragraph></doctag>";
    const convert = vi.fn(async (request) =>
      createDoclingBatch(request.pages[0]!.id, rawDocling),
    );
    const requestConfig = vi.fn(async () => getDefaultRunOptions());
    const definition = createOcrDoclingBackgroundAction({
      createClient: () => ({
        preload: vi.fn(async () => undefined),
        convert,
        onEvent: vi.fn(() => () => undefined),
        terminate: vi.fn(),
      }),
      getCanvasImage: vi.fn(async () => createImage()),
      requestConfig,
    });
    const store = createBackgroundActionsStore([definition]);
    const instanceKey = getBackgroundActionInstanceKey(
      definition.id,
      manifestTarget,
    );
    const snapshot: BackgroundActionPersistedState = {
      version: 1,
      savedAt: Date.now(),
      instances: {
        [instanceKey]: {
          id: instanceKey,
          runId: "run-resume",
          actionId: definition.id,
          target: manifestTarget,
          label: definition.label,
          status: "running",
          statusText: "Running",
          error: null,
          result: undefined,
          resultsAvailable: false,
          logs: [],
          events: [],
          startedAt: Date.now(),
        },
      },
      histories: {},
      plans: {
        [instanceKey]: {
          version: 1,
          data: {
            total: 2,
            options: {
              ...getDefaultRunOptions(),
              prompt: "Persisted prompt",
              imageSize: 768,
            },
          },
          tasks: [
            {
              id: "canvas:https://example.org/canvas/1",
              label: "https://example.org/canvas/1",
              target: {
                id: "https://example.org/canvas/1",
                type: "Canvas",
                label: "https://example.org/canvas/1",
                scope: "canvas",
              },
              status: "complete",
              result: {
                type: "processed",
                canvas: {
                  canvasId: "https://example.org/canvas/1",
                  imageUrl:
                    "https://example.org/image/full/1024,/0/default.jpg",
                  annotations: 3,
                  durationMs: 10,
                },
              },
            },
            {
              id: "canvas:https://example.org/canvas/2",
              label: "https://example.org/canvas/2",
              target: {
                id: "https://example.org/canvas/2",
                type: "Canvas",
                label: "https://example.org/canvas/2",
                scope: "canvas",
              },
              status: "running",
            },
          ],
        },
      },
    };

    store.getState().hydrate(snapshot);
    await runBackgroundAction({
      store,
      context: createContext(vault, definition),
      resume: true,
    });

    const result = store.getState().instances[instanceKey]
      ?.result as OcrDoclingActionResult;

    expect(requestConfig).not.toHaveBeenCalled();
    expect(convert).toHaveBeenCalledTimes(1);
    expect(convert.mock.calls[0]?.[0].prompt).toBe("Persisted prompt");
    expect(convert.mock.calls[0]?.[0].pages[0]?.id).toBe(
      "https://example.org/canvas/2",
    );
    expect(result.selected).toBe(2);
    expect(result.processed).toBe(2);
    expect(result.annotations).toBe(4);
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
