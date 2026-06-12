import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTask,
  BackgroundActionTarget,
} from "@manifest-editor/shell";
import {
  collectDetectedManifestLanguages,
  collectTranslationLanguageProgress,
  collectTranslationTargets,
} from "./collection";
import {
  renderTranslationConfigModal,
  requestTranslationConfig,
} from "./config-modal";
import { TRANSLATION_ACTION_ID, TRANSLATION_PLUGIN_ID } from "./constants";
import { translatePreservingSimpleHtml } from "./html";
import {
  getDefaultRunOptions,
  getModelSourceLanguage,
  getSupportedAvailableLanguages,
  normaliseRunOptions,
} from "./options";
import {
  createTranslationWorkerClient,
  type TranslationEvent,
  type TranslationWorkerClient,
} from "./runtime";
import { openTranslationResults, renderTranslationResults } from "./results";
import type {
  TranslationActionResult,
  TranslationPluginSettings,
  TranslationResourceRef,
  TranslationRunOptions,
  TranslationTarget,
  TranslationTaskResult,
} from "./types";
import {
  getWritableOccurrences,
  writeTranslationForOccurrence,
  type TranslationWriteContext,
} from "./writeback";

export type TranslationPlanData = {
  options: TranslationRunOptions;
  totalTargets: number;
};

export type TranslationActionDependencies = {
  createClient?: (settings?: TranslationPluginSettings) => TranslationWorkerClient;
  collectTargets?: typeof collectTranslationTargets;
  requestConfig?: (
    ctx: BackgroundActionRunContext,
    targets: TranslationTarget[],
    defaults: TranslationRunOptions,
  ) => Promise<TranslationRunOptions | false>;
  translateHtml?: typeof translatePreservingSimpleHtml;
};

const queuedOptions = new Map<string, TranslationRunOptions>();

export function queueTranslationRunOptions(
  instanceKey: string,
  options: Partial<TranslationRunOptions>,
) {
  queuedOptions.set(instanceKey, normaliseRunOptions(options));
}

