import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTask,
  ManifestEditorTag,
} from "@manifest-editor/shell";
import { collectDetectedManifestLanguages, type DetectedManifestLanguage } from "./collection";
import { TRANSLATION_LANGUAGE_TAG_ACTION_ID } from "./constants";
import { getLanguageLabel } from "./languages";

export const TRANSLATION_LANGUAGE_TAG_TYPE = "language";

export type CanvasLanguageTagResult = {
  canvasId: string;
  canvasLabel: string;
  language: string;
  label: string;
  count: number;
  detectedLanguages: string[];
};

export type CanvasLanguageTagSkip = {
  canvasId: string;
  canvasLabel: string;
  reason: string;
};

export type TranslationLanguageTagActionResult = {
  total: number;
  tagged: number;
  skipped: number;
  counts: Record<string, number>;
  tags: CanvasLanguageTagResult[];
  skippedCanvases: CanvasLanguageTagSkip[];
};

type CanvasLanguageTagTaskInput = {
  canvasId: string;
  canvasLabel: string;
};

type CanvasLanguageTagTaskResult =
  | {
      type: "tagged";
      tag: CanvasLanguageTagResult;
    }
  | {
      type: "skipped";
      skip: CanvasLanguageTagSkip;
    };

const LANGUAGE_TAG_PALETTE = [
  { backgroundColor: "#1d4ed8", textColor: "#ffffff" },
  { backgroundColor: "#047857", textColor: "#ffffff" },
  { backgroundColor: "#b45309", textColor: "#ffffff" },
  { backgroundColor: "#7c3aed", textColor: "#ffffff" },
  { backgroundColor: "#be123c", textColor: "#ffffff" },
  { backgroundColor: "#0f766e", textColor: "#ffffff" },
  { backgroundColor: "#4338ca", textColor: "#ffffff" },
  { backgroundColor: "#a16207", textColor: "#ffffff" },
];

export function createTranslationLanguageTagsBackgroundAction(): BackgroundActionDefinition {
  return {
    id: TRANSLATION_LANGUAGE_TAG_ACTION_ID,
    label: "Tag with languages",
    summary: "Tag each canvas with its detected language",
    section: "Translations",
    order: 35,
    resourceTypes: ["Manifest"],
    resumable: true,
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return manifest?.type === "Manifest" && !!manifest?.items?.length;
    },
    prepare: (ctx) => createLanguageTagPlan(getManifestCanvases(ctx)),
    run: async (ctx) => {
      const tasks = ctx.tasks.getAll();
      const pendingTasks = ctx.tasks.getPending();

      ctx.setActionLabel("Tagging canvas languages");

      if (!tasks.length) {
        const result = createEmptyResult(0);
        ctx.setActionStatus("running", "No canvases to tag");
        ctx.setActionProgress({
          current: 0,
          total: 0,
          label: "No canvases",
        });
        ctx.setResult(result);
        ctx.setResultsAvailable(false);
        return;
      }

      if (pendingTasks.length) {
        ctx.canvasProgress.setStatuses(
          pendingTasks
            .map((task) => task.target)
            .filter(
              (target): target is NonNullable<BackgroundActionTask["target"]> => !!target && target.type === "Canvas",
            ),
          "queued",
        );

        await ctx.tasks.runEach(
          async (task, { index, total }) => {
            throwIfAborted(ctx.signal);

            const input = task.input as CanvasLanguageTagTaskInput | undefined;
            const canvasId = task.target?.id || input?.canvasId || task.id;
            const canvas = getCanvasById(ctx, canvasId);
            const canvasLabel = getCanvasLabel(canvas, input?.canvasLabel || canvasId);

            ctx.appendActionLog(`Tagging language ${index + 1}/${total}`, "info", {
              canvasId,
              current: index + 1,
              total,
            });

            if (!canvas) {
              const skip = {
                canvasId,
                canvasLabel,
                reason: "Canvas not found",
              };
              ctx.appendActionLog("Skipped language tag", "warn", skip);
              return skippedTask(skip);
            }

            const detected = collectDetectedManifestLanguages(ctx.vault, {
              id: canvasId,
              type: "Canvas",
            } as any);
            const primary = selectPrimaryDetectedLanguage(detected);

            if (!primary) {
              ctx.tags.removeTag({ id: canvasId, type: "Canvas" }, TRANSLATION_LANGUAGE_TAG_TYPE);
              const skip = {
                canvasId,
                canvasLabel,
                reason: "No supported language detected",
              };
              ctx.appendActionLog("Skipped language tag", "warn", skip);
              return skippedTask(skip);
            }

            const tag = createLanguageTag(primary.language);
            ctx.tags.upsertTag({ id: canvasId, type: "Canvas" }, tag);

            const result = {
              canvasId,
              canvasLabel,
              language: primary.language,
              label: tag.label,
              count: primary.count,
              detectedLanguages: detected.map((language) => language.language),
            };

            ctx.appendActionLog("Tagged canvas language", "info", {
              canvasId,
              language: primary.language,
              label: tag.label,
            });

            return {
              taskStatus: "complete",
              statusText: `Tagged as ${tag.label}`,
              result: {
                type: "tagged",
                tag: result,
              } satisfies CanvasLanguageTagTaskResult,
            };
          },
          {
            progressLabel: (_task, index, total) => `Tagging languages ${index + 1}/${total}`,
          },
        );
      }

      const result = aggregateLanguageTagResult(ctx.tasks.getAll());
      ctx.setActionStatus("running", `Tagged ${result.tagged}/${result.total} canvases`);
      ctx.setActionProgress({
        current: result.total,
        total: result.total,
        label: "Language tagging complete",
      });
      ctx.appendActionLog("Language tagging complete", "info", {
        total: result.total,
        tagged: result.tagged,
        skipped: result.skipped,
        counts: result.counts,
      });
      ctx.setResult(result);
      ctx.setResultsAvailable(false);
    },
  };
}

