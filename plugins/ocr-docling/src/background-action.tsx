import type { BackgroundActionDefinition, BackgroundActionRunContext } from "@manifest-editor/shell";
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
import { writeDoclingRegionAnnotations, type WrittenOcrAnnotation } from "./annotations";
import { openOcrDoclingResults, renderOcrDoclingResults } from "./results";
import { getCanvasTagOptions, parseTagKey } from "./tags";

export const OCR_DOCLING_ACTION_ID = "@manifest-editor/ocr-docling/run-ocr";
export const OCR_DOCLING_PLUGIN_ID = "@manifest-editor/ocr-docling";

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

export type OcrDoclingActionDependencies = {
  createClient?: () => Pick<DoclingWorkerClient, "preload" | "convert" | "onEvent" | "terminate">;
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

const runOptions = new Map<string, OcrDoclingRunOptions>();

export function createOcrDoclingBackgroundAction(
  dependencies: OcrDoclingActionDependencies = {},
): BackgroundActionDefinition {
  const createClient = dependencies.createClient || createDoclingWorkerClient;
  const getCanvasImage = dependencies.getCanvasImage || getCanvasImageForOcr;
  const writeAnnotations = dependencies.writeAnnotations || writeDoclingRegionAnnotations;
  const requestConfig = dependencies.requestConfig || defaultRequestConfig;

  return {
    id: OCR_DOCLING_ACTION_ID,
    label: "Run OCR with Docling",
    summary: "Transcribe canvas text into annotations",
    section: "OCR",
    order: 20,
    resourceTypes: ["Manifest"],
    render: (ctx) => (
      <>
        {renderOcrDoclingConfigModal(ctx.definition.id)}
        {renderOcrDoclingResults(ctx.definition.id)}
      </>
    ),
    onResults: (ctx) => openOcrDoclingResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return !!manifest?.items?.length;
    },
    prepare: async (ctx) => {
      const canvases = getManifestCanvases(ctx);
      const options = await requestConfig(ctx, canvases, runOptions.get(ctx.instanceKey) || getDefaultRunOptions());
      if (options === false) {
        return false;
      }

      runOptions.set(ctx.instanceKey, options);
      return true;
    },
    run: async (ctx) => {
      const manifestCanvases = getManifestCanvases(ctx);
      const options = runOptions.get(ctx.instanceKey) || getDefaultRunOptions();
      const selectedCanvases = selectCanvases(ctx, manifestCanvases, options);
      const result = createEmptyResult(manifestCanvases.length, selectedCanvases.length);

      ctx.setActionLabel("Running Docling OCR");

      if (!selectedCanvases.length) {
        ctx.setActionStatus("running", "No canvases selected");
        return result;
      }

      ctx.canvasProgress.setStatuses(
        selectedCanvases.map((canvas) => ({ id: canvas.id, type: "Canvas" })),
        "queued",
      );
      const client = createClient();
      const unsubscribe = client.onEvent((event) => handleDoclingEvent(ctx, event));
      const abort = () => client.terminate();

      ctx.signal.addEventListener("abort", abort, { once: true });

      try {
        throwIfAborted(ctx.signal);
        ctx.setActionStatus("running", "Loading Docling model");
        await client.preload();

        for (const [index, canvas] of selectedCanvases.entries()) {
          throwIfAborted(ctx.signal);
          const canvasId = canvas?.id || `canvas-${index + 1}`;
          const label = `OCR ${index + 1}/${selectedCanvases.length}`;
          ctx.canvasProgress.setStatus({ id: canvasId, type: "Canvas" }, "pending");
          ctx.setActionStatus("running", label);
          ctx.setActionProgress({ current: index, total: selectedCanvases.length, label });
          ctx.appendActionLog(label, "info", {
            canvasId,
            current: index + 1,
            total: selectedCanvases.length,
          });

          try {
            if (!hasCanvasDimensions(canvas)) {
              result.skippedCanvases.push({
                canvasId,
                reason: "Canvas dimensions unavailable",
              });
              ctx.appendActionLog("Skipped canvas OCR", "warn", {
                canvasId,
                reason: "Canvas dimensions unavailable",
              });
              ctx.setActionProgress({
                current: index + 1,
                total: selectedCanvases.length,
                label: `OCR ${index + 1}/${selectedCanvases.length}`,
              });
              continue;
            }

            const image = await getCanvasImage(ctx, canvas, options.imageSize);
            if (!image) {
              result.skippedCanvases.push({
                canvasId,
                reason: "No painting image found",
              });
              ctx.appendActionLog("Skipped canvas OCR", "warn", {
                canvasId,
                reason: "No painting image found",
              });
              ctx.setActionProgress({
                current: index + 1,
                total: selectedCanvases.length,
                label: `OCR ${index + 1}/${selectedCanvases.length}`,
              });
              continue;
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

            result.canvases.push({
              canvasId,
              imageUrl: image.url,
              annotations: annotations.length,
              durationMs: performance.now() - startedAt,
            });
            ctx.appendActionLog("Created OCR annotations", "info", {
              canvasId,
              annotations: annotations.length,
            });
          } catch (error) {
            if (ctx.signal.aborted) {
              throw error;
            }

            const reason = getErrorMessage(error);
            result.skippedCanvases.push({
              canvasId,
              reason,
            });
            ctx.appendActionLog("Skipped canvas OCR", "warn", {
              canvasId,
              reason,
            });
          } finally {
            if (!ctx.signal.aborted) {
              ctx.canvasProgress.setStatus({ id: canvasId, type: "Canvas" }, "done");
            }
          }

          ctx.setActionProgress({
            current: index + 1,
            total: selectedCanvases.length,
            label: `OCR ${index + 1}/${selectedCanvases.length}`,
          });
        }
      } finally {
        ctx.signal.removeEventListener("abort", abort);
        unsubscribe();
        client.terminate();
        runOptions.delete(ctx.instanceKey);
      }

      result.processed = result.canvases.length;
      result.annotations = result.canvases.reduce((total, item) => total + item.annotations, 0);
      result.skipped = result.skippedCanvases.length;
      ctx.setActionStatus("running", `Created ${result.annotations} OCR annotations`);
      ctx.setActionProgress({ current: selectedCanvases.length, total: selectedCanvases.length, label: "OCR complete" });

      return result;
    },
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

  return requestOcrDoclingConfig({
    actionId: ctx.definition.id,
    instanceKey: ctx.instanceKey,
    totalCanvases: canvases.length,
    tags: getCanvasTagOptions(ctx, canvases),
    defaults: pluginDefaults,
    signal: ctx.signal,
  });
}

function getManifestCanvases(ctx: BackgroundActionRunContext) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items ? (ctx.vault.get(manifest.items) || []).filter(Boolean) : [];
}

function selectCanvases(ctx: BackgroundActionRunContext, canvases: any[], options: OcrDoclingRunOptions) {
  if (options.scope !== "tag" || !options.tagKey) {
    return canvases;
  }

  const selectedTag = parseTagKey(options.tagKey);
  if (!selectedTag) {
    return [];
  }

  return canvases.filter((canvas) =>
    ctx.tags.hasTag({ id: canvas.id, type: "Canvas" }, selectedTag.type, selectedTag.id),
  );
}

function createEmptyResult(total: number, selected: number): OcrDoclingActionResult {
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

function handleDoclingEvent(ctx: BackgroundActionRunContext, event: DoclingEvent) {
  switch (event.type) {
    case "model-progress":
      ctx.setActionStatus(
        "running",
        `Downloading model ${Math.round(event.progress)}% (${formatBytes(event.loaded)} / ${formatBytes(event.total)})`,
      );
      break;
    case "model-ready":
      ctx.setActionStatus("running", "Model ready");
      break;
    case "page-token":
      ctx.setActionStatus("running", `Recognising text (${event.text.length} chars)`);
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
      ctx.setActionStatus("running", `Recognising ${event.pageIndex + 1}/${event.totalPages}`);
      break;
  }
}

function getBatchPage(batch: DoclingBatchResult, canvasId: string) {
  return batch.pages.find((page) => page.id === canvasId) || batch.pages[0] || null;
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
