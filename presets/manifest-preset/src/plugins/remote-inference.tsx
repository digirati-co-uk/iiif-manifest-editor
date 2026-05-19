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
export const STRUCTURED_OUTPUT_ACTION_ID = "@manifest-editor/remote-inference/structured-output";
const REMOTE_INFERENCE_ID_SEGMENT = "/remote-inference/";
const SERVER_URL_STORAGE_KEY = "@manifest-editor/remote-inference/serverUrl";
const API_KEY_STORAGE_KEY = "@manifest-editor/remote-inference/apiKey";
const MODEL_STORAGE_KEY = "@manifest-editor/remote-inference/model";
const STRUCTURED_FIELDS_STORAGE_KEY = "@manifest-editor/remote-inference/structuredFields";
const DEFAULT_SERVER_URL = "http://localhost:8000";
const STRUCTURED_OUTPUT_MODEL = "qwen-structure";

const REMOTE_INFERENCE_MODELS = [
  // { value: "palette", label: "Palette" },
  // { value: "ocr", label: "OCR" },
  { value: "glm-ocr", label: "GLM: Small OCR (1B)" },
  // { value: "surya-ocr", label: "surya" },
  { value: "deepseek-ocr", label: "DeepSeek: Medium OCR (3B)" },
  { value: "qwen-ocr", label: "Qwen: vLLM (9B)" },
] as const;

type RemoteInferenceModel = (typeof REMOTE_INFERENCE_MODELS)[number]["value"];
type RemoteInferenceResultModel = RemoteInferenceModel | typeof STRUCTURED_OUTPUT_MODEL;

const DEFAULT_MODEL: RemoteInferenceModel = "glm-ocr";

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

function canvasWithoutAnnotationPages(canvas: any): any {
  const returnCanvas = { ...canvas };

  returnCanvas.annotations = [];

  return returnCanvas;
}

// ─── Run options ──────────────────────────────────────────────────────────────

type RemoteInferenceRunOptions = {
  serverUrl: string;
  apiKey?: string;
  model: RemoteInferenceModel;
  scope: "all" | "tag" | "selected";
  tagKey?: string;
  skipAnnotatedCanvases?: boolean;
};

type CanvasSelectionOptions = {
  scope: "all" | "tag" | "selected";
  tagKey?: string;
};

type StructuredOutputField = {
  id: string;
  label: string;
  description: string;
};

type StructuredOutputRunOptions = {
  serverUrl: string;
  apiKey?: string;
  scope: "all" | "tag" | "selected";
  tagKey?: string;
  fields: StructuredOutputField[];
};

function getDefaultRunOptions(): RemoteInferenceRunOptions {
  const storedUrl =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(SERVER_URL_STORAGE_KEY) ?? DEFAULT_SERVER_URL)
      : DEFAULT_SERVER_URL;
  const storedApiKey = typeof localStorage !== "undefined" ? localStorage.getItem(API_KEY_STORAGE_KEY) || "" : "";
  const storedModel =
    typeof localStorage !== "undefined" ? parseRemoteInferenceModel(localStorage.getItem(MODEL_STORAGE_KEY)) : null;
  return {
    serverUrl: storedUrl,
    apiKey: storedApiKey,
    model: storedModel || DEFAULT_MODEL,
    scope: "all",
    skipAnnotatedCanvases: true,
  };
}

function getStoredServerUrl() {
  return typeof localStorage !== "undefined"
    ? (localStorage.getItem(SERVER_URL_STORAGE_KEY) ?? DEFAULT_SERVER_URL)
    : DEFAULT_SERVER_URL;
}

function getStoredApiKey() {
  return typeof localStorage !== "undefined" ? localStorage.getItem(API_KEY_STORAGE_KEY) || "" : "";
}

function createStructuredField(label = "", description = ""): StructuredOutputField {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label,
    description,
  };
}