export function createLanguageTag(language: string): ManifestEditorTag {
  const colours = getLanguageTagColours(language);
  return {
    type: TRANSLATION_LANGUAGE_TAG_TYPE,
    id: language,
    label: getLanguageLabel(language),
    backgroundColor: colours.backgroundColor,
    textColor: colours.textColor,
  };
}

export function selectPrimaryDetectedLanguage(languages: DetectedManifestLanguage[]): DetectedManifestLanguage | null {
  return (
    [...languages].sort(
      (a, b) =>
        b.count - a.count ||
        getLanguageLabel(a.language).localeCompare(getLanguageLabel(b.language)) ||
        a.language.localeCompare(b.language),
    )[0] || null
  );
}

function createLanguageTagPlan(canvases: any[]): BackgroundActionPlan {
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
        } satisfies CanvasLanguageTagTaskInput,
        status: "queued",
      };
    }),
  };
}

function skippedTask(skip: CanvasLanguageTagSkip) {
  return {
    taskStatus: "skipped" as const,
    statusText: skip.reason,
    result: {
      type: "skipped",
      skip,
    } satisfies CanvasLanguageTagTaskResult,
  };
}

function createEmptyResult(total: number): TranslationLanguageTagActionResult {
  return {
    total,
    tagged: 0,
    skipped: 0,
    counts: {},
    tags: [],
    skippedCanvases: [],
  };
}

function aggregateLanguageTagResult(tasks: BackgroundActionTask[]): TranslationLanguageTagActionResult {
  const result = createEmptyResult(tasks.length);

  for (const task of tasks) {
    const taskResult = task.result as CanvasLanguageTagTaskResult | undefined;
    if (taskResult?.type === "tagged") {
      result.tags.push(taskResult.tag);
      result.counts[taskResult.tag.language] = (result.counts[taskResult.tag.language] || 0) + 1;
      continue;
    }

    if (taskResult?.type === "skipped") {
      result.skippedCanvases.push(taskResult.skip);
      continue;
    }

    if (task.status === "error") {
      result.skippedCanvases.push({
        canvasId: task.target?.id || task.id,
        canvasLabel: task.label || task.target?.id || task.id,
        reason: task.error?.message || "Language tagging failed",
      });
    }
  }

  result.tagged = result.tags.length;
  result.skipped = result.skippedCanvases.length;
  return result;
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

function getLanguageTagColours(language: string) {
  const index = Math.abs(hashString(language)) % LANGUAGE_TAG_PALETTE.length;
  return LANGUAGE_TAG_PALETTE[index] || LANGUAGE_TAG_PALETTE[0]!;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new Error("Language tagging cancelled.");
  }
}
