import type {
  BackgroundActionDefinition,
  BackgroundActionPlan,
  BackgroundActionRunContext,
  BackgroundActionTarget,
} from "@manifest-editor/shell";
import {
  applyCanvasLabelGeneratorPluginSettings,
  createCanvasLabelPreview,
  getDefaultRunOptions,
  getFilenameCandidateFromSource,
  getLabelFingerprint,
  getLabelText,
  getLanguageValue,
  normaliseRunOptions,
  setLabelLanguageValue,
  type CanvasLabelGeneratorPluginSettings,
  type CanvasLabelGeneratorRunOptions,
  type CanvasLabelPreview,
  type CanvasLabelPreviewInput,
  type CanvasLabelPreviewItem,
} from "./generator";
import {
  renderCanvasLabelGeneratorConfigModal,
  requestCanvasLabelGeneratorConfig,
} from "./config-modal";
import {
  openCanvasLabelGeneratorResults,
  renderCanvasLabelGeneratorResults,
} from "./results";

export const CANVAS_LABEL_GENERATOR_PLUGIN_ID = "@manifest-editor/canvas-label-generator";
export const CANVAS_LABEL_GENERATOR_ACTION_ID = "@manifest-editor/canvas-label-generator/generate-labels";

export type CanvasLabelGeneratorAppliedChange = {
  canvasId: string;
  previousLabel: string;
  generatedLabel: string;
};

export type CanvasLabelGeneratorSkippedCanvas = {
  canvasId: string;
  previousLabel: string;
  generatedLabel?: string;
  reason: string;
};

export type CanvasLabelGeneratorActionResult = {
  total: number;
  previewedChanges: number;
  applied: number;
  unchanged: number;
  skipped: number;
  stale: number;
  warnings: number;
  changes: CanvasLabelGeneratorAppliedChange[];
  skippedCanvases: CanvasLabelGeneratorSkippedCanvas[];
  warningCanvases: Array<{ canvasId: string; warnings: string[] }>;
};

export type CanvasLabelGeneratorPlanData = {
  options: CanvasLabelGeneratorRunOptions;
  preview: CanvasLabelPreview;
};

export type CanvasLabelGeneratorActionDependencies = {
  requestConfig?: (
    ctx: BackgroundActionRunContext,
    inputs: CanvasLabelPreviewInput[],
    defaults: CanvasLabelGeneratorRunOptions,
  ) => Promise<CanvasLabelGeneratorRunOptions | false>;
};

type CanvasRangeContext = {
  rangeId: string;
  rangeLabel: string;
  rangeIndex: number;
  depth: number;
  order: number;
};