function parseStoredStructuredFields(): StructuredOutputField[] {
  if (typeof localStorage === "undefined") return [createStructuredField()];

  try {
    const raw = localStorage.getItem(STRUCTURED_FIELDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [createStructuredField()];
    const fields = parsed
      .map((field: any) =>
        createStructuredField(
          typeof field?.label === "string" ? field.label : "",
          typeof field?.description === "string" ? field.description : "",
        ),
      )
      .filter((field) => field.label.trim() || field.description.trim());
    return fields.length ? fields : [createStructuredField()];
  } catch {
    return [createStructuredField()];
  }
}

function getDefaultStructuredOutputOptions(): StructuredOutputRunOptions {
  return {
    serverUrl: getStoredServerUrl(),
    apiKey: getStoredApiKey(),
    scope: "all",
    fields: parseStoredStructuredFields(),
  };
}

function serialiseStructuredFields(fields: StructuredOutputField[]) {
  return fields
    .map((field) => ({
      label: field.label.trim(),
      description: field.description.trim(),
    }))
    .filter((field) => field.label && field.description);
}

function structuredFieldsToConfig(fields: StructuredOutputField[]) {
  return Object.fromEntries(serialiseStructuredFields(fields).map((field) => [field.label, field.description]));
}

function getStructuredFieldsResult(results: any): Record<string, string> {
  const fields = results?.fields;
  return fields && typeof fields === "object" && !Array.isArray(fields) ? fields : {};
}

function getStructuredOutputAnnotationPages(responseCanvas: any): any[] {
  const pages: any[] = responseCanvas?.annotations || [];
  return pages.filter((page) =>
    typeof page?.id === "string" ? page.id.includes("/annotations/qwen-structure/") : false,
  );
}

function parseRemoteInferenceModel(value: string | null | undefined): RemoteInferenceModel | null {
  return REMOTE_INFERENCE_MODELS.some((model) => model.value === value) ? (value as RemoteInferenceModel) : null;
}

// ─── Result types ─────────────────────────────────────────────────────────────

type RemoteInferenceCanvasResult = {
  canvasId: string;
  model: RemoteInferenceResultModel;
  annotations: number;
  durationMs: number;
  palette?: string[];
  fields?: Record<string, string>;
  sourceImage?: string;
  message?: string;
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

type RemoteInferencePrepareData = {
  scope?: "selected";
};

type StructuredOutputPlanData = {
  options: StructuredOutputRunOptions;
  total: number;
};

type NormalisedRemoteInferenceBody = {
  id: string;
  entity: any;
  reference: { id: string; type: "ContentResource" };
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

function isLegacyRemoteInferenceId(canvasId: string, id: string | undefined) {
  if (!id?.startsWith(`${trimTrailingSlash(canvasId)}${REMOTE_INFERENCE_ID_SEGMENT}`)) {
    return false;
  }
  return /\/remote-inference\/\d+\/annotation$/.test(id);
}

function getDefaultAnnotationPage(ctx: BackgroundActionRunContext, canvas: any) {
  const firstPage = canvas?.annotations?.[0];
  return firstPage ? (ctx.vault.get(firstPage) as any) : null;
}

function getRemoteInferenceAnnotationId(
  canvasId: string,
  model: RemoteInferenceResultModel,
  pageIndex: number,
  index: number,
  runId?: string,
) {
  const runSegment = runId ? `/${runId}` : "";
  return `${trimTrailingSlash(canvasId)}${REMOTE_INFERENCE_ID_SEGMENT}${model}${runSegment}/${pageIndex + 1}/${index + 1}/annotation`;
}

function getRemoteInferenceBodyId(
  canvasId: string,
  model: RemoteInferenceResultModel,
  pageIndex: number,
  annotationIndex: number,
  bodyIndex: number,
  runId?: string,
) {
  return `${getRemoteInferenceAnnotationId(canvasId, model, pageIndex, annotationIndex, runId)}/body/${bodyIndex + 1}`;
}

function getCanvasAnnotationPageRefs(ctx: BackgroundActionRunContext, canvas: any): any[] {
  return canvas?.annotations ? (ctx.vault.get(canvas.annotations) as any) || [] : [];
}

function normaliseBodies(
  item: any,
  canvasId: string,
  model: RemoteInferenceResultModel,
  pageIndex: number,
  annotationIndex: number,
  runId?: string,
): NormalisedRemoteInferenceBody[] {
  const bodies = Array.isArray(item?.body) ? item.body : item?.body ? [item.body] : [];

  if (!bodies.length && typeof item?.bodyValue === "string") {
    bodies.push({
      type: "TextualBody",
      value: item.bodyValue,
      format: "text/plain",
    });
  }

  return bodies.map((body: any, bodyIndex: number) => {
    const id =
      body?.id && typeof body.id === "string"
        ? body.id
        : getRemoteInferenceBodyId(canvasId, model, pageIndex, annotationIndex, bodyIndex, runId);
    return {
      id,
      entity: {
        ...body,
        id,
        type: body?.type || "TextualBody",
        format: body?.format || "text/plain",
        value: body?.value || "",
      },
      reference: { id, type: "ContentResource" as const },
    };
  });
}

/**
 * Write annotation pages from a remote-inference API response canvas into the vault.
 * Returns the total number of annotations written.
 */
function writeRemoteInferenceAnnotations(
  ctx: BackgroundActionRunContext,
  canvasId: string,
  model: RemoteInferenceResultModel,
  responseAnnotationPages: any[],
  options: { mode?: "replace" | "append"; runId?: string } = {},
): number {
  const canvas = ctx.vault.get({ id: canvasId, type: "Canvas" } as any) as any;
  if (!canvas?.id) return 0;

  let totalWritten = 0;

  const existingPages = getCanvasAnnotationPageRefs(ctx, canvas);
  const page = getDefaultAnnotationPage(ctx, canvas);
  const pageId = page?.id || `${trimTrailingSlash(canvasId)}/annotations`;
  const previousItems: any[] = page?.items || [];
  const previousRemoteItems = previousItems.filter(
    (item: any) => isRemoteInferenceId(item?.id) || isLegacyRemoteInferenceId(canvasId, item?.id),
  );
  const actions: any[] = [];
  const mode = options.mode || "replace";

  if (!page) {
    actions.push(
      importEntities({
        entities: {
          AnnotationPage: {
            [pageId]: {
              id: pageId,
              type: "AnnotationPage",
              label: { en: ["Inline annotations"] },
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
        reference: {
          id: pageId,
          type: "AnnotationPage",
        },
      }),
    );
  }

  if (mode === "replace") {
    for (const item of previousRemoteItems) {
      actions.push(
        removeReference({
          id: pageId,
          type: "AnnotationPage",
          key: "items",
          reference: {
            id: item.id,
            type: "Annotation",
          },
        }),
      );
    }

    for (const existingPage of existingPages) {
      if (existingPage?.id === pageId) continue;
      const remoteItems: any[] = (existingPage?.items || []).filter((item: any) => isRemoteInferenceId(item?.id));
      for (const item of remoteItems) {
        actions.push(
          removeReference({
            id: existingPage.id,
            type: "AnnotationPage",
            key: "items",
            reference: {
              id: item.id,
              type: "Annotation",
            },
          }),
        );
      }
    }
  }

  const annotationEntities: Record<string, any> = {};
  const bodyEntities: Record<string, any> = {};
  const annotationIds: string[] = [];

  for (let pageIndex = 0; pageIndex < responseAnnotationPages.length; pageIndex++) {
    const responsePage = responseAnnotationPages[pageIndex];
    if (!responsePage?.items?.length) continue;

    for (let i = 0; i < responsePage.items.length; i++) {
      const item = responsePage.items[i];
      if (!item) continue;

      const annotationId = getRemoteInferenceAnnotationId(canvasId, model, pageIndex, i, options.runId);
      const bodies = normaliseBodies(item, canvasId, model, pageIndex, i, options.runId);

      for (const body of bodies) {
        bodyEntities[body.id] = body.entity;
      }

      annotationEntities[annotationId] = {
        id: annotationId,
        type: "Annotation",
        motivation: item.motivation || "supplementing",
        body: bodies.map((body) => body.reference),
        target: item.target || canvasId,
      };
      annotationIds.push(annotationId);
      totalWritten += 1;
    }
  }

  if (totalWritten) {
    actions.push(
      importEntities({
        entities: {
          Annotation: annotationEntities,
          ContentResource: bodyEntities,
        },
      }),
    );

    for (const annotationId of annotationIds) {
      actions.push(
        addReference({
          id: pageId,
          type: "AnnotationPage",
          key: "items",
          reference: {
            id: annotationId,
            type: "Annotation",
          },
        }),
      );
    }
  }

  if (actions.length) {
    ctx.vault.dispatch(batchActions({ actions }));
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
  selectedCanvas?: {
    id: string;
    label?: string;
    annotated: boolean;
  };
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
  const selectedCount =
    options.scope === "selected"
      ? request?.selectedCanvas
        ? 1
        : 0
      : options.scope === "tag"
        ? selectedTag?.canvasCount || 0
        : request?.totalCanvases || 0;
  const annotatedSelectedCount =
    options.scope === "selected"
      ? request?.selectedCanvas?.annotated
        ? 1
        : 0
      : options.scope === "tag"
        ? selectedTag?.annotatedCanvasCount || 0
        : request?.annotatedCanvases || 0;
  const skippedByExistingAnnotations = options.skipAnnotatedCanvases !== false ? annotatedSelectedCount : 0;
  const runnableCount = Math.max(0, selectedCount - skippedByExistingAnnotations);
  const serverUrl = options.serverUrl.trim();
  const canRun = runnableCount > 0 && !!serverUrl && !!options.model;

  if (!request) return null;

  const close = (value: RemoteInferenceRunOptions | false) => {
    if (value && typeof value !== "boolean") {
      try {
        localStorage.setItem(SERVER_URL_STORAGE_KEY, value.serverUrl.trim());
        localStorage.setItem(API_KEY_STORAGE_KEY, value.apiKey?.trim() || "");
        localStorage.setItem(MODEL_STORAGE_KEY, value.model);
      } catch {
        // ignore
      }
    }
    request.resolve(value);
    setRequest(null);
  };

  const tagOptions = request.tags;
  const tagSelectionDisabled = !tagOptions.length;
  const selectedCanvasDisabled = !request.selectedCanvas;

  return (
    <Modal
      title="Run Remote Inference"
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
            disabled={!canRun}
            onClick={() =>
              close({
                ...options,
                serverUrl,
                apiKey: options.apiKey?.trim() || "",
              })
            }
          >
            Run
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
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                serverUrl: event.target.value,
              }))
            }
          />
          <span className="text-xs text-zinc-500">
            POST requests will be sent to <code>{options.serverUrl}/enrich-canvas</code>
          </span>
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-zinc-900">API key</span>
          <input
            type="password"
            className="rounded border border-zinc-300 p-2 text-sm"
            value={options.apiKey || ""}
            autoComplete="off"
            placeholder="Optional"
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                apiKey: event.target.value,
              }))
            }
          />
          <span className="text-xs text-zinc-500">
            When provided, requests include <code>X-API-KEY</code>.
          </span>
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-zinc-900">Model</span>
          <select
            className="rounded border border-zinc-300 bg-white p-2"
            value={options.model}
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                model: parseRemoteInferenceModel(event.target.value) || DEFAULT_MODEL,
              }))
            }
          >
            {REMOTE_INFERENCE_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
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
              checked={options.scope === "selected"}
              disabled={selectedCanvasDisabled}
              onChange={() => setOptions((current) => ({ ...current, scope: "selected" }))}
            />
            <span>
              Selected canvas
              {request.selectedCanvas?.label ? ` (${request.selectedCanvas.label})` : ""}
            </span>
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
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                tagKey: event.target.value,
              }))
            }
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
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                skipAnnotatedCanvases: event.target.checked,
              }))
            }
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
              {skippedByExistingAnnotations} canvas
              {skippedByExistingAnnotations === 1 ? "" : "es"} will be skipped because they already have annotations.
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
    apiKey: defaults.apiKey || "",
    model: parseRemoteInferenceModel(defaults.model) || DEFAULT_MODEL,
    scope: defaults.scope === "tag" && tags.length ? "tag" : defaults.scope === "selected" ? "selected" : "all",
    tagKey: hasSelectedTag ? defaults.tagKey : fallbackTagKey,
    skipAnnotatedCanvases: defaults.skipAnnotatedCanvases !== false,
  };
}

