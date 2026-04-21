import { Modal } from "@manifest-editor/components";
import { DOCLING_DEFAULT_PROMPT, DOCLING_MODEL_ID } from "./docling";
import type { OcrDoclingTagOption } from "./tags";
import { getTagKey } from "./tags";
import { useEffect, useMemo, useState } from "react";

export const OCR_DOCLING_CONFIG_EVENT = "@manifest-editor/ocr-docling:config";

export const OCR_DOCLING_IMAGE_SIZES = [768, 1024, 1536, 2048] as const;

export type OcrDoclingImageSize = (typeof OCR_DOCLING_IMAGE_SIZES)[number];

export type OcrDoclingRunOptions = {
  prompt: string;
  imageSize: OcrDoclingImageSize;
  scope: "all" | "tag";
  tagKey?: string;
};

export type OcrDoclingConfigRequest = {
  actionId: string;
  instanceKey: string;
  totalCanvases: number;
  tags: OcrDoclingTagOption[];
  defaults: OcrDoclingRunOptions;
  signal?: AbortSignal;
  resolve: (options: OcrDoclingRunOptions | false) => void;
};

export function requestOcrDoclingConfig(
  request: Omit<OcrDoclingConfigRequest, "resolve">,
): Promise<OcrDoclingRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted) {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: OcrDoclingRunOptions | false) => {
      if (settled) {
        return;
      }

      settled = true;
      request.signal?.removeEventListener("abort", handleAbort);
      resolve(options);
    };
    const handleAbort = () => settle(false);

    request.signal?.addEventListener("abort", handleAbort, { once: true });
    window.dispatchEvent(
      new CustomEvent<OcrDoclingConfigRequest>(OCR_DOCLING_CONFIG_EVENT, {
        detail: { ...request, resolve: settle },
      }),
    );
  });
}

export function renderOcrDoclingConfigModal(actionId: string) {
  return <OcrDoclingConfigModal actionId={actionId} />;
}

function OcrDoclingConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] = useState<OcrDoclingConfigRequest | null>(null);
  const [options, setOptions] = useState<OcrDoclingRunOptions>(getDefaultRunOptions());

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<OcrDoclingConfigRequest>).detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseDefaults(detail.defaults, detail.tags));
      }
    };

    window.addEventListener(OCR_DOCLING_CONFIG_EVENT, listener);
    return () => window.removeEventListener(OCR_DOCLING_CONFIG_EVENT, listener);
  }, [actionId]);

  useEffect(() => {
    if (!request?.signal) {
      return;
    }

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
  const targetCount = options.scope === "tag" ? selectedTag?.canvasCount || 0 : request?.totalCanvases || 0;

  if (!request) {
    return null;
  }

  const close = (value: OcrDoclingRunOptions | false) => {
    request.resolve(value);
    setRequest(null);
  };

  const tagOptions = request.tags;
  const tagSelectionDisabled = !tagOptions.length;

  return (
    <Modal
      title="Run OCR with Docling"
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
            disabled={targetCount === 0}
            onClick={() => close(options)}
          >
            Run OCR
          </button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <div className="grid gap-1 rounded border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
          <div>
            <span className="font-medium text-zinc-800">Model:</span> {DOCLING_MODEL_ID}
          </div>
          <div>
            <span className="font-medium text-zinc-800">Runtime:</span>{" "}
            {typeof navigator !== "undefined" && "gpu" in navigator ? "WebGPU available" : "WebGPU unavailable"}
          </div>
          <div>
            <span className="font-medium text-zinc-800">Cache:</span>{" "}
            {typeof caches !== "undefined" ? "Browser Cache API available" : "Browser Cache API unavailable"}
          </div>
        </div>

        <label className="grid gap-1">
          <span className="font-medium text-zinc-900">Prompt</span>
          <textarea
            className="min-h-24 rounded border border-zinc-300 p-2 text-sm"
            value={options.prompt}
            onChange={(event) => setOptions((current) => ({ ...current, prompt: event.target.value }))}
          />
        </label>

        <label className="grid gap-1">
          <span className="font-medium text-zinc-900">Image size</span>
          <select
            className="rounded border border-zinc-300 bg-white p-2"
            value={options.imageSize}
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                imageSize: Number(event.target.value) as OcrDoclingImageSize,
              }))
            }
          >
            {OCR_DOCLING_IMAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px long edge
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

        <div className="rounded border border-zinc-200 bg-white p-3 text-zinc-600">
          {targetCount} canvas{targetCount === 1 ? "" : "es"} selected.
        </div>
      </div>
    </Modal>
  );
}

export function getDefaultRunOptions(): OcrDoclingRunOptions {
  return {
    prompt: DOCLING_DEFAULT_PROMPT,
    imageSize: 1024,
    scope: "all",
  };
}

function normaliseDefaults(defaults: OcrDoclingRunOptions, tags: OcrDoclingTagOption[]): OcrDoclingRunOptions {
  const fallbackTagKey = tags[0] ? getTagKey(tags[0]) : undefined;
  const hasSelectedTag = defaults.tagKey ? tags.some((tag) => tag.key === defaults.tagKey) : false;

  return {
    ...defaults,
    prompt: defaults.prompt || DOCLING_DEFAULT_PROMPT,
    imageSize: OCR_DOCLING_IMAGE_SIZES.includes(defaults.imageSize) ? defaults.imageSize : 1024,
    scope: defaults.scope === "tag" && tags.length ? "tag" : "all",
    tagKey: hasSelectedTag ? defaults.tagKey : fallbackTagKey,
  };
}
