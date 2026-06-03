import { Modal } from "@manifest-editor/components";
import { useEffect, useMemo, useState } from "react";
import {
  CANVAS_LABEL_PATTERN_PRESETS,
  createCanvasLabelPreview,
  normaliseRunOptions,
  type CanvasLabelGeneratorRunOptions,
  type CanvasLabelNumberStyle,
  type CanvasLabelPreviewInput,
} from "./generator";

export const CANVAS_LABEL_GENERATOR_CONFIG_EVENT = "@manifest-editor/canvas-label-generator:config";

export type CanvasLabelGeneratorConfigRequest = {
  actionId: string;
  instanceKey: string;
  totalCanvases: number;
  inputs: CanvasLabelPreviewInput[];
  defaults: CanvasLabelGeneratorRunOptions;
  signal?: AbortSignal;
  resolve: (options: CanvasLabelGeneratorRunOptions | false) => void;
};

export function requestCanvasLabelGeneratorConfig(
  request: Omit<CanvasLabelGeneratorConfigRequest, "resolve">,
): Promise<CanvasLabelGeneratorRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted || typeof window === "undefined") {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: CanvasLabelGeneratorRunOptions | false) => {
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
      new CustomEvent<CanvasLabelGeneratorConfigRequest>(CANVAS_LABEL_GENERATOR_CONFIG_EVENT, {
        detail: { ...request, resolve: settle },
      }),
    );
  });
}

export function renderCanvasLabelGeneratorConfigModal(actionId: string) {
  return <CanvasLabelGeneratorConfigModal actionId={actionId} />;
}

function CanvasLabelGeneratorConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] = useState<CanvasLabelGeneratorConfigRequest | null>(null);
  const [options, setOptions] = useState<CanvasLabelGeneratorRunOptions>(normaliseRunOptions({}));

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<CanvasLabelGeneratorConfigRequest>).detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseRunOptions(detail.defaults));
      }
    };

    window.addEventListener(CANVAS_LABEL_GENERATOR_CONFIG_EVENT, listener);
    return () => window.removeEventListener(CANVAS_LABEL_GENERATOR_CONFIG_EVENT, listener);
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

  const preview = useMemo(
    () => createCanvasLabelPreview(request?.inputs || [], options),
    [request?.inputs, options],
  );
  const selectedPreset =
    CANVAS_LABEL_PATTERN_PRESETS.find((preset) => preset.pattern === options.pattern)?.id || "custom";

  if (!request) {
    return null;
  }

  const close = (value: CanvasLabelGeneratorRunOptions | false) => {
    request.resolve(value === false ? false : normaliseRunOptions(value));
    setRequest(null);
  };

  const setNumberOption = (key: "start" | "increment" | "padWidth", value: string) => {
    setOptions((current) => ({
      ...current,
      [key]: Number.isFinite(Number(value)) ? Number(value) : current[key],
    }));
  };

  const hasNumberToken = /\{n\b|\{rangeIndex\b/.test(options.pattern);
  const hasFilenameToken = /\{filename\}/.test(options.pattern);

  return (
    <Modal
      title="Generate canvas labels"
      onClose={() => close(false)}
      className="max-w-5xl"
      actions={
        <div className="flex items-center gap-3">
          <PreviewSummary preview={preview} />
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            onClick={() => close(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-me-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-me-primary-600 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            disabled={preview.changed === 0}
            onClick={() => close(options)}
          >
            Apply to {preview.changed} canvas{preview.changed === 1 ? "" : "es"}
          </button>
        </div>
      }
    >
      <div className="grid h-[58vh] grid-cols-[300px_minmax(0,1fr)]">
        {/* Options panel */}
        <div className="flex flex-col gap-5 overflow-y-auto border-r border-zinc-100 p-5 text-sm text-zinc-700">

          {/* Pattern presets */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Format</span>
            <div className="flex flex-wrap gap-1.5">
              {CANVAS_LABEL_PATTERN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setOptions((current) => ({ ...current, pattern: preset.pattern }))}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedPreset === preset.id
                      ? "bg-me-primary-500 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOptions((current) => ({ ...current, pattern: "" }))}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedPreset === "custom"
                    ? "bg-me-primary-500 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Pattern input */}
            <div className="flex flex-col gap-1">
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-me-primary-500 focus:ring-2 focus:ring-me-primary-500/20 focus:outline-none font-mono"
                value={options.pattern}
                placeholder="e.g. Page {n}"
                onChange={(event) => setOptions((current) => ({ ...current, pattern: event.target.value }))}
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {(["{n}", "{filename}", "{label}", "{range}"] as const).map((token) => (
                  <button
                    key={token}
                    type="button"
                    title={TOKEN_DESCRIPTIONS[token]}
                    onClick={() => setOptions((current) => ({ ...current, pattern: current.pattern + token }))}
                    className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600 hover:bg-me-primary-100 hover:text-me-primary-500 transition-colors"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Numbering — only shown when {n} or {rangeIndex} in pattern */}
          {hasNumberToken ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Numbering</span>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Start</span>
                  <input
                    className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:border-me-primary-500 focus:outline-none"
                    type="number"
                    value={options.start}
                    onChange={(event) => setNumberOption("start", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Step</span>
                  <input
                    className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:border-me-primary-500 focus:outline-none"
                    type="number"
                    value={options.increment}
                    onChange={(event) => setNumberOption("increment", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Pad zeros</span>
                  <input
                    className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:border-me-primary-500 focus:outline-none"
                    type="number"
                    min={0}
                    value={options.padWidth}
                    onChange={(event) => setNumberOption("padWidth", event.target.value)}
                  />
                </label>
              </div>
              <select
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-me-primary-500 focus:outline-none"
                value={options.numberStyle}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    numberStyle: event.target.value as CanvasLabelNumberStyle,
                  }))
                }
              >
                <option value="arabic">1, 2, 3 (Arabic)</option>
                <option value="roman-upper">I, II, III (Roman uppercase)</option>
                <option value="roman-lower">i, ii, iii (Roman lowercase)</option>
                <option value="alphabetic-upper">A, B, C (Uppercase)</option>
                <option value="alphabetic-lower">a, b, c (Lowercase)</option>
                <option value="folio">1r, 1v, 2r (Folio)</option>
              </select>
              <Checkbox
                label="Restart numbering per range"
                checked={options.restartPerRange}
                onChange={(checked) => setOptions((current) => ({ ...current, restartPerRange: checked }))}
              />
            </div>
          ) : null}

          {/* Filename options — only shown when {filename} in pattern */}
          {hasFilenameToken ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Filename clean-up</span>
              <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-3">
                <Checkbox
                  label="URL-decode filenames"
                  checked={options.filename.urlDecode}
                  onChange={(checked) =>
                    setOptions((current) => ({ ...current, filename: { ...current.filename, urlDecode: checked } }))
                  }
                />
                <Checkbox
                  label="Strip file extensions"
                  checked={options.filename.stripExtension}
                  onChange={(checked) =>
                    setOptions((current) => ({ ...current, filename: { ...current.filename, stripExtension: checked } }))
                  }
                />
                <Checkbox
                  label="Replace — and _ with spaces"
                  checked={options.filename.replaceSeparators}
                  onChange={(checked) =>
                    setOptions((current) => ({
                      ...current,
                      filename: { ...current.filename, replaceSeparators: checked },
                    }))
                  }
                />
                <Checkbox
                  label="Collapse extra whitespace"
                  checked={options.filename.collapseWhitespace}
                  onChange={(checked) =>
                    setOptions((current) => ({
                      ...current,
                      filename: { ...current.filename, collapseWhitespace: checked },
                    }))
                  }
                />
                <Checkbox
                  label="Title case"
                  checked={options.filename.titleCase}
                  onChange={(checked) =>
                    setOptions((current) => ({ ...current, filename: { ...current.filename, titleCase: checked } }))
                  }
                />
              </div>
            </div>
          ) : null}

          {/* Language + scope */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Settings</span>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">Language tag</span>
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-me-primary-500 focus:ring-2 focus:ring-me-primary-500/20 focus:outline-none"
                value={options.language}
                placeholder="en"
                onChange={(event) => setOptions((current) => ({ ...current, language: event.target.value }))}
              />
            </label>
            <Checkbox
              label="Only update untitled canvases"
              checked={options.onlyUntitled}
              onChange={(checked) => setOptions((current) => ({ ...current, onlyUntitled: checked }))}
            />
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
            <div className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <span>#</span>
              <span>Current label</span>
              <span>New label</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {preview.items.map((item) => {
              const isChanged = item.status === "changed";
              const hasWarning = item.warnings.length > 0;
              return (
                <div
                  key={item.canvasId}
                  className={`grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-zinc-100 px-4 py-2.5 last:border-0 ${
                    isChanged ? "" : "opacity-40"
                  }`}
                >
                  <span className="text-xs text-zinc-400 pt-0.5">{item.canvasIndex + 1}</span>
                  <span className="truncate text-sm text-zinc-600" title={item.previousLabel || item.canvasId}>
                    {item.previousLabel || <em className="text-zinc-400">Untitled</em>}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className={`truncate text-sm font-medium ${isChanged ? "text-zinc-900" : "text-zinc-500"}`}
                      title={item.generatedLabel || item.skipReason}
                    >
                      {isChanged ? item.generatedLabel : (
                        <span className="text-xs font-normal text-zinc-400 italic">{item.skipReason || "No change"}</span>
                      )}
                    </span>
                    {hasWarning ? (
                      <span className="text-xs text-amber-600">⚠ {item.warnings[0]}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

const TOKEN_DESCRIPTIONS: Record<string, string> = {
  "{n}": "Sequential number (e.g. 1, 2, 3)",
  "{filename}": "Filename from the image source",
  "{label}": "Existing IIIF label of the canvas",
  "{range}": "Label of the parent range/chapter",
};

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        className="rounded border-zinc-300 text-me-primary-500 focus:ring-me-primary-500"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm text-zinc-700">{label}</span>
    </label>
  );
}

function PreviewSummary({ preview }: { preview: { total: number; changed: number; warnings: number } }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-500 mr-auto">
      <span>
        <span className="font-semibold text-zinc-900">{preview.changed}</span> of {preview.total} will change
      </span>
      {preview.warnings > 0 ? (
        <span className="text-amber-600">
          ⚠ {preview.warnings} warning{preview.warnings === 1 ? "" : "s"}
        </span>
      ) : null}
    </div>
  );
}
