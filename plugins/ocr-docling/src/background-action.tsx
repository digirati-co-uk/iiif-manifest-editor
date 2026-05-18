import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTask,
} from "@manifest-editor/shell";
import { getCanvasImageForOcr, type CanvasImageForOcr } from "./canvas-image";
import {
  applyOcrDoclingPluginSettings,
  getDefaultRunOptions,
  renderOcrDoclingConfigModal,
  requestOcrDoclingConfig,
  type OcrDoclingPluginSettings,
  type OcrDoclingRunOptions,
} from "./config-modal";
import {
  createDoclingWorkerClient,
  extractDoclingRegions,
  type DoclingBatchResult,
  type DoclingEvent,
  type DoclingWorkerClient,
} from "./docling";
import {
  canvasHasAnnotationPageAnnotations,
  writeDoclingRegionAnnotations,
  type WrittenOcrAnnotation,
} from "./annotations";
import { openOcrDoclingResults, renderOcrDoclingResults } from "./results";
import { getCanvasTagOptions, parseTagKey } from "./tags";

export const OCR_DOCLING_ACTION_ID = "@manifest-editor/ocr-docling/run-ocr";
export const OCR_DOCLING_PLUGIN_ID = "@manifest-editor/ocr-docling";

type OcrPrepareData = {
  scope?: "selected";
};

export type OcrDoclingCanvasResult = {
  canvasId: string;
  imageUrl: string;
  annotations: number;
  durationMs: number;
};

export type OcrDoclingCanvasSkip = {
  canvasId: string;
  reason: string;
};

export type OcrDoclingActionResult = {
  total: number;
  selected: number;
  processed: number;
  annotations: number;
  skipped: number;
  canvases: OcrDoclingCanvasResult[];
  skippedCanvases: OcrDoclingCanvasSkip[];
};

type OcrDoclingTaskResult =
  | {
      type: "processed";
      canvas: OcrDoclingCanvasResult;
    }
  | {
      type: "skipped";
      skip: OcrDoclingCanvasSkip;
    };

type OcrDoclingPlanData = {
  options: OcrDoclingRunOptions;
  total: number;
};

type OcrDoclingClient = Pick<
  DoclingWorkerClient,
  "preload" | "convert" | "onEvent" | "terminate"
>;

export type OcrDoclingActionDependencies = {
  createClient?: () => OcrDoclingClient;
  getCanvasImage?: (
    ctx: BackgroundActionRunContext,
    canvas: any,
    size: number,
  ) => Promise<CanvasImageForOcr | null>;
  writeAnnotations?: (
    ctx: BackgroundActionRunContext,
    canvas: any,
    regions: ReturnType<typeof extractDoclingRegions>,
  ) => WrittenOcrAnnotation[];
  requestConfig?: (
    ctx: BackgroundActionRunContext,
    canvases: any[],
    defaults: OcrDoclingRunOptions,
  ) => Promise<OcrDoclingRunOptions | false>;
};

