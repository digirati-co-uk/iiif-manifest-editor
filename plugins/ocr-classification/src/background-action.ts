import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTask,
} from "@manifest-editor/shell";
import { type CanvasImageForClassification, getCanvasImageForClassification } from "./canvas-image";
import {
  createOcrDifficultyTag,
  formatOcrScore,
  OCR_DIFFICULTY_CLASSES,
  OCR_DIFFICULTY_TAG_TYPE,
  type OcrClassifierRun,
} from "./ocr-difficulty";
import { openOcrClassificationResults, renderOcrClassificationResults } from "./results";

export const OCR_CLASSIFICATION_ACTION_ID = "@manifest-editor/ocr-classification/classify-canvases";

export type OcrCanvasClassification = {
  canvasId: string;
  canvasLabel: string;
  tagId: string;
  label: string;
  score: number;
  scores: number[];
  imageUrl: string;
};

export type OcrCanvasClassificationSkip = {
  canvasId: string;
  canvasLabel: string;
  reason: string;
};

export type OcrClassificationActionResult = {
  total: number;
  classified: number;
  skipped: number;
  counts: Record<string, number>;
  classifications: OcrCanvasClassification[];
  skippedCanvases: OcrCanvasClassificationSkip[];
};

type OcrClassificationTaskResult =
  | {
      type: "classified";
      classification: OcrCanvasClassification;
    }
  | {
      type: "skipped";
      skip: OcrCanvasClassificationSkip;
    };

export type OcrClassificationActionDependencies = {
  prepareClassifier?: () => Promise<void>;
  getCanvasImage?: (ctx: BackgroundActionRunContext, canvas: any) => Promise<CanvasImageForClassification | null>;
  classifyImage?: (image: Blob) => Promise<OcrClassifierRun>;
};

export function createOcrClassificationBackgroundAction(
  dependencies: OcrClassificationActionDependencies = {},
): BackgroundActionDefinition {
  const prepareClassifier = dependencies.prepareClassifier || defaultPrepareClassifier;
  const getCanvasImage = dependencies.getCanvasImage || getCanvasImageForClassification;
  const classifyImage = dependencies.classifyImage || defaultClassifyImage;

  return {
    id: OCR_CLASSIFICATION_ACTION_ID,
    label: "Classify OCR difficulty",
    summary: "Tag each canvas by OCR difficulty",
    section: "OCR",
    order: 10,
    resourceTypes: ["Manifest"],
    resumable: true,
    render: () => renderOcrClassificationResults(OCR_CLASSIFICATION_ACTION_ID),
    onResults: (ctx) => openOcrClassificationResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return !!manifest?.items?.length;
    },
    prepare: (ctx) => {
      return createClassificationPlan(getManifestCanvases(ctx));
    },
    run: async (ctx) => {
      const plan = ctx.plan || createClassificationPlan(getManifestCanvases(ctx));
      const tasks = ctx.tasks.getAll();
      const pendingTasks = ctx.tasks.getPending();

      ctx.setActionLabel("Classifying OCR difficulty");

      if (!tasks.length) {
        ctx.setActionStatus("running", "No canvases to classify");
        return createEmptyResult(0);
      }

      if (pendingTasks.length) {
        ctx.canvasProgress.setStatuses(
          pendingTasks
            .map((task) => task.target)
            .filter((target): target is NonNullable<BackgroundActionTask["target"]> => !!target && target.type === "Canvas"),
          "queued",
        );
        ctx.setActionStatus("running", "Loading OCR classifier");
        await prepareClassifier();

        await ctx.tasks.runEach(
          async (task, { index, total }) => {
            throwIfAborted(ctx.signal);
            const canvasId = task.target?.id || (task.input as { canvasId?: string } | undefined)?.canvasId || task.id;
            const canvas = getCanvasById(ctx, canvasId);
            const canvasLabel = getCanvasLabel(canvas, canvasId);
            const label = `Classifying ${index + 1}/${total}`;

            ctx.appendActionLog(label, "info", { canvasId, current: index + 1, total });

            try {
              const image = canvas ? await getCanvasImage(ctx, canvas) : null;
              if (!image) {
                const skip = {
                  canvasId,
                  canvasLabel,
                  reason: "No painting image found",
                };
                ctx.appendActionLog("Skipped canvas classification", "warn", {
                  canvasId,
                  reason: skip.reason,
                });
                return {
                  taskStatus: "skipped",
                  result: {
                    type: "skipped",
                    skip,
                  } satisfies OcrClassificationTaskResult,
                };
              }

              const classification = await classifyImage(image.blob);
              const tag = createOcrDifficultyTag(classification.prediction);
              ctx.tags.upsertTag({ id: canvasId, type: "Canvas" }, tag);

              const result = {
                canvasId,
                canvasLabel,
                tagId: tag.id,
                label: tag.label,
                score: classification.prediction.score,
                scores: classification.scores,
                imageUrl: image.url,
              };
              ctx.appendActionLog("Classified canvas", "info", {
                canvasId,
                label: tag.label,
                score: classification.prediction.score,
              });
              return {
                taskStatus: "complete",
                result: {
                  type: "classified",
                  classification: result,
                } satisfies OcrClassificationTaskResult,
              };
            } catch (error) {
              if (ctx.signal.aborted) {
                throw error;
              }

              const skip = {
                canvasId,
                canvasLabel,
                reason: getErrorMessage(error),
              };
              ctx.appendActionLog("Skipped canvas classification", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped",
                result: {
                  type: "skipped",
                  skip,
                } satisfies OcrClassificationTaskResult,
              };
            }
          },
          {
            progressLabel: (_task, index, total) => `Classifying ${index + 1}/${total}`,
          },
        );
      }

      const result = aggregateClassificationResult(ctx.tasks.getAll().length ? ctx.tasks.getAll() : plan.tasks);
      ctx.setActionStatus("running", `Classified ${result.classified}/${result.total}`);
      ctx.setActionProgress({ current: result.total, total: result.total, label: "Classification complete" });
      ctx.appendActionLog("Classification complete", "info", {
        total: result.total,
        classified: result.classified,
        skipped: result.skipped,
        counts: result.counts,
      });

      return result;
    },
  };
}

