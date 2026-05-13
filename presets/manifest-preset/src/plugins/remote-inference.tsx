import { addReference, batchActions, importEntities, removeReference } from "@iiif/helpers/vault/actions";
import { Modal } from "@manifest-editor/components";
import {
  type BackgroundActionDefinition,
  type BackgroundActionPlan,
  type BackgroundActionRunContext,
  type BackgroundActionTask,
  FLAG_TAG,
  type ManifestEditorTag,
  type PluginMetadata,
} from "@manifest-editor/shell";
import { useEffect, useMemo, useState } from "react";

// ─── Plugin metadata ──────────────────────────────────────────────────────────

export default {
  id: "@manifest-editor/remote-inference",
  label: "Remote Inference",
  description: "Run remote OCR/HTR inference jobs against a configurable server",
  author: "Digirati",
  official: true,
  defaultEnabled: true,
  tags: ["ocr"],
  supports: {
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

// ─── Constants ────────────────────────────────────────────────────────────────

export const REMOTE_INFERENCE_ACTION_ID = "@manifest-editor/remote-inference/action";
const REMOTE_INFERENCE_ID_SEGMENT = "/remote-inference/";
const SERVER_URL_STORAGE_KEY = "@manifest-editor/remote-inference/serverUrl";
const DEFAULT_SERVER_URL = "http://localhost:8000";

// ─── Tag helpers (copied from docling tags.ts) ────────────────────────────────

type RemoteInferenceTagOption = ManifestEditorTag & {
  key: string;
  canvasCount: number;
  annotatedCanvasCount: number;
};

function getTagKey(tag: Pick<ManifestEditorTag, "type" | "id">) {
  return `${tag.type}:${tag.id}`;
}

function parseTagKey(key: string): { type: string; id: string } | null {
  const separator = key.indexOf(":");
  if (separator === -1) return null;
  return { type: key.slice(0, separator), id: key.slice(separator + 1) };
}

function getCanvasTagOptions(ctx: BackgroundActionRunContext, canvases: any[]): RemoteInferenceTagOption[] {
  const tags = new Map<string, RemoteInferenceTagOption>();

  tags.set(getTagKey(FLAG_TAG), {
    ...FLAG_TAG,
    key: getTagKey(FLAG_TAG),
    canvasCount: 0,
    annotatedCanvasCount: 0,
  });

  for (const canvas of canvases) {
    if (!canvas?.id) continue;
    const hasAnnotations = canvasHasAnnotationPageAnnotations(ctx, canvas);

    for (const tag of ctx.tags.getTags({ id: canvas.id, type: "Canvas" })) {
      const key = getTagKey(tag);
      const existing = tags.get(key);
      if (existing) {
        existing.canvasCount += 1;
        if (hasAnnotations) existing.annotatedCanvasCount += 1;
      } else {
        tags.set(key, {
          ...tag,
          key,
          canvasCount: 1,
          annotatedCanvasCount: hasAnnotations ? 1 : 0,
        });
      }
    }
  }

  return Array.from(tags.values()).sort((a, b) => {
    if (a.type === FLAG_TAG.type && a.id === FLAG_TAG.id) return -1;
    if (b.type === FLAG_TAG.type && b.id === FLAG_TAG.id) return 1;
    return a.label.localeCompare(b.label) || a.type.localeCompare(b.type) || a.id.localeCompare(b.id);
  });
}

// ─── Run options ──────────────────────────────────────────────────────────────

type RemoteInferenceRunOptions = {
  serverUrl: string;
  scope: "all" | "tag";
  tagKey?: string;
  skipAnnotatedCanvases?: boolean;
};

function getDefaultRunOptions(): RemoteInferenceRunOptions {
  const storedUrl =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(SERVER_URL_STORAGE_KEY) ?? DEFAULT_SERVER_URL)
      : DEFAULT_SERVER_URL;
  return {
    serverUrl: storedUrl,
    scope: "all",
    skipAnnotatedCanvases: true,
  };
}

// ─── Result types ─────────────────────────────────────────────────────────────

type RemoteInferenceCanvasResult = {
  canvasId: string;
  annotations: number;
  durationMs: number;
};

type RemoteInferenceCanvasSkip = {
  canvasId: string;
  reason: string;
};

type RemoteInferenceActionResult = {
  total: number;
  selected: number;
  processed: number;
  annotations: number;
  skipped: number;
  canvases: RemoteInferenceCanvasResult[];
  skippedCanvases: RemoteInferenceCanvasSkip[];
};

type RemoteInferenceTaskResult =
  | { type: "processed"; canvas: RemoteInferenceCanvasResult }
  | { type: "skipped"; skip: RemoteInferenceCanvasSkip };

type RemoteInferencePlanData = {
  options: RemoteInferenceRunOptions;
  total: number;
};

// ─── Annotation helpers ───────────────────────────────────────────────────────

function canvasHasAnnotationPageAnnotations(ctx: BackgroundActionRunContext, canvas: any) {
  const pages: any[] = canvas?.annotations ? (ctx.vault.get(canvas.annotations) as any) || [] : [];
  for (const page of pages) {
    if (page?.items?.length) return true;
  }
  return false;
}

function trimTrailingSlash(id: string) {
  return id.endsWith("/") ? id.slice(0, -1) : id;
}

function isRemoteInferenceId(id: string | undefined) {
  return !!id && id.includes(REMOTE_INFERENCE_ID_SEGMENT);
}

function getDefaultAnnotationPage(ctx: BackgroundActionRunContext, canvas: any) {
  const firstPage = canvas?.annotations?.[0];
  return firstPage ? (ctx.vault.get(firstPage) as any) : null;
}

/**
 * Write annotation pages from a remote-inference API response canvas into the vault.
 * Returns the total number of annotations written.
 */
function writeRemoteInferenceAnnotations(
  ctx: BackgroundActionRunContext,
  canvasId: string,
  responseAnnotationPages: any[],
): number {
  const canvas = ctx.vault.get({ id: canvasId, type: "Canvas" } as any) as any;
  if (!canvas?.id) return 0;

  let totalWritten = 0;

  for (const responsePage of responseAnnotationPages) {
    if (!responsePage?.items?.length) continue;

    const pageId: string = responsePage.id || `${trimTrailingSlash(canvasId)}${REMOTE_INFERENCE_ID_SEGMENT}page`;
    const existingPage = getDefaultAnnotationPage(ctx, canvas);
    const previousItems: any[] = existingPage?.items || [];
    const previousRemoteItems = previousItems.filter((item: any) => isRemoteInferenceId(item?.id));

    const actions: any[] = [];

    // Create the annotation page in the vault if it doesn't yet exist
    if (!existingPage) {
      actions.push(
        importEntities({
          entities: {
            AnnotationPage: {
              [pageId]: {
                id: pageId,
                type: "AnnotationPage",
                label: { en: ["Remote inference annotations"] },
                items: [],
              },
            },
          },
        }),
      );
      actions.push(
        addReference({
          id: canvas.id,
          type: "Canvas",
          key: "annotations",
          reference: { id: pageId, type: "AnnotationPage" },
        }),
      );
    }

    // Remove old remote-inference annotations
    for (const item of previousRemoteItems) {
      actions.push(
        removeReference({
          id: pageId,
          type: "AnnotationPage",
          key: "items",
          reference: { id: item.id, type: "Annotation" },
        }),
      );
    }

    // Build new annotation entities
    const annotationEntities: Record<string, any> = {};
    const bodyEntities: Record<string, any> = {};

    for (let i = 0; i < responsePage.items.length; i++) {
      const item = responsePage.items[i];
      if (!item) continue;

      const annotationId: string =
        item.id && isRemoteInferenceId(item.id)
          ? item.id
          : `${trimTrailingSlash(canvasId)}${REMOTE_INFERENCE_ID_SEGMENT}${i + 1}/annotation`;

      const bodyId: string =
        item.body?.id || `${trimTrailingSlash(canvasId)}${REMOTE_INFERENCE_ID_SEGMENT}${i + 1}/body`;

      const body = item.body || {};
      bodyEntities[bodyId] = {
        id: bodyId,
        type: body.type || "TextualBody",
        format: body.format || "text/plain",
        value: body.value || "",
      };

      annotationEntities[annotationId] = {
        id: annotationId,
        type: "Annotation",
        motivation: item.motivation || "supplementing",
        body: [{ id: bodyId, type: "ContentResource" }],
        target: item.target || canvasId,
      };
    }

    if (Object.keys(annotationEntities).length) {
      actions.push(
        importEntities({
          entities: {
            Annotation: annotationEntities,
            ContentResource: bodyEntities,
          },
        }),
      );

      for (const annotationId of Object.keys(annotationEntities)) {
        actions.push(
          addReference({
            id: pageId,
            type: "AnnotationPage",
            key: "items",
            reference: { id: annotationId, type: "Annotation" },
          }),
        );
      }

      totalWritten += Object.keys(annotationEntities).length;
    }

    if (actions.length) {
      ctx.vault.dispatch(batchActions({ actions }));
    }
  }

  return totalWritten;
}

// ─── Config modal ─────────────────────────────────────────────────────────────

const CONFIG_EVENT = "@manifest-editor/remote-inference:config";

type RemoteInferenceConfigRequest = {
  actionId: string;
  instanceKey: string;
  totalCanvases: number;
  annotatedCanvases: number;
  tags: RemoteInferenceTagOption[];
  defaults: RemoteInferenceRunOptions;
  signal?: AbortSignal;
  resolve: (options: RemoteInferenceRunOptions | false) => void;
};

function requestRemoteInferenceConfig(
  request: Omit<RemoteInferenceConfigRequest, "resolve">,
): Promise<RemoteInferenceRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted) {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: RemoteInferenceRunOptions | false) => {
      if (settled) return;
      settled = true;
      request.signal?.removeEventListener("abort", handleAbort);
      resolve(options);
    };
    const handleAbort = () => settle(false);

    request.signal?.addEventListener("abort", handleAbort, { once: true });
    window.dispatchEvent(
      new CustomEvent<RemoteInferenceConfigRequest>(CONFIG_EVENT, {
        detail: { ...request, resolve: settle },
      }),
    );
  });
}

function RemoteInferenceConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] = useState<RemoteInferenceConfigRequest | null>(null);
  const [options, setOptions] = useState<RemoteInferenceRunOptions>(getDefaultRunOptions());

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<RemoteInferenceConfigRequest>).detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseDefaults(detail.defaults, detail.tags));
      }
    };
    window.addEventListener(CONFIG_EVENT, listener);
    return () => window.removeEventListener(CONFIG_EVENT, listener);
  }, [actionId]);

  useEffect(() => {
    if (!request?.signal) return;
    if (request.signal.aborted) {
      setRequest(null);
      return;
    }
    const handleAbort = () => setRequest(null);
    request.signal.addEventListener("abort", handleAbort, { once: true });
    return () => request.signal?.removeEventListener("abort", handleAbort);
  }, [request]);

  const selectedTag = useMemo(
    () => request?.tags.find((tag) => tag.key === options.tagKey),
    [request?.tags, options.tagKey],
  );
  const selectedCount = options.scope === "tag" ? selectedTag?.canvasCount || 0 : request?.totalCanvases || 0;
  const annotatedSelectedCount =
    options.scope === "tag" ? selectedTag?.annotatedCanvasCount || 0 : request?.annotatedCanvases || 0;
  const skippedByExistingAnnotations = options.skipAnnotatedCanvases !== false ? annotatedSelectedCount : 0;
  const runnableCount = Math.max(0, selectedCount - skippedByExistingAnnotations);

  if (!request) return null;

  const close = (value: RemoteInferenceRunOptions | false) => {
    if (value && typeof value !== "boolean") {
      try {
        localStorage.setItem(SERVER_URL_STORAGE_KEY, value.serverUrl);
      } catch {
        // ignore
      }
    }
    request.resolve(value);
    setRequest(null);
  };

  const tagOptions = request.tags;
  const tagSelectionDisabled = !tagOptions.length;

  return (
    <Modal
      title="Run Remote OCR Inference"
      onClose={() => close(false)}
      className="max-w-2xl"
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
            onClick={() => close(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded border border-me-primary-500 bg-me-primary-500 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={runnableCount === 0}
            onClick={() => close(options)}
          >
            Run OCR
          </button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <label className="grid gap-1">
          <span className="font-medium text-zinc-900">Server URL</span>
          <input
            type="text"
            className="rounded border border-zinc-300 p-2 text-sm"
            value={options.serverUrl}
            placeholder={DEFAULT_SERVER_URL}
            onChange={(event) => setOptions((current) => ({ ...current, serverUrl: event.target.value }))}
          />
          <span className="text-xs text-zinc-500">
            POST requests will be sent to <code>{options.serverUrl}/enrich-canvas</code>
          </span>
        </label>

        <fieldset className="grid gap-2">
          <legend className="font-medium text-zinc-900">Canvases</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={options.scope === "all"}
              onChange={() => setOptions((current) => ({ ...current, scope: "all" }))}
            />
            <span>All canvases ({request.totalCanvases})</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={options.scope === "tag"}
              disabled={tagSelectionDisabled}
              onChange={() =>
                setOptions((current) => ({
                  ...current,
                  scope: "tag",
                  tagKey: current.tagKey || tagOptions[0]?.key,
                }))
              }
            />
            <span>Only canvases with tag</span>
          </label>
          <select
            className="rounded border border-zinc-300 bg-white p-2 disabled:bg-zinc-100"
            disabled={options.scope !== "tag" || tagSelectionDisabled}
            value={options.tagKey || ""}
            onChange={(event) => setOptions((current) => ({ ...current, tagKey: event.target.value }))}
          >
            {tagOptions.map((tag) => (
              <option key={tag.key} value={tag.key}>
                {tag.label} ({tag.canvasCount})
              </option>
            ))}
          </select>
        </fieldset>

        <label className="flex items-start gap-2 rounded border border-zinc-200 bg-white p-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={options.skipAnnotatedCanvases !== false}
            onChange={(event) => setOptions((current) => ({ ...current, skipAnnotatedCanvases: event.target.checked }))}
          />
          <span className="grid gap-1">
            <span className="font-medium text-zinc-900">Skip canvases with existing annotations</span>
            <span className="text-xs text-zinc-500">
              Do not run inference on canvases where a canvas annotation page already contains an annotation.
            </span>
          </span>
        </label>

        <div className="rounded border border-zinc-200 bg-white p-3 text-zinc-600">
          {runnableCount} canvas{runnableCount === 1 ? "" : "es"} will run remote inference.
          {skippedByExistingAnnotations ? (
            <>
              {" "}
              {skippedByExistingAnnotations} canvas{skippedByExistingAnnotations === 1 ? "" : "es"} will be skipped
              because they already have annotations.
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function normaliseDefaults(
  defaults: RemoteInferenceRunOptions,
  tags: RemoteInferenceTagOption[],
): RemoteInferenceRunOptions {
  const fallbackTagKey = tags[0] ? getTagKey(tags[0]) : undefined;
  const hasSelectedTag = defaults.tagKey ? tags.some((tag) => tag.key === defaults.tagKey) : false;
  return {
    ...defaults,
    serverUrl: defaults.serverUrl || DEFAULT_SERVER_URL,
    scope: defaults.scope === "tag" && tags.length ? "tag" : "all",
    tagKey: hasSelectedTag ? defaults.tagKey : fallbackTagKey,
    skipAnnotatedCanvases: defaults.skipAnnotatedCanvases !== false,
  };
}

// ─── Results modal ────────────────────────────────────────────────────────────

const RESULTS_EVENT = "@manifest-editor/remote-inference:results";

type RemoteInferenceResultsEvent = {
  actionId: string;
  result?: RemoteInferenceActionResult;
};

function openRemoteInferenceResults(actionId: string, result: unknown) {
  window.dispatchEvent(
    new CustomEvent<RemoteInferenceResultsEvent>(RESULTS_EVENT, {
      detail: { actionId, result: result as RemoteInferenceActionResult | undefined },
    }),
  );
}

function RemoteInferenceResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<RemoteInferenceActionResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<RemoteInferenceResultsEvent>).detail;
      if (detail?.actionId === actionId && detail.result) {
        setActiveResult(detail.result);
      }
    };
    window.addEventListener(RESULTS_EVENT, listener);
    return () => window.removeEventListener(RESULTS_EVENT, listener);
  }, [actionId]);

  if (!activeResult) return null;

  return (
    <Modal title="Remote inference results" onClose={() => setActiveResult(null)} className="max-w-3xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <div className="grid grid-cols-4 gap-2">
          <ResultStat label="Selected" value={activeResult.selected} />
          <ResultStat label="Processed" value={activeResult.processed} />
          <ResultStat label="Annotations" value={activeResult.annotations} />
          <ResultStat label="Skipped" value={activeResult.skipped} />
        </div>
        {activeResult.skippedCanvases.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Skipped canvases</div>
            <div className="max-h-64 overflow-auto">
              {activeResult.skippedCanvases.map((item) => (
                <div key={item.canvasId} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                  <div className="truncate font-medium text-zinc-900">{item.canvasId}</div>
                  <div className="text-zinc-500">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xl font-semibold text-zinc-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}

// ─── Plan helpers ─────────────────────────────────────────────────────────────

function getManifestCanvases(ctx: BackgroundActionRunContext) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items ? ((ctx.vault.get(manifest.items) as any) || []).filter(Boolean) : [];
}

function selectCanvases(ctx: BackgroundActionRunContext, canvases: any[], options: RemoteInferenceRunOptions) {
  if (options.scope !== "tag" || !options.tagKey) return canvases;
  const selectedTag = parseTagKey(options.tagKey);
  if (!selectedTag) return [];
  return canvases.filter((canvas) =>
    ctx.tags.hasTag({ id: canvas.id, type: "Canvas" }, selectedTag.type, selectedTag.id),
  );
}

function getCanvasLabel(canvas: any): string {
  const label = canvas?.label;
  if (!label) return canvas?.id || "";
  if (typeof label === "string") return label;
  const firstLanguage = Object.keys(label)[0];
  const firstValue = firstLanguage ? label[firstLanguage]?.[0] : undefined;
  return firstValue || canvas?.id || "";
}

function createRemoteInferencePlan(
  total: number,
  selectedCanvases: any[],
  options: RemoteInferenceRunOptions,
  ctx?: BackgroundActionRunContext,
): BackgroundActionPlan {
  const manifest = ctx ? (ctx.vault.get(ctx.target as any) as any) : null;
  const manifestId: string = manifest?.id || "";

  return {
    version: 1,
    data: { options, total } satisfies RemoteInferencePlanData,
    tasks: selectedCanvases.map((canvas, index) => {
      const canvasId: string = canvas?.id || `canvas-${index + 1}`;
      const label = getCanvasLabel(canvas) || canvasId;
      const skipExistingAnnotations =
        options.skipAnnotatedCanvases !== false && ctx ? canvasHasAnnotationPageAnnotations(ctx, canvas) : false;
      const skip = skipExistingAnnotations
        ? ({ canvasId, reason: "Canvas already has annotations" } satisfies RemoteInferenceCanvasSkip)
        : null;

      return {
        id: `canvas:${canvasId}`,
        label,
        target: {
          id: canvasId,
          type: "Canvas" as const,
          label,
          scope: "canvas",
        },
        input: { canvasId, manifestId },
        status: skip ? ("skipped" as const) : ("queued" as const),
        statusText: skip ? "Skipped: canvas already has annotations" : undefined,
        result: skip ? ({ type: "skipped", skip } satisfies RemoteInferenceTaskResult) : undefined,
        completedAt: skip ? Date.now() : undefined,
      };
    }),
  };
}

function getPlanOptions(plan: BackgroundActionPlan): RemoteInferenceRunOptions | null {
  const data = plan.data as Partial<RemoteInferencePlanData> | undefined;
  return data?.options || null;
}

function getPlanTotal(plan: BackgroundActionPlan) {
  const data = plan.data as Partial<RemoteInferencePlanData> | undefined;
  return typeof data?.total === "number" ? data.total : plan.tasks.length;
}

function createEmptyResult(total: number, selected: number): RemoteInferenceActionResult {
  return { total, selected, processed: 0, annotations: 0, skipped: 0, canvases: [], skippedCanvases: [] };
}

function aggregateResult(total: number, tasks: BackgroundActionTask[]): RemoteInferenceActionResult {
  const result = createEmptyResult(total, tasks.length);

  for (const task of tasks) {
    const taskResult = task.result as RemoteInferenceTaskResult | undefined;
    if (taskResult?.type === "processed") {
      result.canvases.push(taskResult.canvas);
      continue;
    }
    if (taskResult?.type === "skipped") {
      result.skippedCanvases.push(taskResult.skip);
      continue;
    }
    if (task.status === "error" && task.error) {
      result.skippedCanvases.push({ canvasId: task.target?.id || task.id, reason: task.error.message });
    }
  }

  result.processed = result.canvases.length;
  result.annotations = result.canvases.reduce((sum, c) => sum + c.annotations, 0);
  result.skipped = result.skippedCanvases.length;
  return result;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Canvas inference failed";
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new Error("Remote inference cancelled.");
}

// ─── Background action ────────────────────────────────────────────────────────

const remoteInferenceBackgroundAction: BackgroundActionDefinition = {
  id: REMOTE_INFERENCE_ACTION_ID,
  label: "Run remote OCR",
  summary: "Run remote OCR/HTR inference on canvas images via a configurable server",
  section: "OCR",
  order: 21,
  resourceTypes: ["Manifest"],
  resumable: true,

  render: (ctx) => (
    <>
      <RemoteInferenceConfigModal actionId={ctx.definition.id} />
      <RemoteInferenceResultsModal actionId={ctx.definition.id} />
    </>
  ),

  onResults: (ctx) => openRemoteInferenceResults(ctx.definition.id, ctx.instance?.result),

  supports: (ctx) => {
    const manifest = ctx.vault.get(ctx.target as any) as any;
    return !!manifest?.items?.length;
  },

  prepare: async (ctx) => {
    const canvases = getManifestCanvases(ctx);
    const options = await requestRemoteInferenceConfig({
      actionId: ctx.definition.id,
      instanceKey: ctx.instanceKey,
      totalCanvases: canvases.length,
      annotatedCanvases: canvases.filter((canvas: any) => canvasHasAnnotationPageAnnotations(ctx, canvas)).length,
      tags: getCanvasTagOptions(ctx, canvases),
      defaults: getDefaultRunOptions(),
      signal: ctx.signal,
    });

    if (options === false) return false;

    const selectedCanvases = selectCanvases(ctx, canvases, options);
    return createRemoteInferencePlan(canvases.length, selectedCanvases, options, ctx);
  },

  run: async (ctx) => {
    const plan = ctx.plan || createRemoteInferencePlan(0, [], getDefaultRunOptions());
    const options = getPlanOptions(plan) || getDefaultRunOptions();
    const tasks = ctx.tasks.getAll();
    const pendingTasks = ctx.tasks.getPending();
    const totalCanvases = getPlanTotal(plan);
    const serverUrl = options.serverUrl || DEFAULT_SERVER_URL;

    ctx.setActionLabel("Running remote OCR inference");

    if (!tasks.length) {
      ctx.setActionStatus("running", "No canvases selected");
      return createEmptyResult(totalCanvases, 0);
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
          const input = task.input as { canvasId: string; manifestId: string };
          const canvasId = task.target?.id || input.canvasId || task.id;
          const manifestId = input.manifestId || "";

          ctx.appendActionLog(`Inference ${index + 1}/${total}`, "info", {
            canvasId,
            current: index + 1,
            total,
          });

          try {
            const startedAt = performance.now();

            ctx.setActionStatus("running", `Sending canvas ${index + 1}/${total} to server`);

            const response = await fetch(`${serverUrl}/enrich-canvas`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                manifest_url: manifestId,
                canvas_id: canvasId,
                config: { type: "glm-ocr" },
              }),
              signal: ctx.signal,
            });

            if (!response.ok) {
              const text = await response.text().catch(() => response.statusText);
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: `Server responded with ${response.status}: ${text}`,
              };
              ctx.appendActionLog("Skipped canvas", "warn", { canvasId, reason: skip.reason });
              return {
                taskStatus: "skipped" as const,
                result: { type: "skipped", skip } satisfies RemoteInferenceTaskResult,
              };
            }

            const responseCanvas = await response.json();
            const annotationPages: any[] = responseCanvas?.annotations || [];
            const annotationsWritten = writeRemoteInferenceAnnotations(ctx, canvasId, annotationPages);
            const durationMs = performance.now() - startedAt;

            ctx.appendActionLog("Wrote annotations", "info", { canvasId, annotations: annotationsWritten });

            return {
              taskStatus: "complete" as const,
              result: {
                type: "processed",
                canvas: { canvasId, annotations: annotationsWritten, durationMs },
              } satisfies RemoteInferenceTaskResult,
            };
          } catch (error) {
            if (ctx.signal.aborted) throw error;

            const skip: RemoteInferenceCanvasSkip = {
              canvasId,
              reason: getErrorMessage(error),
            };
            ctx.appendActionLog("Skipped canvas", "warn", { canvasId, reason: skip.reason });
            return {
              taskStatus: "skipped" as const,
              result: { type: "skipped", skip } satisfies RemoteInferenceTaskResult,
            };
          }
        },
        {
          progressLabel: (_task, index, total) => `Inference ${index + 1}/${total}`,
        },
      );
    }

    const result = aggregateResult(totalCanvases, ctx.tasks.getAll());
    ctx.setActionStatus("running", `Created ${result.annotations} annotations across ${result.processed} canvases`);
    ctx.setActionProgress({ current: result.selected, total: result.selected, label: "Inference complete" });

    return result;
  },
};

export const backgroundActions: BackgroundActionDefinition[] = [remoteInferenceBackgroundAction];