export function createCanvasLabelGeneratorBackgroundAction(
  dependencies: CanvasLabelGeneratorActionDependencies = {},
): BackgroundActionDefinition {
  const requestConfig = dependencies.requestConfig || defaultRequestConfig;

  return {
    id: CANVAS_LABEL_GENERATOR_ACTION_ID,
    label: "Generate canvas labels",
    summary: "Generate or normalise canvas labels from a pattern",
    section: "Labels",
    order: 10,
    resourceTypes: ["Manifest"],
    render: (ctx) => (
      <>
        {renderCanvasLabelGeneratorConfigModal(ctx.definition.id)}
        {renderCanvasLabelGeneratorResults(ctx.definition.id)}
      </>
    ),
    onResults: (ctx) => openCanvasLabelGeneratorResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => {
      const manifest = ctx.vault.get(ctx.target as any) as any;
      return !!manifest?.items?.length;
    },
    prepare: async (ctx) => {
      const inputs = createCanvasLabelPreviewInputs(ctx);
      const defaults = applyCanvasLabelGeneratorPluginSettings(
        getDefaultRunOptions(),
        ctx.plugins.getSettings<CanvasLabelGeneratorPluginSettings>(CANVAS_LABEL_GENERATOR_PLUGIN_ID),
      );
      const options = await requestConfig(ctx, inputs, defaults);

      if (options === false) {
        return false;
      }

      return createCanvasLabelGeneratorPlan(inputs, options);
    },
    run: async (ctx) => {
      const planData = getPlanData(ctx.plan);
      const result = createInitialResult(planData?.preview);
      const options = planData?.options || getDefaultRunOptions();

      ctx.setActionLabel("Generating canvas labels");

      if (!planData || !ctx.plan?.tasks.length) {
        ctx.setActionStatus("running", "No label changes to apply");
        ctx.setActionProgress({ current: 0, total: 0, label: "No changes" });
        return result;
      }

      ctx.canvasProgress.setStatuses(
        ctx.plan.tasks
          .map((task) => task.target)
          .filter((target): target is BackgroundActionTarget => !!target && target.type === "Canvas"),
        "queued",
      );

      await ctx.tasks.runEach(
        async (task) => {
          const preview = task.input as CanvasLabelPreviewItem | undefined;
          if (!preview) {
            return {
              taskStatus: "skipped",
              result: { reason: "Missing preview data" },
              statusText: "Skipped",
            };
          }

          const canvas = ctx.vault.get({ id: preview.canvasId, type: "Canvas" } as any) as any;
          if (!canvas) {
            result.skippedCanvases.push({
              canvasId: preview.canvasId,
              previousLabel: preview.previousLabel,
              generatedLabel: preview.generatedLabel,
              reason: "Canvas no longer exists",
            });
            return {
              taskStatus: "skipped",
              result: { reason: "Canvas no longer exists" },
              statusText: "Canvas missing",
            };
          }

          if (getLabelFingerprint(canvas.label) !== preview.labelFingerprint) {
            result.stale += 1;
            result.skippedCanvases.push({
              canvasId: preview.canvasId,
              previousLabel: getLabelText(canvas.label, options.language),
              generatedLabel: preview.generatedLabel,
              reason: "Canvas label changed after preview",
            });
            return {
              taskStatus: "skipped",
              result: { reason: "Canvas label changed after preview" },
              statusText: "Stale preview",
            };
          }

          const currentLanguageValue = getLanguageValue(canvas.label, options.language);
          if (currentLanguageValue === preview.generatedLabel) {
            result.unchanged += 1;
            result.skippedCanvases.push({
              canvasId: preview.canvasId,
              previousLabel: preview.previousLabel,
              generatedLabel: preview.generatedLabel,
              reason: "Label is already up to date",
            });
            return {
              taskStatus: "skipped",
              result: { reason: "Label is already up to date" },
              statusText: "Unchanged",
            };
          }

          const nextLabel = setLabelLanguageValue(canvas.label, options.language, preview.generatedLabel);
          ctx.vault.modifyEntityField({ id: preview.canvasId, type: "Canvas" } as any, "label", nextLabel);
          result.applied += 1;
          result.changes.push({
            canvasId: preview.canvasId,
            previousLabel: preview.previousLabel,
            generatedLabel: preview.generatedLabel,
          });
          ctx.appendActionLog("Updated canvas label", "info", {
            canvasId: preview.canvasId,
            label: preview.generatedLabel,
          });

          return {
            result: {
              previousLabel: preview.previousLabel,
              generatedLabel: preview.generatedLabel,
            },
            statusText: "Updated",
          };
        },
        {
          progressLabel: (_task, index, total) => `Applying labels ${index + 1}/${total}`,
        },
      );

      result.skipped = result.skippedCanvases.length;
      ctx.setActionStatus("running", `Updated ${result.applied}/${result.previewedChanges} labels`);
      ctx.setActionProgress({
        current: result.previewedChanges,
        total: result.previewedChanges,
        label: "Labels complete",
      });

      return result;
    },
  };
}

export function createCanvasLabelGeneratorPlan(
  inputs: CanvasLabelPreviewInput[],
  rawOptions: Partial<CanvasLabelGeneratorRunOptions>,
): BackgroundActionPlan {
  const options = normaliseRunOptions(rawOptions);
  const preview = createCanvasLabelPreview(inputs, options);

  return {
    version: 1,
    data: { options, preview } satisfies CanvasLabelGeneratorPlanData,
    tasks: preview.items
      .filter((item) => item.status === "changed")
      .map((item) => ({
        id: item.canvasId,
        label: item.generatedLabel,
        target: {
          id: item.canvasId,
          type: "Canvas",
          label: item.previousLabel || item.generatedLabel || "Canvas",
          scope: "canvas",
        },
        input: item,
        status: "queued",
      })),
  };
}

export function createCanvasLabelPreviewInputs(ctx: BackgroundActionRunContext): CanvasLabelPreviewInput[] {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  const canvases = getManifestCanvases(ctx);
  const rangeContexts = getCanvasRangeContexts(ctx, manifest);

  return canvases.map((canvas, index) => {
    const matches = rangeContexts.get(canvas.id) || [];
    const selectedRange = chooseRangeContext(matches);
    const paintingSource = getFirstPaintingBodySource(ctx, canvas);
    const warnings = [];

    if (!paintingSource) {
      warnings.push("No painting body source found; using canvas id");
    }

    if (matches.length > 1) {
      warnings.push("Canvas appears in multiple ranges; using the deepest range");
    }

    return {
      canvasId: canvas.id,
      canvasIndex: index,
      currentLabel: canvas.label,
      currentLabelText: getLabelText(canvas.label),
      currentLanguageValue: getLanguageValue(canvas.label, "en"),
      labelFingerprint: getLabelFingerprint(canvas.label),
      filename: getFilenameCandidateFromSource(paintingSource, canvas.id),
      filenameSource: paintingSource ? "painting" : "canvas-id",
      rangeLabel: selectedRange?.rangeLabel || "",
      rangeIndex: selectedRange?.rangeIndex || index + 1,
      warnings,
    };
  });
}

async function defaultRequestConfig(
  ctx: BackgroundActionRunContext,
  inputs: CanvasLabelPreviewInput[],
  defaults: CanvasLabelGeneratorRunOptions,
) {
  return requestCanvasLabelGeneratorConfig({
    actionId: ctx.definition.id,
    instanceKey: ctx.instanceKey,
    totalCanvases: inputs.length,
    inputs,
    defaults,
    signal: ctx.signal,
  });
}