function createClassificationPlan(canvases: any[]): BackgroundActionPlan {
  return {
    version: 1,
    tasks: canvases.map((canvas, index) => {
      const canvasId = canvas?.id || `canvas-${index + 1}`;
      const canvasLabel = getCanvasLabel(canvas, canvasId);
      return {
        id: `canvas:${canvasId}`,
        label: canvasLabel,
        target: {
          id: canvasId,
          type: "Canvas",
          label: canvasLabel,
          scope: "canvas",
        },
        input: {
          canvasId,
          canvasLabel,
        },
        status: "queued",
      };
    }),
  };
}

function createEmptyResult(total: number): OcrClassificationActionResult {
  return {
    total,
    classified: 0,
    skipped: 0,
    counts: Object.fromEntries(OCR_DIFFICULTY_CLASSES.map((item) => [item.id, 0])),
    classifications: [],
    skippedCanvases: [],
  };
}

function aggregateClassificationResult(tasks: BackgroundActionTask[]): OcrClassificationActionResult {
  const result = createEmptyResult(tasks.length);

  for (const task of tasks) {
    const taskResult = task.result as OcrClassificationTaskResult | undefined;
    if (taskResult?.type === "classified") {
      result.classifications.push(taskResult.classification);
      result.counts[taskResult.classification.tagId] = (result.counts[taskResult.classification.tagId] || 0) + 1;
      continue;
    }

    if (taskResult?.type === "skipped") {
      result.skippedCanvases.push(taskResult.skip);
      continue;
    }

    if (task.status === "error" && task.error) {
      const canvasId = task.target?.id || task.id;
      result.skippedCanvases.push({
        canvasId,
        canvasLabel: task.label || canvasId,
        reason: task.error.message,
      });
    }
  }

  result.classified = result.classifications.length;
  result.skipped = result.skippedCanvases.length;
  return result;
}

async function defaultPrepareClassifier() {
  const { loadOcrClassifier } = await import("./onnx-classifier");
  await loadOcrClassifier();
}

async function defaultClassifyImage(image: Blob) {
  const { runOcrClassifier } = await import("./onnx-classifier");
  return runOcrClassifier(image);
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new Error("OCR classification cancelled.");
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Canvas classification failed";
}

function getManifestCanvases(ctx: BackgroundActionRunContext) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items ? (ctx.vault.get(manifest.items) || []).filter(Boolean) : [];
}

function getCanvasById(ctx: BackgroundActionRunContext, canvasId: string) {
  return ctx.vault.get({ id: canvasId, type: "Canvas" } as any) as any;
}

function getCanvasLabel(canvas: any, fallback: string) {
  const label = canvas?.label;
  if (!label) {
    return fallback;
  }

  if (typeof label === "string") {
    return label;
  }

  const englishLabel = Array.isArray(label.en) ? label.en[0] : undefined;
  if (englishLabel) {
    return englishLabel;
  }

  const firstLanguage = Object.keys(label)[0];
  const firstValue = firstLanguage && Array.isArray(label[firstLanguage]) ? label[firstLanguage][0] : undefined;
  return firstValue || fallback;
}

export { OCR_DIFFICULTY_TAG_TYPE, formatOcrScore };