export function createOcrDoclingBackgroundAction(
  dependencies: OcrDoclingActionDependencies = {},
): BackgroundActionDefinition {
  const createClient = dependencies.createClient || createDoclingWorkerClient;
  const getCanvasImage = dependencies.getCanvasImage || getCanvasImageForOcr;
  const writeAnnotations =
    dependencies.writeAnnotations || writeDoclingRegionAnnotations;
  const requestConfig = dependencies.requestConfig || defaultRequestConfig;
  let retainedClient: OcrDoclingClient | null = null;

  const getClient = () => {
    retainedClient ||= createClient();
    return retainedClient;
  };

  return {
    id: OCR_DOCLING_ACTION_ID,
    label: "Run OCR with Docling",
    summary: "Transcribe canvas text into annotations",
    section: "OCR",
    order: 20,
    resourceTypes: ["Manifest"],
    resumable: true,
    render: (ctx) => (
      <>
        {renderOcrDoclingConfigModal(ctx.definition.id)}
        {renderOcrDoclingResults(ctx.definition.id)}
      </>
    ),
    onResults: (ctx) =>
      openOcrDoclingResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return !!manifest?.items?.length;
    },
    prepare: async (ctx) => {
      const canvases = getManifestCanvases(ctx);
      const options = await requestConfig(
        ctx,
        canvases,
        getDefaultRunOptions(),
      );
      if (options === false) {
        return false;
      }

      const selectedCanvases = selectCanvases(ctx, canvases, options);
      return createDoclingPlan(canvases.length, selectedCanvases, options, ctx);
    },
    run: async (ctx) => {
      const plan = ctx.plan || createDoclingPlan(0, [], getDefaultRunOptions());
      const options = getPlanOptions(plan) || getDefaultRunOptions();
      const tasks = ctx.tasks.getAll();
      const pendingTasks = ctx.tasks.getPending();
      const totalCanvases = getPlanTotal(plan);

      ctx.setActionLabel("Running Docling OCR");

      if (!tasks.length) {
        ctx.setActionStatus("running", "No canvases selected");
        return createEmptyResult(totalCanvases, 0);
      }

      if (pendingTasks.length) {
        ctx.canvasProgress.setStatuses(
          pendingTasks
            .map((task) => task.target)
            .filter(
              (target): target is NonNullable<BackgroundActionTask["target"]> =>
                !!target && target.type === "Canvas",
            ),
          "queued",
        );
        const client = getClient();
        const unsubscribe = client.onEvent((event) =>
          handleDoclingEvent(ctx, event),
        );
        let terminated = false;
        const terminateClient = () => {
          if (terminated) {
            return;
          }

          terminated = true;
          client.terminate();
          if (retainedClient === client) {
            retainedClient = null;
          }
        };
        const abort = () => terminateClient();

        ctx.signal.addEventListener("abort", abort, { once: true });

        try {
          throwIfAborted(ctx.signal);
          ctx.setActionStatus("running", "Loading Docling model");
          await client.preload();

          await ctx.tasks.runEach(
            async (task, { index, total }) => {
              throwIfAborted(ctx.signal);
              const canvasId =
                task.target?.id ||
                (task.input as { canvasId?: string } | undefined)?.canvasId ||
                task.id;
              const canvas = getCanvasById(ctx, canvasId);
              const label = `OCR ${index + 1}/${total}`;
              ctx.appendActionLog(label, "info", {
                canvasId,
                current: index + 1,
                total,
              });

              try {
                if (!canvas || !hasCanvasDimensions(canvas)) {
                  const skip = {
                    canvasId,
                    reason: "Canvas dimensions unavailable",
                  };
                  ctx.appendActionLog("Skipped canvas OCR", "warn", {
                    canvasId,
                    reason: skip.reason,
                  });
                  return {
                    taskStatus: "skipped",
                    result: {
                      type: "skipped",
                      skip,
                    } satisfies OcrDoclingTaskResult,
                  };
                }

                const image = await getCanvasImage(
                  ctx,
                  canvas,
                  options.imageSize,
                );
                if (!image) {
                  const skip = {
                    canvasId,
                    reason: "No painting image found",
                  };
                  ctx.appendActionLog("Skipped canvas OCR", "warn", {
                    canvasId,
                    reason: skip.reason,
                  });
                  return {
                    taskStatus: "skipped",
                    result: {
                      type: "skipped",
                      skip,
                    } satisfies OcrDoclingTaskResult,
                  };
                }

                const startedAt = performance.now();
                const batch = await client.convert({
                  prompt: options.prompt,
                  pages: [
                    {
                      id: canvasId,
                      name: getCanvasLabel(canvas),
                      source: image.blob,
                    },
                  ],
                });
                const page = getBatchPage(batch, canvasId);
                const regions = extractDoclingRegions(page?.rawDocling || "");
                const annotations = writeAnnotations(ctx, canvas, regions);
                const canvasResult = {
                  canvasId,
                  imageUrl: image.url,
                  annotations: annotations.length,
                  durationMs: performance.now() - startedAt,
                };

                ctx.appendActionLog("Created OCR annotations", "info", {
                  canvasId,
                  annotations: annotations.length,
                });
                return {
                  taskStatus: "complete",
                  result: {
                    type: "processed",
                    canvas: canvasResult,
                  } satisfies OcrDoclingTaskResult,
                };
              } catch (error) {
                if (ctx.signal.aborted) {
                  throw error;
                }

                const skip = {
                  canvasId,
                  reason: getErrorMessage(error),
                };
                ctx.appendActionLog("Skipped canvas OCR", "warn", {
                  canvasId,
                  reason: skip.reason,
                });
                return {
                  taskStatus: "skipped",
                  result: {
                    type: "skipped",
                    skip,
                  } satisfies OcrDoclingTaskResult,
                };
              }
            },
            {
              progressLabel: (_task, index, total) =>
                `OCR ${index + 1}/${total}`,
            },
          );
        } catch (error) {
          terminateClient();
          throw error;
        } finally {
          ctx.signal.removeEventListener("abort", abort);
          unsubscribe();
        }
      }

      const result = aggregateDoclingResult(totalCanvases, ctx.tasks.getAll());
      result.processed = result.canvases.length;
      result.annotations = result.canvases.reduce(
        (total, item) => total + item.annotations,
        0,
      );
      result.skipped = result.skippedCanvases.length;
      ctx.setActionStatus(
        "running",
        `Created ${result.annotations} OCR annotations`,
      );
      ctx.setActionProgress({
        current: result.selected,
        total: result.selected,
        label: "OCR complete",
      });

      return result;
    },
  };
}