export function createTranslationBackgroundAction(
  dependencies: TranslationActionDependencies = {},
): BackgroundActionDefinition {
  const createClient =
    dependencies.createClient ||
    ((settings?: TranslationPluginSettings) =>
      createTranslationWorkerClient({
        workerUrl:
          typeof settings?.workerUrl === "string" && settings.workerUrl.trim()
            ? settings.workerUrl
            : undefined,
      }));
  const collectTargets =
    dependencies.collectTargets || collectTranslationTargets;
  const requestConfig = dependencies.requestConfig || defaultRequestConfig;
  const translateHtml =
    dependencies.translateHtml || translatePreservingSimpleHtml;
  let retainedClient: TranslationWorkerClient | null = null;

  const getClient = (settings?: TranslationPluginSettings) => {
    retainedClient ||= createClient(settings);
    return retainedClient;
  };

  const terminateClient = (
    client: TranslationWorkerClient | null = retainedClient,
  ) => {
    if (!client) {
      return;
    }

    client.terminate();
    if (retainedClient === client) {
      retainedClient = null;
    }
  };

  return {
    id: TRANSLATION_ACTION_ID,
    label: "Run translation",
    summary: "Translate missing manifest strings with M2M100",
    section: "Translations",
    order: 30,
    resourceTypes: ["Manifest"],
    resumable: true,
    render: (ctx) => (
      <>
        {renderTranslationConfigModal(ctx.definition.id)}
        {renderTranslationResults(ctx.definition.id)}
      </>
    ),
    onResults: (ctx) =>
      openTranslationResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return manifest?.type === "Manifest";
    },
    prepare: async (ctx) => {
      const settings = ctx.plugins.getSettings<TranslationPluginSettings>(
        TRANSLATION_PLUGIN_ID,
      );
      const defaults = getDefaultRunOptions(ctx.config, settings);
      const previewTargets = collectTargets(ctx.vault, getTranslationScope(ctx, defaults), defaults);
      const options =
        queuedOptions.get(ctx.instanceKey) ||
        (await requestConfig(ctx, previewTargets, defaults));
      queuedOptions.delete(ctx.instanceKey);

      if (options === false) {
        return false;
      }

      const normalisedOptions = normaliseRunOptions(options);
      const targets = collectTargets(ctx.vault, getTranslationScope(ctx, normalisedOptions), normalisedOptions);
      return createTranslationPlan(targets, normalisedOptions);
    },
    run: async (ctx) => {
      const planData = getPlanData(ctx.plan);
      const options = normaliseRunOptions(
        planData?.options || getDefaultRunOptions(ctx.config),
      );
      const tasks = ctx.tasks.getAll();
      const pendingTasks = ctx.tasks.getPending();
      const writeContext: TranslationWriteContext = { vault: ctx.vault };

      ctx.setActionLabel("Running translation");

      if (!tasks.length) {
        ctx.setActionStatus("running", "No translatable strings found");
        ctx.setActionProgress({ current: 0, total: 0, label: "No strings" });
        return createEmptyResult(0);
      }

      if (pendingTasks.length) {
        const settings = ctx.plugins.getSettings<TranslationPluginSettings>(
          TRANSLATION_PLUGIN_ID,
        );
        const client = getClient(settings);
        const unsubscribe = client.onEvent((event) =>
          handleTranslationEvent(ctx, event),
        );
        const abort = () => terminateClient(client);

        ctx.signal.addEventListener("abort", abort, { once: true });

        try {
          throwIfAborted(ctx.signal);
          ctx.setActionStatus("running", "Loading translation model");
          await client.preload({ runtime: options.runtime });

          await ctx.tasks.runEach(
            async (task, { index, total }) => {
              throwIfAborted(ctx.signal);
              const target = task.input as TranslationTarget | undefined;
              if (!target) {
                return skippedTask(
                  "Missing translation target",
                  task.id,
                  "",
                  0,
                  0,
                );
              }

              ctx.appendActionLog(`Translating ${index + 1}/${total}`, "info", {
                key: target.key,
                sourceLanguage: target.sourceLanguage,
                targetLanguage: target.targetLanguage,
              });

              const writable = getWritableOccurrences(writeContext, target);
              if (!writable.writable.length) {
                return skippedTask(
                  getSkipReason(
                    writable.existing.length,
                    writable.stale.length,
                  ),
                  target.key,
                  target.sourceText,
                  writable.existing.length,
                  writable.stale.length,
                );
              }

              let translationText: string | null;
              try {
                translationText = await translateTargetText(
                  client,
                  target,
                  options,
                  translateHtml,
                );
              } catch (error) {
                if (isFatalTranslationError(error)) {
                  terminateClient(client);
                }
                throw error;
              }

              if (!translationText) {
                return skippedTask(
                  "HTML could not be parsed for safe translation",
                  target.key,
                  target.sourceText,
                  writable.existing.length,
                  writable.stale.length,
                );
              }

              let applied = 0;
              let existing = writable.existing.length;
              let stale = writable.stale.length;

              for (const occurrence of writable.writable) {
                const latest = getWritableOccurrences(writeContext, {
                  ...target,
                  occurrences: [occurrence],
                });
                if (latest.stale.length) {
                  stale += latest.stale.length;
                  continue;
                }
                if (latest.existing.length) {
                  existing += latest.existing.length;
                  continue;
                }

                if (
                  writeTranslationForOccurrence(
                    writeContext,
                    occurrence,
                    translationText,
                  )
                ) {
                  applied += 1;
                }
              }

              if (!applied) {
                return skippedTask(
                  "No missing occurrences remained",
                  target.key,
                  target.sourceText,
                  existing,
                  stale,
                );
              }

              return {
                taskStatus: "complete",
                statusText: `Translated ${applied} occurrence${applied === 1 ? "" : "s"}`,
                result: {
                  type: "translated",
                  key: target.key,
                  sourceText: target.sourceText,
                  translationText,
                  applied,
                  existing,
                  stale,
                } satisfies TranslationTaskResult,
              };
            },
            {
              progressLabel: (_task, index, total) =>
                `Translating strings ${index + 1}/${total}`,
            },
          );
        } catch (error) {
          terminateClient(client);
          throw error;
        } finally {
          ctx.signal.removeEventListener("abort", abort);
          unsubscribe();
        }
      }

      const result = aggregateTranslationResult(
        planData?.totalTargets || tasks.length,
        ctx.tasks.getAll(),
      );
      ctx.setActionStatus("running", `Applied ${result.applied} translations`);
      ctx.setActionProgress({
        current: result.total,
        total: result.total,
        label: "Translations complete",
      });

      return result;
    },
  };
}

