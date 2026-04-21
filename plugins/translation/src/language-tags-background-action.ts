import { getAvailableLanguagesFromResource } from "@iiif/helpers/i18n";
import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTask,
  ManifestEditorTag,
} from "@manifest-editor/shell";
import { TRANSLATION_LANGUAGE_TAG_ACTION_ID } from "./constants";
import { resolveSourceLanguage } from "./options";

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

type DetectedCanvasLanguage = {
  language: string;
  count: number;
  iiifLanguages: string[];
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

            const detected = getCanvasAvailableLanguages(ctx, canvas);
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
    label: language,
    backgroundColor: colours.backgroundColor,
    textColor: colours.textColor,
  };
}

export function selectPrimaryDetectedLanguage(languages: DetectedCanvasLanguage[]): DetectedCanvasLanguage | null {
  return languages[0] || null;
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

function getCanvasAvailableLanguages(ctx: BackgroundActionRunContext, canvas: any): DetectedCanvasLanguage[] {
  const resource = getCanvasPresentationResource(ctx, canvas) || canvas;
  const languages = getAvailableCanvasLanguages(resource);
  const detected: DetectedCanvasLanguage[] = [];
  const seen = new Set<string>();

  for (const language of languages) {
    const rawLanguage = typeof language === "string" ? language : "";
    const resolved = resolveSourceLanguage(rawLanguage);
    if (!resolved || seen.has(resolved)) {
      continue;
    }

    seen.add(resolved);
    detected.push({
      language: resolved,
      count: 1,
      iiifLanguages: [rawLanguage],
    });
  }

  return sortDetectedCanvasLanguages(detected, resource);
}

function getAvailableCanvasLanguages(resource: any) {
  const languages = new Set<string>();

  for (const language of getAvailableLanguagesFromResource(resource as any)) {
    if (typeof language === "string") {
      languages.add(language);
    }
  }

  addLanguageMapLanguageCodes(languages, resource?.label);
  addLanguageMapLanguageCodes(languages, resource?.summary);

  const requiredStatement = resource?.requiredStatement;
  if (requiredStatement && !Array.isArray(requiredStatement)) {
    addLanguageMapLanguageCodes(languages, requiredStatement.label);
    addLanguageMapLanguageCodes(languages, requiredStatement.value);
  }

  if (Array.isArray(resource?.metadata)) {
    for (const item of resource.metadata) {
      addLanguageMapLanguageCodes(languages, item?.label);
      addLanguageMapLanguageCodes(languages, item?.value);
    }
  }

  return Array.from(languages);
}

function getCanvasPresentationResource(ctx: BackgroundActionRunContext, canvas: any) {
  if (!canvas?.id) {
    return null;
  }

  try {
    return ctx.vault.toPresentation3({ id: canvas.id, type: "Canvas" } as any);
  } catch {
    return null;
  }
}

function sortDetectedCanvasLanguages(detected: DetectedCanvasLanguage[], resource: any) {
  if (detected.length < 2 || hasNestedCanvasContent(resource)) {
    return detected;
  }

  const scores = scoreOwnLanguageMaps(resource);

  const scored = detected.map((language) => ({
    ...language,
    count: scores.get(language.language) || language.count,
  }));

  return scored.sort((a, b) => {
    const score = (scores.get(b.language) || 0) - (scores.get(a.language) || 0);
    if (score !== 0) {
      return score;
    }

    return (
      detected.findIndex((language) => language.language === a.language) -
      detected.findIndex((language) => language.language === b.language)
    );
  });
}

function hasNestedCanvasContent(resource: any) {
  return !!(
    (Array.isArray(resource?.items) && resource.items.length) ||
    (Array.isArray(resource?.annotations) && resource.annotations.length)
  );
}

function scoreOwnLanguageMaps(resource: any) {
  const scores = new Map<string, number>();

  addLanguageMapScores(scores, resource?.label);
  addLanguageMapScores(scores, resource?.summary);

  const requiredStatement = resource?.requiredStatement;
  if (requiredStatement && !Array.isArray(requiredStatement)) {
    addLanguageMapScores(scores, requiredStatement.label);
    addLanguageMapScores(scores, requiredStatement.value);
  }

  if (Array.isArray(resource?.metadata)) {
    for (const item of resource.metadata) {
      addLanguageMapScores(scores, item?.label);
      addLanguageMapScores(scores, item?.value);
    }
  }

  return scores;
}

function addLanguageMapScores(scores: Map<string, number>, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return;
  }

  for (const [language, values] of Object.entries(value)) {
    const resolved = resolveSourceLanguage(language);
    if (!resolved || !Array.isArray(values)) {
      continue;
    }

    const count = values.filter((item) => typeof item === "string" && item.trim()).length;
    if (count) {
      scores.set(resolved, (scores.get(resolved) || 0) + count);
    }
  }
}

function addLanguageMapLanguageCodes(languages: Set<string>, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return;
  }

  for (const [language, values] of Object.entries(value)) {
    if (Array.isArray(values) && values.some((item) => typeof item === "string" && item.trim())) {
      languages.add(language);
    }
  }
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