function createDoclingPlan(
  total: number,
  selectedCanvases: any[],
  options: OcrDoclingRunOptions,
  ctx?: BackgroundActionRunContext,
): BackgroundActionPlan {
  return {
    version: 1,
    data: {
      options,
      total,
    } satisfies OcrDoclingPlanData,
    tasks: selectedCanvases.map((canvas, index) => {
      const canvasId = canvas?.id || `canvas-${index + 1}`;
      const label = getCanvasLabel(canvas) || canvasId;
      const skipExistingAnnotations =
        options.skipAnnotatedCanvases !== false && ctx
          ? canvasHasAnnotationPageAnnotations(ctx, canvas)
          : false;
      const skip = skipExistingAnnotations
        ? {
            canvasId,
            reason: "Canvas already has annotations",
          }
        : null;

      return {
        id: `canvas:${canvasId}`,
        label,
        target: {
          id: canvasId,
          type: "Canvas",
          label,
          scope: "canvas",
        },
        input: {
          canvasId,
        },
        status: skip ? "skipped" : "queued",
        statusText: skip
          ? "Skipped: canvas already has annotations"
          : undefined,
        result: skip
          ? ({
              type: "skipped",
              skip,
            } satisfies OcrDoclingTaskResult)
          : undefined,
        completedAt: skip ? Date.now() : undefined,
      };
    }),
  };
}

async function defaultRequestConfig(
  ctx: BackgroundActionRunContext,
  canvases: any[],
  defaults: OcrDoclingRunOptions,
) {
  const pluginDefaults = applyOcrDoclingPluginSettings(
    defaults,
    ctx.plugins.getSettings<OcrDoclingPluginSettings>(OCR_DOCLING_PLUGIN_ID),
  );
  const prepareData = ctx.prepareData as OcrPrepareData | undefined;
  const requestDefaults =
    prepareData?.scope === "selected"
      ? { ...pluginDefaults, scope: "selected" as const }
      : pluginDefaults;

  return requestOcrDoclingConfig({
    actionId: ctx.definition.id,
    instanceKey: ctx.instanceKey,
    totalCanvases: canvases.length,
    annotatedCanvases: canvases.filter((canvas) =>
      canvasHasAnnotationPageAnnotations(ctx, canvas),
    ).length,
    selectedCanvas: getCurrentCanvasOption(ctx, canvases),
    tags: getCanvasTagOptions(ctx, canvases),
    defaults: requestDefaults,
    signal: ctx.signal,
  });
}

function getManifestCanvases(ctx: BackgroundActionRunContext) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items
    ? (ctx.vault.get(manifest.items) || []).filter(Boolean)
    : [];
}

function getCanvasById(ctx: BackgroundActionRunContext, canvasId: string) {
  return ctx.vault.get({ id: canvasId, type: "Canvas" } as any) as any;
}

function selectCanvases(
  ctx: BackgroundActionRunContext,
  canvases: any[],
  options: OcrDoclingRunOptions,
) {
  if (options.scope === "selected") {
    const currentCanvasId = ctx.currentCanvas?.id;
    return currentCanvasId
      ? canvases.filter((canvas) => canvas?.id === currentCanvasId)
      : [];
  }

  if (options.scope !== "tag" || !options.tagKey) {
    return canvases;
  }

  const selectedTag = parseTagKey(options.tagKey);
  if (!selectedTag) {
    return [];
  }

  return canvases.filter((canvas) =>
    ctx.tags.hasTag(
      { id: canvas.id, type: "Canvas" },
      selectedTag.type,
      selectedTag.id,
    ),
  );
}

