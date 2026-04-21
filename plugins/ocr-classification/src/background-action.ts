import type { BackgroundActionDefinition, BackgroundActionRunContext } from "@manifest-editor/shell";
import {
  createOcrDifficultyTag,
  formatOcrScore,
  OCR_DIFFICULTY_CLASSES,
  OCR_DIFFICULTY_TAG_TYPE,
  type OcrClassifierRun,
} from "./ocr-difficulty";
import {
  getCanvasImageForClassification,
  type CanvasImageForClassification,
} from "./canvas-image";
import { openOcrClassificationResults, renderOcrClassificationResults } from "./results";

export const OCR_CLASSIFICATION_ACTION_ID = "@manifest-editor/ocr-classification/classify-canvases";

export type OcrCanvasClassification = {
  canvasId: string;
  tagId: string;
  label: string;
  score: number;
  scores: number[];
  imageUrl: string;
};

export type OcrCanvasClassificationSkip = {
  canvasId: string;
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

export type OcrClassificationActionDependencies = {
  prepareClassifier?: () => Promise<void>;
  getCanvasImage?: (
    ctx: BackgroundActionRunContext,
    canvas: any,
  ) => Promise<CanvasImageForClassification | null>;
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
    render: () => renderOcrClassificationResults(OCR_CLASSIFICATION_ACTION_ID),
    onResults: (ctx) => openOcrClassificationResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return !!manifest?.items?.length;
    },
    run: async (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      const canvases = manifest?.items ? (ctx.vault.get(manifest.items) || []).filter(Boolean) : [];
      const result = createEmptyResult(canvases.length);

      ctx.setActionLabel("Classifying OCR difficulty");

      if (!canvases.length) {
        ctx.setActionStatus("running", "No canvases to classify");
        return result;
      }

      ctx.setActionStatus("running", "Loading OCR classifier");
      await prepareClassifier();

      for (const [index, canvas] of canvases.entries()) {
        throwIfAborted(ctx.signal);
        const canvasId = canvas?.id || `canvas-${index + 1}`;
        const label = `Classifying ${index + 1}/${canvases.length}`;

        ctx.setActionStatus("running", label);
        ctx.setActionProgress({ current: index, total: canvases.length, label });
        ctx.appendActionLog(label, "info", { canvasId, current: index + 1, total: canvases.length });

        try {
          const image = await getCanvasImage(ctx, canvas);
          if (!image) {
            result.skippedCanvases.push({
              canvasId,
              reason: "No painting image found",
            });
            ctx.appendActionLog("Skipped canvas classification", "warn", {
              canvasId,
              reason: "No painting image found",
            });
            ctx.setActionProgress({
              current: index + 1,
              total: canvases.length,
              label: `Classified ${index + 1}/${canvases.length}`,
            });
            continue;
          }

          const classification = await classifyImage(image.blob);
          const tag = createOcrDifficultyTag(classification.prediction);
          ctx.tags.upsertTag({ id: canvasId, type: "Canvas" }, tag);

          result.counts[tag.id] = (result.counts[tag.id] || 0) + 1;
          result.classifications.push({
            canvasId,
            tagId: tag.id,
            label: tag.label,
            score: classification.prediction.score,
            scores: classification.scores,
            imageUrl: image.url,
          });
          ctx.appendActionLog("Classified canvas", "info", {
            canvasId,
            label: tag.label,
            score: classification.prediction.score,
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
          ctx.appendActionLog("Skipped canvas classification", "warn", {
            canvasId,
            reason,
          });
        }

        ctx.setActionProgress({
          current: index + 1,
          total: canvases.length,
          label: `Classified ${index + 1}/${canvases.length}`,
        });
      }

      result.classified = result.classifications.length;
      result.skipped = result.skippedCanvases.length;
      ctx.setActionStatus("running", `Classified ${result.classified}/${result.total}`);
      ctx.setActionProgress({ current: canvases.length, total: canvases.length, label: "Classification complete" });

      return result;
    },
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

export { OCR_DIFFICULTY_TAG_TYPE, formatOcrScore };