const STRUCTURED_CONFIG_EVENT = "@manifest-editor/remote-inference:structured-config";

type StructuredOutputConfigRequest = {
  actionId: string;
  instanceKey: string;
  totalCanvases: number;
  selectedCanvas?: {
    id: string;
    label?: string;
    annotated: boolean;
  };
  tags: RemoteInferenceTagOption[];
  defaults: StructuredOutputRunOptions;
  signal?: AbortSignal;
  resolve: (options: StructuredOutputRunOptions | false) => void;
};

function requestStructuredOutputConfig(
  request: Omit<StructuredOutputConfigRequest, "resolve">,
): Promise<StructuredOutputRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted) {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: StructuredOutputRunOptions | false) => {
      if (settled) return;
      settled = true;
      request.signal?.removeEventListener("abort", handleAbort);
      resolve(options);
    };
    const handleAbort = () => settle(false);

    request.signal?.addEventListener("abort", handleAbort, { once: true });
    window.dispatchEvent(
      new CustomEvent<StructuredOutputConfigRequest>(STRUCTURED_CONFIG_EVENT, {
        detail: { ...request, resolve: settle },
      }),
    );
  });
}

function StructuredOutputConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] = useState<StructuredOutputConfigRequest | null>(null);
  const [options, setOptions] = useState<StructuredOutputRunOptions>(getDefaultStructuredOutputOptions());

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<StructuredOutputConfigRequest>).detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseStructuredDefaults(detail.defaults, detail.tags));
      }
    };
    window.addEventListener(STRUCTURED_CONFIG_EVENT, listener);
    return () => window.removeEventListener(STRUCTURED_CONFIG_EVENT, listener);
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
  const selectedCount =
    options.scope === "selected"
      ? request?.selectedCanvas
        ? 1
        : 0
      : options.scope === "tag"
        ? selectedTag?.canvasCount || 0
        : request?.totalCanvases || 0;
  const serverUrl = options.serverUrl.trim();
  const validFields = serialiseStructuredFields(options.fields);
  const canRun = selectedCount > 0 && !!serverUrl && validFields.length > 0;

  if (!request) return null;

  const tagOptions = request.tags;
  const tagSelectionDisabled = !tagOptions.length;
  const selectedCanvasDisabled = !request.selectedCanvas;

  const updateField = (fieldId: string, key: "label" | "description", value: string) => {
    setOptions((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === fieldId ? { ...field, [key]: value } : field)),
    }));
  };

  const close = (value: StructuredOutputRunOptions | false) => {
    if (value && typeof value !== "boolean") {
      const fields = serialiseStructuredFields(value.fields);
      try {
        localStorage.setItem(SERVER_URL_STORAGE_KEY, value.serverUrl.trim());
        localStorage.setItem(API_KEY_STORAGE_KEY, value.apiKey?.trim() || "");
        localStorage.setItem(STRUCTURED_FIELDS_STORAGE_KEY, JSON.stringify(fields));
      } catch {
        // ignore
      }
    }
    request.resolve(value);
    setRequest(null);
  };

  return (
    <Modal
      title="Run Structured Output"
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
            disabled={!canRun}
            onClick={() =>
              close({
                ...options,
                serverUrl,
                apiKey: options.apiKey?.trim() || "",
                fields: options.fields.map((field) => ({
                  ...field,
                  label: field.label.trim(),
                  description: field.description.trim(),
                })),
              })
            }
          >
            Run
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
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                serverUrl: event.target.value,
              }))
            }
          />
          <span className="text-xs text-zinc-500">
            POST requests will be sent to <code>{options.serverUrl}/enrich-canvas</code>
          </span>
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-zinc-900">API key</span>
          <input
            type="password"
            className="rounded border border-zinc-300 p-2 text-sm"
            value={options.apiKey || ""}
            autoComplete="off"
            placeholder="Optional"
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                apiKey: event.target.value,
              }))
            }
          />
          <span className="text-xs text-zinc-500">
            When provided, requests include <code>X-API-KEY</code>.
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
              checked={options.scope === "selected"}
              disabled={selectedCanvasDisabled}
              onChange={() => setOptions((current) => ({ ...current, scope: "selected" }))}
            />
            <span>
              Selected canvas
              {request.selectedCanvas?.label ? ` (${request.selectedCanvas.label})` : ""}
            </span>
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
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                tagKey: event.target.value,
              }))
            }
          >
            {tagOptions.map((tag) => (
              <option key={tag.key} value={tag.key}>
                {tag.label} ({tag.canvasCount})
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="font-medium text-zinc-900">Structured fields</legend>
          {options.fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 rounded border border-zinc-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Field {index + 1}</span>
                <button
                  type="button"
                  className="text-xs text-zinc-500 disabled:opacity-50"
                  disabled={options.fields.length === 1}
                  onClick={() =>
                    setOptions((current) => ({
                      ...current,
                      fields: current.fields.filter((item) => item.id !== field.id),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                className="rounded border border-zinc-300 p-2 text-sm"
                value={field.label}
                placeholder="Label, e.g. Title"
                onChange={(event) => updateField(field.id, "label", event.target.value)}
              />
              <textarea
                className="min-h-20 rounded border border-zinc-300 p-2 text-sm"
                value={field.description}
                placeholder="Description or extraction instructions"
                onChange={(event) => updateField(field.id, "description", event.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
            onClick={() =>
              setOptions((current) => ({
                ...current,
                fields: [...current.fields, createStructuredField()],
              }))
            }
          >
            Add field
          </button>
        </fieldset>

        <div className="rounded border border-zinc-200 bg-white p-3 text-zinc-600">
          {selectedCount} canvas{selectedCount === 1 ? "" : "es"} will run structured output. Existing annotations will
          be kept.
        </div>
      </div>
    </Modal>
  );
}

function normaliseStructuredDefaults(
  defaults: StructuredOutputRunOptions,
  tags: RemoteInferenceTagOption[],
): StructuredOutputRunOptions {
  const fallbackTagKey = tags[0] ? getTagKey(tags[0]) : undefined;
  const hasSelectedTag = defaults.tagKey ? tags.some((tag) => tag.key === defaults.tagKey) : false;
  return {
    ...defaults,
    serverUrl: defaults.serverUrl || DEFAULT_SERVER_URL,
    apiKey: defaults.apiKey || "",
    scope: defaults.scope === "tag" && tags.length ? "tag" : defaults.scope === "selected" ? "selected" : "all",
    tagKey: hasSelectedTag ? defaults.tagKey : fallbackTagKey,
    fields: defaults.fields?.length ? defaults.fields : [createStructuredField()],
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
      detail: {
        actionId,
        result: result as RemoteInferenceActionResult | undefined,
      },
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
        {activeResult.canvases.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Processed canvases</div>
            <div className="max-h-72 overflow-auto">
              {activeResult.canvases.map((item) => (
                <div
                  key={`${item.model}:${item.canvasId}`}
                  className="grid gap-2 border-b border-zinc-100 px-3 py-2 last:border-0"
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="truncate font-medium text-zinc-900">{item.canvasId}</div>
                    <div className="shrink-0 text-xs text-zinc-500">{item.model}</div>
                  </div>
                  {item.message ? <div className="text-zinc-500">{item.message}</div> : null}
                  {item.sourceImage ? <div className="truncate text-xs text-zinc-500">{item.sourceImage}</div> : null}
                  {item.palette?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.palette.map((color) => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700"
                        >
                          <span className="h-4 w-4 rounded border border-zinc-200" style={{ backgroundColor: color }} />
                          {color}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.fields && Object.keys(item.fields).length ? (
                    <div className="grid gap-1 rounded border border-zinc-200 bg-white p-2">
                      {Object.entries(item.fields).map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-2 text-xs">
                          <span className="truncate font-medium text-zinc-700">{label}</span>
                          <span className="text-zinc-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
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

function selectCanvases(ctx: BackgroundActionRunContext, canvases: any[], options: CanvasSelectionOptions) {
  if (options.scope === "selected") {
    const currentCanvasId = ctx.currentCanvas?.id;
    return currentCanvasId ? canvases.filter((canvas) => canvas?.id === currentCanvasId) : [];
  }

  if (options.scope !== "tag" || !options.tagKey) return canvases;
  const selectedTag = parseTagKey(options.tagKey);
  if (!selectedTag) return [];
  return canvases.filter((canvas) =>
    ctx.tags.hasTag({ id: canvas.id, type: "Canvas" }, selectedTag.type, selectedTag.id),
  );
}

function getCurrentCanvasOption(ctx: BackgroundActionRunContext, canvases: any[]) {
  const currentCanvasId = ctx.currentCanvas?.id;
  if (!currentCanvasId) return undefined;

  const canvas = canvases.find((item) => item?.id === currentCanvasId);
  if (!canvas) return undefined;

  return {
    id: currentCanvasId,
    label: getCanvasLabel(canvas),
    annotated: canvasHasAnnotationPageAnnotations(ctx, canvas),
  };
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
        ? ({
            canvasId,
            reason: "Canvas already has annotations",
          } satisfies RemoteInferenceCanvasSkip)
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

function createStructuredOutputPlan(
  total: number,
  selectedCanvases: any[],
  options: StructuredOutputRunOptions,
  ctx?: BackgroundActionRunContext,
): BackgroundActionPlan {
  const manifest = ctx ? (ctx.vault.get(ctx.target as any) as any) : null;
  const manifestId: string = manifest?.id || "";

  return {
    version: 1,
    data: { options, total } satisfies StructuredOutputPlanData,
    tasks: selectedCanvases.map((canvas, index) => {
      const canvasId: string = canvas?.id || `canvas-${index + 1}`;
      const label = getCanvasLabel(canvas) || canvasId;

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
        status: "queued" as const,
      };
    }),
  };
}

function getPlanOptions(plan: BackgroundActionPlan): RemoteInferenceRunOptions | null {
  const data = plan.data as Partial<RemoteInferencePlanData> | undefined;
  return data?.options || null;
}

function getStructuredPlanOptions(plan: BackgroundActionPlan): StructuredOutputRunOptions | null {
  const data = plan.data as Partial<StructuredOutputPlanData> | undefined;
  return data?.options || null;
}

function getPlanTotal(plan: BackgroundActionPlan) {
  const data = plan.data as Partial<RemoteInferencePlanData> | undefined;
  return typeof data?.total === "number" ? data.total : plan.tasks.length;
}

function createEmptyResult(total: number, selected: number): RemoteInferenceActionResult {
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
      result.skippedCanvases.push({
        canvasId: task.target?.id || task.id,
        reason: task.error.message,
      });
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

function getRemoteInferenceEndpoint(serverUrl: string) {
  return `${trimTrailingSlash(serverUrl)}/enrich-canvas`;
}

function getResponseError(results: any) {
  return typeof results?.error === "string" && results.error.trim() ? results.error : null;
}

function getModelResultMessage(model: RemoteInferenceResultModel, results: any) {
  const value = results?.[model];
  return typeof value === "string" ? value : undefined;
}

function getRequestHeaders(options: { apiKey?: string }): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const apiKey = options.apiKey?.trim();
  if (apiKey) {
    headers["X-API-KEY"] = apiKey;
  }
  return headers;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new Error("Remote inference cancelled.");
}

// ─── Background action ────────────────────────────────────────────────────────

const remoteInferenceBackgroundAction: BackgroundActionDefinition = {
  id: REMOTE_INFERENCE_ACTION_ID,
  label: "Run remote inference",
  summary: "Run remote inference on canvas images via a configurable server",
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
    const prepareData = ctx.prepareData as RemoteInferencePrepareData | undefined;
    const defaults = getDefaultRunOptions();
    const requestDefaults = prepareData?.scope === "selected" ? { ...defaults, scope: "selected" as const } : defaults;
    const options = await requestRemoteInferenceConfig({
      actionId: ctx.definition.id,
      instanceKey: ctx.instanceKey,
      totalCanvases: canvases.length,
      annotatedCanvases: canvases.filter((canvas: any) => canvasHasAnnotationPageAnnotations(ctx, canvas)).length,
      selectedCanvas: getCurrentCanvasOption(ctx, canvases),
      tags: getCanvasTagOptions(ctx, canvases),
      defaults: requestDefaults,
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
    const serverUrl = options.serverUrl.trim() || DEFAULT_SERVER_URL;
    const endpoint = getRemoteInferenceEndpoint(serverUrl);
    const model = parseRemoteInferenceModel(options.model) || DEFAULT_MODEL;

    ctx.setActionLabel("Running remote inference");

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

            const canvas = ctx.vault.toPresentation3({ id: canvasId, type: "Canvas" });

            let body: any = {
              canvas: canvasWithoutAnnotationPages(canvas),
              config: { type: model },
            };

            if (!canvas) {
              body = {
                manifest_url: manifestId,
                canvas_id: canvasId,
                config: { type: model },
              };
            }

            const response = await fetch(endpoint, {
              method: "POST",
              headers: getRequestHeaders(options),
              body: JSON.stringify(body),
              signal: ctx.signal,
            });

            if (!response.ok) {
              const text = await response.text().catch(() => response.statusText);
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: `Server responded with ${response.status}: ${text}`,
              };
              ctx.appendActionLog("Skipped canvas", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped" as const,
                result: {
                  type: "skipped",
                  skip,
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const responseJson = await response.json();
            const responseError = getResponseError(responseJson?.results);
            if (responseError) {
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: responseError,
              };
              ctx.appendActionLog("Skipped canvas", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped" as const,
                result: {
                  type: "skipped",
                  skip,
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const durationMs = performance.now() - startedAt;

            if (model === "palette") {
              const palette = Array.isArray(responseJson?.results?.palette) ? responseJson.results.palette : [];
              ctx.appendActionLog("Read palette", "info", {
                canvasId,
                colours: palette.length,
              });
              return {
                taskStatus: "complete" as const,
                result: {
                  type: "processed",
                  canvas: {
                    canvasId,
                    model,
                    annotations: 0,
                    durationMs,
                    palette,
                    sourceImage: responseJson?.results?.source_image,
                    message: palette.length ? `Found ${palette.length} colours` : "No palette colours returned",
                  },
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const responseCanvas = responseJson?.canvas;
            const annotationPages: any[] = responseCanvas?.annotations || [];
            if (!annotationPages.length) {
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: "Server returned no annotation pages for this model.",
              };
              ctx.appendActionLog("Skipped canvas", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped" as const,
                result: {
                  type: "skipped",
                  skip,
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const annotationsWritten = writeRemoteInferenceAnnotations(ctx, canvasId, model, annotationPages);

            ctx.appendActionLog("Wrote annotations", "info", {
              canvasId,
              annotations: annotationsWritten,
            });

            return {
              taskStatus: "complete" as const,
              result: {
                type: "processed",
                canvas: {
                  canvasId,
                  model,
                  annotations: annotationsWritten,
                  durationMs,
                  sourceImage: responseJson?.results?.source_image,
                  message: getModelResultMessage(model, responseJson?.results),
                },
              } satisfies RemoteInferenceTaskResult,
            };
          } catch (error) {
            if (ctx.signal.aborted) throw error;

            const skip: RemoteInferenceCanvasSkip = {
              canvasId,
              reason: getErrorMessage(error),
            };
            ctx.appendActionLog("Skipped canvas", "warn", {
              canvasId,
              reason: skip.reason,
            });
            return {
              taskStatus: "skipped" as const,
              result: {
                type: "skipped",
                skip,
              } satisfies RemoteInferenceTaskResult,
            };
          }
        },
        {
          progressLabel: (_task, index, total) => `Inference ${index + 1}/${total}`,
        },
      );
    }

    const result = aggregateResult(totalCanvases, ctx.tasks.getAll());
    ctx.setActionStatus(
      "running",
      `Processed ${result.processed} canvases and created ${result.annotations} annotations`,
    );
    ctx.setActionProgress({
      current: result.selected,
      total: result.selected,
      label: "Inference complete",
    });

    return result;
  },
};

const structuredOutputBackgroundAction: BackgroundActionDefinition = {
  id: STRUCTURED_OUTPUT_ACTION_ID,
  label: "Run structured output",
  summary: "Extract configured structured fields from canvas images",
  section: "OCR",
  order: 22,
  resourceTypes: ["Manifest"],
  resumable: true,

  render: (ctx) => (
    <>
      <StructuredOutputConfigModal actionId={ctx.definition.id} />
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
    const prepareData = ctx.prepareData as RemoteInferencePrepareData | undefined;
    const defaults = getDefaultStructuredOutputOptions();
    const requestDefaults = prepareData?.scope === "selected" ? { ...defaults, scope: "selected" as const } : defaults;
    const options = await requestStructuredOutputConfig({
      actionId: ctx.definition.id,
      instanceKey: ctx.instanceKey,
      totalCanvases: canvases.length,
      selectedCanvas: getCurrentCanvasOption(ctx, canvases),
      tags: getCanvasTagOptions(ctx, canvases),
      defaults: requestDefaults,
      signal: ctx.signal,
    });

    if (options === false) return false;

    const selectedCanvases = selectCanvases(ctx, canvases, options);
    return createStructuredOutputPlan(canvases.length, selectedCanvases, options, ctx);
  },

  run: async (ctx) => {
    const plan = ctx.plan || createStructuredOutputPlan(0, [], getDefaultStructuredOutputOptions());
    const options = getStructuredPlanOptions(plan) || getDefaultStructuredOutputOptions();
    const tasks = ctx.tasks.getAll();
    const pendingTasks = ctx.tasks.getPending();
    const totalCanvases = getPlanTotal(plan);
    const serverUrl = options.serverUrl.trim() || DEFAULT_SERVER_URL;
    const endpoint = getRemoteInferenceEndpoint(serverUrl);
    const fields = structuredFieldsToConfig(options.fields);

    ctx.setActionLabel("Running structured output");

    if (!tasks.length) {
      ctx.setActionStatus("running", "No canvases selected");
      return createEmptyResult(totalCanvases, 0);
    }

    if (!Object.keys(fields).length) {
      ctx.setActionStatus("error", "No structured fields configured");
      return createEmptyResult(totalCanvases, tasks.length);
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

          ctx.appendActionLog(`Structured output ${index + 1}/${total}`, "info", {
            canvasId,
            current: index + 1,
            total,
          });

          try {
            const startedAt = performance.now();

            ctx.setActionStatus("running", `Sending canvas ${index + 1}/${total} to server`);

            const response = await fetch(endpoint, {
              method: "POST",
              headers: getRequestHeaders(options),
              body: JSON.stringify({
                manifest_url: manifestId,
                canvas_id: canvasId,
                config: {
                  type: STRUCTURED_OUTPUT_MODEL,
                  fields,
                },
              }),
              signal: ctx.signal,
            });

            if (!response.ok) {
              const text = await response.text().catch(() => response.statusText);
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: `Server responded with ${response.status}: ${text}`,
              };
              ctx.appendActionLog("Skipped canvas", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped" as const,
                result: {
                  type: "skipped",
                  skip,
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const responseJson = await response.json();
            const responseError = getResponseError(responseJson?.results);
            if (responseError) {
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: responseError,
              };
              ctx.appendActionLog("Skipped canvas", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped" as const,
                result: {
                  type: "skipped",
                  skip,
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const responseCanvas = responseJson?.canvas;
            const annotationPages = getStructuredOutputAnnotationPages(responseCanvas);
            if (!annotationPages.length) {
              const skip: RemoteInferenceCanvasSkip = {
                canvasId,
                reason: "Server returned no structured annotation pages.",
              };
              ctx.appendActionLog("Skipped canvas", "warn", {
                canvasId,
                reason: skip.reason,
              });
              return {
                taskStatus: "skipped" as const,
                result: {
                  type: "skipped",
                  skip,
                } satisfies RemoteInferenceTaskResult,
              };
            }

            const durationMs = performance.now() - startedAt;
            const runId = `${Date.now()}-${index + 1}`;
            const annotationsWritten = writeRemoteInferenceAnnotations(
              ctx,
              canvasId,
              STRUCTURED_OUTPUT_MODEL,
              annotationPages,
              { mode: "append", runId },
            );
            const resultFields = getStructuredFieldsResult(responseJson?.results);

            ctx.appendActionLog("Wrote structured annotations", "info", {
              canvasId,
              annotations: annotationsWritten,
            });

            return {
              taskStatus: "complete" as const,
              result: {
                type: "processed",
                canvas: {
                  canvasId,
                  model: STRUCTURED_OUTPUT_MODEL,
                  annotations: annotationsWritten,
                  durationMs,
                  fields: resultFields,
                  sourceImage: responseJson?.results?.source_image,
                  message: getModelResultMessage(STRUCTURED_OUTPUT_MODEL, responseJson?.results),
                },
              } satisfies RemoteInferenceTaskResult,
            };
          } catch (error) {
            if (ctx.signal.aborted) throw error;

            const skip: RemoteInferenceCanvasSkip = {
              canvasId,
              reason: getErrorMessage(error),
            };
            ctx.appendActionLog("Skipped canvas", "warn", {
              canvasId,
              reason: skip.reason,
            });
            return {
              taskStatus: "skipped" as const,
              result: {
                type: "skipped",
                skip,
              } satisfies RemoteInferenceTaskResult,
            };
          }
        },
        {
          progressLabel: (_task, index, total) => `Structured output ${index + 1}/${total}`,
        },
      );
    }

    const result = aggregateResult(totalCanvases, ctx.tasks.getAll());
    ctx.setActionStatus(
      "running",
      `Processed ${result.processed} canvases and created ${result.annotations} annotations`,
    );
    ctx.setActionProgress({
      current: result.selected,
      total: result.selected,
      label: "Structured output complete",
    });

    return result;
  },
};

export const backgroundActions: BackgroundActionDefinition[] = [
  remoteInferenceBackgroundAction,
  structuredOutputBackgroundAction,
];