export function createTranslationPlan(
  targets: TranslationTarget[],
  options: TranslationRunOptions,
): BackgroundActionPlan {
  return {
    version: 1,
    data: {
      options: normaliseRunOptions(options),
      totalTargets: targets.length,
    } satisfies TranslationPlanData,
    tasks: targets.map((target) => {
      const existingOccurrences = target.occurrences.filter(
        (occurrence) => occurrence.status === "existing",
      ).length;
      const skipped = target.status !== "missing";

      return {
        id: target.key,
        label: getTaskLabel(target),
        target: toBackgroundActionTarget(target),
        input: target,
        status: skipped ? "skipped" : "queued",
        statusText: skipped ? "Target language already exists" : undefined,
        result: skipped
          ? ({
              type: "skipped",
              key: target.key,
              sourceText: target.sourceText,
              reason: "Target language already exists",
              existing: existingOccurrences,
              stale: 0,
            } satisfies TranslationTaskResult)
          : undefined,
        completedAt: skipped ? Date.now() : undefined,
      };
    }),
  };
}

function getTranslationScope(ctx: BackgroundActionRunContext, options: TranslationRunOptions): TranslationResourceRef {
  if (options.currentResourceOnly && ctx.currentCanvas) {
    return {
      id: ctx.currentCanvas.id,
      type: ctx.currentCanvas.type,
      label: ctx.currentCanvas.label,
    };
  }

  return ctx.target;
}

async function defaultRequestConfig(
  ctx: BackgroundActionRunContext,
  targets: TranslationTarget[],
  defaults: TranslationRunOptions,
) {
  const detectedLanguages = collectDetectedManifestLanguages(
    ctx.vault,
    ctx.target,
  );
  const detectedLanguageCodes = detectedLanguages.map(
    (language) => language.language,
  );

  return requestTranslationConfig({
    actionId: ctx.definition.id,
    instanceKey: ctx.instanceKey,
    defaults,
    targets,
    availableLanguages: getSupportedAvailableLanguages(ctx.config),
    detectedLanguages,
    currentResource: ctx.currentCanvas
      ? {
          id: ctx.currentCanvas.id,
          type: ctx.currentCanvas.type,
          label: ctx.currentCanvas.label,
        }
      : undefined,
    getTargets: (options) =>
      collectTranslationTargets(
        ctx.vault,
        getTranslationScope(ctx, normaliseRunOptions(options)),
        normaliseRunOptions(options),
      ),
    getTargetLanguageProgress: (options) =>
      collectTranslationLanguageProgress(
        ctx.vault,
        getTranslationScope(ctx, normaliseRunOptions(options)),
        normaliseRunOptions(options),
        detectedLanguageCodes,
      ),
    signal: ctx.signal,
  });
}

function getPlanData(
  plan: BackgroundActionPlan | undefined,
): TranslationPlanData | null {
  const data = plan?.data as TranslationPlanData | undefined;
  if (!data?.options) {
    return null;
  }

  return data;
}

async function translateTargetText(
  client: TranslationWorkerClient,
  target: TranslationTarget,
  options: TranslationRunOptions,
  translateHtml: typeof translatePreservingSimpleHtml,
) {
  const translate = async (text: string) => {
    const result = await client.translate({
      text,
      sourceLanguage: getModelSourceLanguage(target.sourceLanguage, options),
      targetLanguage: target.targetLanguage,
      runtime: options.runtime,
    });
    return result.text;
  };

  if (target.valueFormat === "html") {
    return translateHtml(target.sourceText, translate);
  }

  return translate(target.sourceText);
}