function getPlanData(plan: BackgroundActionPlan | undefined): CanvasLabelGeneratorPlanData | null {
  const data = plan?.data as CanvasLabelGeneratorPlanData | undefined;
  if (!data?.preview || !data.options) {
    return null;
  }

  return data;
}

function createInitialResult(preview: CanvasLabelPreview | undefined): CanvasLabelGeneratorActionResult {
  return {
    total: preview?.total || 0,
    previewedChanges: preview?.changed || 0,
    applied: 0,
    unchanged: preview?.unchanged || 0,
    skipped: preview?.skipped || 0,
    stale: 0,
    warnings: preview?.warnings || 0,
    changes: [],
    skippedCanvases: (preview?.items || [])
      .filter((item) => item.status !== "changed")
      .map((item) => ({
        canvasId: item.canvasId,
        previousLabel: item.previousLabel,
        generatedLabel: item.generatedLabel,
        reason: item.skipReason || "Skipped",
      })),
    warningCanvases: (preview?.items || [])
      .filter((item) => item.warnings.length)
      .map((item) => ({ canvasId: item.canvasId, warnings: item.warnings })),
  };
}

function getManifestCanvases(ctx: BackgroundActionRunContext) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items ? getVaultItems(ctx, manifest.items).filter((item) => item?.type === "Canvas") : [];
}

function getCanvasRangeContexts(ctx: BackgroundActionRunContext, manifest: any) {
  const contexts = new Map<string, CanvasRangeContext[]>();
  const ranges = manifest?.structures ? getVaultItems(ctx, manifest.structures).filter(Boolean) : [];
  let order = 0;

  const walkRange = (range: any, depth: number) => {
    if (!range || range.type !== "Range") {
      return;
    }

    let rangeIndex = 0;
    const rangeLabel = getLabelText(range.label);

    for (const item of getRangeItems(ctx, range)) {
      const ref = getRangeItemReference(item);

      if (ref?.type === "Canvas") {
        rangeIndex += 1;
        const matches = contexts.get(ref.id) || [];
        matches.push({
          rangeId: range.id,
          rangeLabel,
          rangeIndex,
          depth,
          order: order++,
        });
        contexts.set(ref.id, matches);
        continue;
      }

      if (ref?.type === "Range") {
        const childRange = ctx.vault.get({ id: ref.id, type: "Range" } as any) || item;
        walkRange(childRange, depth + 1);
      }
    }
  };

  for (const range of ranges) {
    walkRange(range, 1);
  }

  return contexts;
}

function chooseRangeContext(matches: CanvasRangeContext[]) {
  if (!matches.length) {
    return null;
  }

  return [...matches].sort((a, b) => b.depth - a.depth || a.order - b.order)[0] || null;
}

function getRangeItems(ctx: BackgroundActionRunContext, range: any) {
  return range?.items ? getVaultItems(ctx, range.items) : [];
}

function getRangeItemReference(item: any): { id: string; type: "Canvas" | "Range" } | null {
  if (!item) {
    return null;
  }

  if (item.type === "Canvas" || item.type === "Range") {
    return { id: item.id, type: item.type };
  }

  if (item.type === "SpecificResource") {
    const source = item.source;
    if (typeof source === "string") {
      return { id: source.split("#")[0], type: "Canvas" };
    }
    if (source?.type === "Canvas" && source.id) {
      return { id: source.id, type: "Canvas" };
    }
  }

  return null;
}

function getFirstPaintingBodySource(ctx: BackgroundActionRunContext, canvas: any): string | undefined {
  for (const page of getVaultItems(ctx, canvas?.items)) {
    for (const annotation of getVaultItems(ctx, page?.items)) {
      if (!hasMotivation(annotation, "painting")) {
        continue;
      }

      for (const body of normaliseArray(annotation?.body)) {
        const fullBody = ctx.vault.get(body as any) || body;
        const source = getBodySource(fullBody);
        if (source) {
          return source;
        }
      }
    }
  }

  return undefined;
}

function getBodySource(body: any): string | undefined {
  if (!body) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  if (typeof body.id === "string") {
    return body.id;
  }

  if (typeof body.source === "string") {
    return body.source;
  }

  const services = normaliseArray(body.service);
  const service = services.find((item) => item?.id || item?.["@id"]);
  return service?.id || service?.["@id"];
}

function hasMotivation(annotation: any, motivation: string) {
  return normaliseArray(annotation?.motivation).includes(motivation);
}

function normaliseArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getVaultItems(ctx: BackgroundActionRunContext, items: any) {
  if (!Array.isArray(items)) {
    return [];
  }

  const resolved = ctx.vault.get(items as any);
  if (Array.isArray(resolved)) {
    return resolved.map((item, index) => item || items[index]).filter(Boolean);
  }

  return items.map((item) => ctx.vault.get(item as any) || item).filter(Boolean);
}