function getCurrentCanvasOption(
  ctx: BackgroundActionRunContext,
  canvases: any[],
) {
  const currentCanvasId = ctx.currentCanvas?.id;
  if (!currentCanvasId) {
    return undefined;
  }

  const canvas = canvases.find((item) => item?.id === currentCanvasId);
  if (!canvas) {
    return undefined;
  }

  return {
    id: currentCanvasId,
    label: getCanvasLabel(canvas),
    annotated: canvasHasAnnotationPageAnnotations(ctx, canvas),
  };
}

function createEmptyResult(
  total: number,
  selected: number,
): OcrDoclingActionResult {
  return {
    total,
    selected,
    processed: 0,
    annotations: 0,
    skipped: 0,
    canvases: [],
    skippedCanvases: [],
  };
}

function aggregateDoclingResult(
  total: number,
  tasks: BackgroundActionTask[],
): OcrDoclingActionResult {
  const result = createEmptyResult(total, tasks.length);

  for (const task of tasks) {
    const taskResult = task.result as OcrDoclingTaskResult | undefined;
    if (taskResult?.type === "processed") {
      result.canvases.push(taskResult.canvas);
      continue;
    }

    if (taskResult?.type === "skipped") {
      result.skippedCanvases.push(taskResult.skip);
      continue;
    }

    if (task.status === "error" && task.error) {
      result.skippedCanvases.push({
        canvasId: task.target?.id || task.id,
        reason: task.error.message,
      });
    }
  }

  result.processed = result.canvases.length;
  result.annotations = result.canvases.reduce(
    (totalAnnotations, item) => totalAnnotations + item.annotations,
    0,
  );
  result.skipped = result.skippedCanvases.length;
  return result;
}

function getPlanOptions(
  plan: BackgroundActionPlan,
): OcrDoclingRunOptions | null {
  const data = plan.data as Partial<OcrDoclingPlanData> | undefined;
  return data?.options || null;
}

function getPlanTotal(plan: BackgroundActionPlan) {
  const data = plan.data as Partial<OcrDoclingPlanData> | undefined;
  return typeof data?.total === "number" ? data.total : plan.tasks.length;
}

function handleDoclingEvent(
  ctx: BackgroundActionRunContext,
  event: DoclingEvent,
) {
  switch (event.type) {
    case "model-progress":
      ctx.setActionStatus(
        "running",
        `Loading model ${Math.round(event.progress)}% (${formatBytes(event.loaded)} / ${formatBytes(event.total)})`,
      );
      break;
    case "model-ready":
      ctx.setActionStatus("running", "Model ready");
      break;
    case "page-token":
      ctx.setActionStatus(
        "running",
        `Recognising text (${event.text.length} chars)`,
      );
      break;
    case "page-complete":
      ctx.setActionStatus("running", "Writing annotations");
      break;
    case "error":
      if (!ctx.signal.aborted) {
        ctx.setActionStatus("running", event.message);
      }
      break;
    case "page-start":
      ctx.setActionStatus(
        "running",
        `Recognising ${event.pageIndex + 1}/${event.totalPages}`,
      );
      break;
  }
}

function getBatchPage(batch: DoclingBatchResult, canvasId: string) {
  return (
    batch.pages.find((page) => page.id === canvasId) || batch.pages[0] || null
  );
}

function hasCanvasDimensions(canvas: any) {
  return Number(canvas?.width) > 0 && Number(canvas?.height) > 0;
}

function getCanvasLabel(canvas: any) {
  const label = canvas?.label;
  if (!label) {
    return canvas?.id;
  }

  if (typeof label === "string") {
    return label;
  }

  const firstLanguage = Object.keys(label)[0];
  const firstValue = firstLanguage ? label[firstLanguage]?.[0] : undefined;
  return firstValue || canvas?.id;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new Error("Docling OCR cancelled.");
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Canvas OCR failed";
}

function formatBytes(value: number) {
  if (!value) {
    return "0 MB";
  }

  return `${Math.round(value / 1024 / 1024)} MB`;
}