function skippedTask(
  reason: string,
  key: string,
  sourceText: string,
  existing: number,
  stale: number,
) {
  return {
    taskStatus: "skipped" as const,
    statusText: reason,
    result: {
      type: "skipped",
      key,
      sourceText,
      reason,
      existing,
      stale,
    } satisfies TranslationTaskResult,
  };
}

function aggregateTranslationResult(
  total: number,
  tasks: BackgroundActionTask[],
): TranslationActionResult {
  const result = createEmptyResult(total);

  for (const task of tasks) {
    const taskResult = task.result as TranslationTaskResult | undefined;
    if (taskResult?.type === "translated") {
      result.translated += 1;
      result.applied += taskResult.applied;
      result.existing += taskResult.existing;
      result.stale += taskResult.stale;
      result.translations.push({
        key: taskResult.key,
        sourceText: taskResult.sourceText,
        translationText: taskResult.translationText,
        applied: taskResult.applied,
      });
      continue;
    }

    if (taskResult?.type === "skipped") {
      result.skipped += 1;
      result.existing += taskResult.existing || 0;
      result.stale += taskResult.stale || 0;
      result.skippedTargets.push({
        key: taskResult.key,
        sourceText: taskResult.sourceText,
        reason: taskResult.reason,
      });
      continue;
    }

    if (task.status === "error") {
      result.errors += 1;
      result.skippedTargets.push({
        key: task.id,
        sourceText: task.label,
        reason: task.error?.message || "Translation failed",
      });
    }
  }

  return result;
}

function createEmptyResult(total: number): TranslationActionResult {
  return {
    total,
    translated: 0,
    applied: 0,
    skipped: 0,
    existing: 0,
    stale: 0,
    errors: 0,
    translations: [],
    skippedTargets: [],
  };
}

function getSkipReason(existing: number, stale: number) {
  if (stale && existing) {
    return "Source changed or target translation already exists";
  }
  if (stale) {
    return "Source changed after the translation run was prepared";
  }
  if (existing) {
    return "Target language already exists";
  }
  return "No writable occurrences";
}

function handleTranslationEvent(
  ctx: BackgroundActionRunContext,
  event: TranslationEvent,
) {
  switch (event.type) {
    case "model-progress":
      ctx.setActionStatus(
        "running",
        `Loading model ${Math.round(event.progress)}% (${formatBytes(event.loaded)} / ${formatBytes(event.total)})`,
      );
      break;
    case "model-ready":
      ctx.setActionStatus(
        "running",
        `Model ready (${event.runtime.toUpperCase()})`,
      );
      break;
    case "runtime-fallback":
      ctx.appendActionLog(
        "Falling back to WASM translation runtime",
        "warn",
        event,
      );
      ctx.setActionStatus("running", "WebGPU unavailable; using WASM");
      break;
    case "translation-start":
      ctx.setActionStatus(
        "running",
        `Translating ${event.sourceLanguage} to ${event.targetLanguage}`,
      );
      break;
    case "translation-complete":
      ctx.setActionStatus(
        "running",
        `Translated ${event.result.text.length} characters`,
      );
      break;
    case "error":
      if (!ctx.signal.aborted) {
        ctx.setActionStatus("running", event.message);
      }
      break;
  }
}

function toBackgroundActionTarget(
  target: TranslationTarget,
): BackgroundActionTarget {
  const occurrence = target.occurrences[0];
  const resource = occurrence?.resource;
  const label = resource?.label || target.sourceText || "Translation string";

  return {
    id: resource?.id || target.key,
    type: resource?.type || "Manifest",
    label,
    scope: resource?.type === "Canvas" ? "canvas" : "root",
  };
}

function getTaskLabel(target: TranslationTarget) {
  const text =
    target.normalisedSourceText || target.sourceText || "Translation string";
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new Error("Translation cancelled.");
  }
}

function isFatalTranslationError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "model_load_failed" || error.name === "worker_failed")
  );
}

function formatBytes(value: number) {
  if (!value) {
    return "0 MB";
  }

  return `${Math.round(value / 1024 / 1024)} MB`;
}
