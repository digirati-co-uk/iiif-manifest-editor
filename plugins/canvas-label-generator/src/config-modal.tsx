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

  return (
    <Modal
      title="Generate canvas labels"
      onClose={() => close(false)}
      className="max-w-5xl"
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
            disabled={preview.changed === 0}
            onClick={() => close(options)}
          >
            Apply labels
          </button>
        </div>
      }
    >
      <div className="grid min-h-0 gap-4 p-4 text-sm text-zinc-700 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-4">
          <label className="grid gap-1">
            <span className="font-medium text-zinc-900">Preset</span>
            <select
              className="rounded border border-zinc-300 bg-white p-2"
              value={selectedPreset}
              onChange={(event) => {
                const preset = CANVAS_LABEL_PATTERN_PRESETS.find((item) => item.id === event.target.value);
                if (preset) {
                  setOptions((current) => ({ ...current, pattern: preset.pattern }));
                }
              }}
            >
              {CANVAS_LABEL_PATTERN_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-zinc-900">Pattern</span>
            <input
              className="rounded border border-zinc-300 p-2"
              value={options.pattern}
              onChange={(event) => setOptions((current) => ({ ...current, pattern: event.target.value }))}
            />
          </label>

          <label className="grid gap-1">
            <span className="font-medium text-zinc-900">Language</span>
            <input
              className="rounded border border-zinc-300 p-2"
              value={options.language}
              onChange={(event) => setOptions((current) => ({ ...current, language: event.target.value }))}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.onlyUntitled}
              onChange={(event) => setOptions((current) => ({ ...current, onlyUntitled: event.target.checked }))}
            />
            <span>Only update untitled canvases</span>
          </label>

          <fieldset className="grid gap-2">
            <legend className="font-medium text-zinc-900">Numbering</legend>
            <div className="grid grid-cols-3 gap-2">
              <label className="grid gap-1">
                <span className="text-xs text-zinc-500">Start</span>
                <input
                  className="rounded border border-zinc-300 p-2"
                  type="number"
                  value={options.start}
                  onChange={(event) => setNumberOption("start", event.target.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-zinc-500">Increment</span>
                <input
                  className="rounded border border-zinc-300 p-2"
                  type="number"
                  value={options.increment}
                  onChange={(event) => setNumberOption("increment", event.target.value)}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-zinc-500">Pad</span>
                <input
                  className="rounded border border-zinc-300 p-2"
                  type="number"
                  min={0}
                  value={options.padWidth}
                  onChange={(event) => setNumberOption("padWidth", event.target.value)}
                />
              </label>
            </div>
            <select
              className="rounded border border-zinc-300 bg-white p-2"
              value={options.numberStyle}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  numberStyle: event.target.value as CanvasLabelNumberStyle,
                }))
              }
            >
              <option value="arabic">Arabic</option>
              <option value="roman-upper">Roman uppercase</option>
              <option value="roman-lower">Roman lowercase</option>
              <option value="alphabetic-upper">Alphabetic uppercase</option>
              <option value="alphabetic-lower">Alphabetic lowercase</option>
              <option value="folio">Folio recto/verso</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.restartPerRange}
                onChange={(event) => setOptions((current) => ({ ...current, restartPerRange: event.target.checked }))}
              />
              <span>Restart numbering per range</span>
            </label>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="font-medium text-zinc-900">Normalisation</legend>
            <Checkbox
              label="URL decode filenames"
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
              label="Replace separators"
              checked={options.filename.replaceSeparators}
              onChange={(checked) =>
                setOptions((current) => ({
                  ...current,
                  filename: { ...current.filename, replaceSeparators: checked },
                }))
              }
            />
            <Checkbox
              label="Collapse whitespace"
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
          </fieldset>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="grid grid-cols-4 gap-2">
            <PreviewStat label="Canvases" value={preview.total} />
            <PreviewStat label="Changes" value={preview.changed} />
            <PreviewStat label="Skipped" value={preview.skipped + preview.unchanged} />
            <PreviewStat label="Warnings" value={preview.warnings} />
          </div>

          {preview.changed === 0 ? (
            <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-zinc-600">No label changes to apply.</div>
          ) : null}

          <div className="min-h-0 overflow-hidden rounded border border-zinc-200">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)_96px] border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <span>Canvas</span>
              <span>Current</span>
              <span>Generated</span>
              <span>Status</span>
            </div>
            <div className="max-h-[52vh] overflow-auto">
              {preview.items.map((item) => (
                <div
                  key={item.canvasId}
                  className="grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)_96px] gap-2 border-b border-zinc-100 px-3 py-2 last:border-0"
                >
                  <span className="text-zinc-500">{item.canvasIndex + 1}</span>
                  <span className="truncate" title={item.previousLabel || item.canvasId}>
                    {item.previousLabel || "Untitled canvas"}
                  </span>
                  <span className="truncate font-medium text-zinc-900" title={item.generatedLabel}>
                    {item.generatedLabel || "-"}
                  </span>
                  <span className={item.status === "changed" ? "text-green-700" : "text-zinc-500"}>
                    {item.status === "changed" ? "Change" : item.skipReason || "Skip"}
                  </span>
                  {item.warnings.length ? (
                    <div className="col-span-4 text-xs text-amber-700">{item.warnings.join("; ")}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

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
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xl font-semibold text-zinc-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}
