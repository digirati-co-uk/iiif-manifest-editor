import { Modal } from "@manifest-editor/components";
import { useEffect, useMemo, useState } from "react";

export const BULK_ANNOTATION_IMPORT_CONFIG_EVENT =
  "@manifest-editor/annotations:bulk-import-config";

export const BULK_ANNOTATION_IMPORT_MOTIVATIONS = [
  "commenting",
  "supplementing",
  "tagging",
  "describing",
  "linking",
  "painting",
  "highlighting",
  "classifying",
  "identifying",
  "replying",
] as const;

export type BulkAnnotationImportScope = "all" | "tag";
export type BulkAnnotationImportMotivationMode = "all" | "selected";

export type BulkAnnotationImportRunOptions = {
  scope: BulkAnnotationImportScope;
  tagKey?: string;
  motivationMode: BulkAnnotationImportMotivationMode;
  motivations: string[];
};

export type BulkAnnotationImportTagOption = {
  key: string;
  label: string;
  canvasCount: number;
  externalPageCount: number;
};

export type BulkAnnotationImportConfigRequest = {
  actionId: string;
  instanceKey: string;
  totalExternalPages: number;
  tags: BulkAnnotationImportTagOption[];
  defaults: BulkAnnotationImportRunOptions;
  signal?: AbortSignal;
  resolve: (options: BulkAnnotationImportRunOptions | false) => void;
};

export function requestBulkAnnotationImportConfig(
  request: Omit<BulkAnnotationImportConfigRequest, "resolve">,
): Promise<BulkAnnotationImportRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted) {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: BulkAnnotationImportRunOptions | false) => {
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
      new CustomEvent<BulkAnnotationImportConfigRequest>(
        BULK_ANNOTATION_IMPORT_CONFIG_EVENT,
        {
          detail: { ...request, resolve: settle },
        },
      ),
    );
  });
}

export function renderBulkAnnotationImportConfigModal(actionId: string) {
  return <BulkAnnotationImportConfigModal actionId={actionId} />;
}

export function getDefaultRunOptions(): BulkAnnotationImportRunOptions {
  return {
    scope: "all",
    motivationMode: "all",
    motivations: [],
  };
}

function BulkAnnotationImportConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] =
    useState<BulkAnnotationImportConfigRequest | null>(null);
  const [options, setOptions] = useState<BulkAnnotationImportRunOptions>(
    getDefaultRunOptions(),
  );
  const [customMotivations, setCustomMotivations] = useState("");

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<BulkAnnotationImportConfigRequest>)
        .detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseDefaults(detail.defaults, detail.tags));
        setCustomMotivations("");
      }
    };

    window.addEventListener(BULK_ANNOTATION_IMPORT_CONFIG_EVENT, listener);
    return () =>
      window.removeEventListener(BULK_ANNOTATION_IMPORT_CONFIG_EVENT, listener);
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
  const selectedExternalPages =
    options.scope === "tag"
      ? selectedTag?.externalPageCount || 0
      : request?.totalExternalPages || 0;
  const selectedMotivations = useMemo(
    () => getSelectedMotivations(options, customMotivations),
    [customMotivations, options],
  );
  const motivationSelectionInvalid =
    options.motivationMode === "selected" && selectedMotivations.length === 0;

  if (!request) {
    return null;
  }

  const close = (value: BulkAnnotationImportRunOptions | false) => {
    request.resolve(value);
    setRequest(null);
  };

  const tagSelectionDisabled = !request.tags.length;

  return (
    <Modal
      title="Import External Annotation Pages"
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
            disabled={selectedExternalPages === 0 || motivationSelectionInvalid}
            onClick={() =>
              close({
                ...options,
                motivations:
                  options.motivationMode === "selected"
                    ? selectedMotivations
                    : [],
              })
            }
          >
            Import pages
          </button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <fieldset className="grid gap-2">
          <legend className="font-medium text-zinc-900">Canvases</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={options.scope === "all"}
              onChange={() =>
                setOptions((current) => ({ ...current, scope: "all" }))
              }
            />
            <span>
              All canvases with external annotation pages (
              {request.totalExternalPages})
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
                  tagKey: current.tagKey || request.tags[0]?.key,
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
            {request.tags.map((tag) => (
              <option key={tag.key} value={tag.key}>
                {tag.label} ({tag.externalPageCount})
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="font-medium text-zinc-900">Motivations</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={options.motivationMode === "all"}
              onChange={() =>
                setOptions((current) => ({ ...current, motivationMode: "all" }))
              }
            />
            <span>All motivations</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={options.motivationMode === "selected"}
              onChange={() =>
                setOptions((current) => ({
                  ...current,
                  motivationMode: "selected",
                  motivations: current.motivations.length
                    ? current.motivations
                    : ["commenting"],
                }))
              }
            />
            <span>Only selected motivations</span>
          </label>
          <div className="grid grid-cols-2 gap-2 rounded border border-zinc-200 p-3">
            {BULK_ANNOTATION_IMPORT_MOTIVATIONS.map((motivation) => (
              <label key={motivation} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={options.motivationMode !== "selected"}
                  checked={options.motivations.includes(motivation)}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      motivationMode: "selected",
                      motivations: event.target.checked
                        ? uniqueStrings([...current.motivations, motivation])
                        : current.motivations.filter(
                            (item) => item !== motivation,
                          ),
                    }))
                  }
                />
                <span>{motivation}</span>
              </label>
            ))}
          </div>
          <label className="grid gap-1">
            <span className="font-medium text-zinc-900">
              Additional motivations
            </span>
            <input
              type="text"
              className="rounded border border-zinc-300 p-2"
              disabled={options.motivationMode !== "selected"}
              value={customMotivations}
              placeholder="transcribing, reviewing"
              onChange={(event) => setCustomMotivations(event.target.value)}
            />
          </label>
        </fieldset>

        <div className="rounded border border-zinc-200 bg-white p-3 text-zinc-600">
          {selectedExternalPages} external annotation page
          {selectedExternalPages === 1 ? "" : "s"} selected.
          {options.motivationMode === "selected" ? (
            <>
              {" "}
              {selectedMotivations.length} motivation
              {selectedMotivations.length === 1 ? "" : "s"} selected.
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function normaliseDefaults(
  defaults: BulkAnnotationImportRunOptions,
  tags: BulkAnnotationImportTagOption[],
): BulkAnnotationImportRunOptions {
  const hasSelectedTag = defaults.tagKey
    ? tags.some((tag) => tag.key === defaults.tagKey)
    : false;

  return {
    scope: defaults.scope === "tag" && tags.length ? "tag" : "all",
    tagKey: hasSelectedTag ? defaults.tagKey : tags[0]?.key,
    motivationMode: defaults.motivationMode === "selected" ? "selected" : "all",
    motivations: uniqueStrings(defaults.motivations || []),
  };
}

function getSelectedMotivations(
  options: BulkAnnotationImportRunOptions,
  customMotivations: string,
) {
  if (options.motivationMode !== "selected") {
    return [];
  }

  return uniqueStrings([
    ...options.motivations,
    ...parseMotivationText(customMotivations),
  ]);
}

function parseMotivationText(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}
