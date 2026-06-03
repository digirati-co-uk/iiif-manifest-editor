import { Modal } from "@manifest-editor/components";
import { useEffect, useMemo, useState } from "react";
import type {
  DetectedManifestLanguage,
  TranslationLanguageProgress,
} from "./collection";
import { TRANSLATION_MODEL_ID } from "./constants";
import {
  getLanguageLabel,
  getLanguageProgressLabel,
  M2M100_LANGUAGES,
} from "./languages";
import { getModelSourceLanguage, normaliseRunOptions } from "./options";
import type {
  TranslationContentFilters,
  TranslationResourceRef,
  TranslationRunOptions,
  TranslationTarget,
} from "./types";

export const TRANSLATION_CONFIG_EVENT = "@manifest-editor/translation:config";

export type TranslationConfigRequest = {
  actionId: string;
  instanceKey: string;
  defaults: TranslationRunOptions;
  availableLanguages: string[];
  detectedLanguages?: DetectedManifestLanguage[];
  currentResource?: TranslationResourceRef;
  getTargets?: (options: TranslationRunOptions) => TranslationTarget[];
  getTargetLanguageProgress?: (
    options: TranslationRunOptions,
  ) => TranslationLanguageProgress[];
  targets: TranslationTarget[];
  signal?: AbortSignal;
  resolve: (options: TranslationRunOptions | false) => void;
};

type LanguageOption = {
  value: string;
  label: string;
};

type LanguageOptionGroup = {
  label: string;
  options: LanguageOption[];
};

export function requestTranslationConfig(
  request: Omit<TranslationConfigRequest, "resolve">,
): Promise<TranslationRunOptions | false> {
  return new Promise((resolve) => {
    if (request.signal?.aborted || typeof window === "undefined") {
      resolve(false);
      return;
    }

    let settled = false;
    const settle = (options: TranslationRunOptions | false) => {
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
      new CustomEvent<TranslationConfigRequest>(TRANSLATION_CONFIG_EVENT, {
        detail: { ...request, resolve: settle },
      }),
    );
  });
}

export function renderTranslationConfigModal(actionId: string) {
  return <TranslationConfigModal actionId={actionId} />;
}

function TranslationConfigModal({ actionId }: { actionId: string }) {
  const [request, setRequest] = useState<TranslationConfigRequest | null>(null);
  const [options, setOptions] = useState<TranslationRunOptions>(
    normaliseRunOptions({}),
  );

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<TranslationConfigRequest>).detail;
      if (detail?.actionId === actionId) {
        setRequest(detail);
        setOptions(normaliseRunOptions(detail.defaults));
      }
    };

    window.addEventListener(TRANSLATION_CONFIG_EVENT, listener);
    return () => window.removeEventListener(TRANSLATION_CONFIG_EVENT, listener);
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

  const detectedLanguages = request?.detectedLanguages || [];
  const detectedLanguageCodes = useMemo(
    () => detectedLanguages.map((language) => language.language),
    [detectedLanguages],
  );
  const detectedLanguageKey = detectedLanguageCodes.join("|");

  useEffect(() => {
    if (
      !detectedLanguageCodes.length ||
      detectedLanguageCodes.includes(options.sourceLanguage)
    ) {
      return;
    }

    setOptions((current) => {
      if (detectedLanguageCodes.includes(current.sourceLanguage)) {
        return current;
      }

      return normaliseRunOptions({
        ...current,
        sourceLanguage: detectedLanguageCodes[0],
      });
    });
  }, [detectedLanguageKey, options.sourceLanguage]);

  const currentTargets = useMemo(
    () => request?.getTargets?.(options) || request?.targets || [],
    [request, options],
  );
  const missingTargets = useMemo(
    () => currentTargets.filter((target) => target.status === "missing").length,
    [currentTargets],
  );
  const targetLanguageProgress = useMemo(
    () => request?.getTargetLanguageProgress?.(options) || [],
    [request, options],
  );
  const sourceLanguageGroups = useMemo(
    () => [
      {
        label: "Detected in manifest",
        options: detectedLanguages.map((language) => ({
          value: language.language,
          label: getLanguageLabel(language.language),
        })),
      },
    ],
    [detectedLanguages],
  );
  const targetLanguageGroups = useMemo(
    () => createTargetLanguageGroups(targetLanguageProgress),
    [targetLanguageProgress],
  );
  const updateContentFilter = (
    filter: keyof TranslationContentFilters,
    enabled: boolean,
  ) => {
    setOptions((current) =>
      normaliseRunOptions({
        ...current,
        contentFilters: {
          ...current.contentFilters,
          [filter]: enabled,
        },
      }),
    );
  };

  if (!request) {
    return null;
  }

  const close = (value: TranslationRunOptions | false) => {
    request.resolve(value === false ? false : normaliseRunOptions(value));
    setRequest(null);
  };

  const sourceMatchesTarget =
    getModelSourceLanguage(options.sourceLanguage, options) ===
    options.targetLanguage;
  const currentResourceOnly = options.currentResourceOnly === true && !!request.currentResource;
  const disabled =
    detectedLanguageCodes.length === 0 ||
    sourceMatchesTarget ||
    missingTargets === 0;

  return (
    <Modal
      title="Run translations"
      onClose={() => close(false)}
      className="max-w-xl"
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300"
            onClick={() => close(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded border border-me-primary-500 bg-me-primary-500 px-2.5 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={disabled}
            onClick={() => close(options)}
          >
            Run translation
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 p-3 text-sm text-zinc-700">
        <div className="flex flex-col gap-2 border-b border-zinc-100 pb-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_7rem]">
            <CompactLanguageSelect
              label="From"
              value={options.sourceLanguage}
              groups={sourceLanguageGroups}
              emptyLabel="No detected languages"
              onChange={(sourceLanguage) =>
                setOptions((current) =>
                  normaliseRunOptions({ ...current, sourceLanguage }),
                )
              }
            />
            <span className="mb-[7px] text-zinc-300 select-none">→</span>
            <CompactLanguageSelect
              label="To"
              value={options.targetLanguage}
              groups={targetLanguageGroups}
              onChange={(targetLanguage) =>
                setOptions((current) =>
                  normaliseRunOptions({ ...current, targetLanguage }),
                )
              }
            />
            <label className="col-span-3 grid shrink-0 gap-1 sm:col-span-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Mode</span>
              <select
                className="rounded border border-zinc-200 bg-white py-[5px] px-2 text-xs text-zinc-700 focus:border-me-primary-500 focus:outline-none focus:ring-2 focus:ring-me-primary-500/20"
                value={options.runtime}
                onChange={(event) =>
                  setOptions((current) =>
                    normaliseRunOptions({
                      ...current,
                      runtime: event.target.value as any,
                    }),
                  )
                }
              >
                <option value="auto">Auto</option>
                <option value="webgpu">WebGPU</option>
                <option value="wasm">WASM</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              className={`flex items-center gap-2 text-xs ${
                request.currentResource ? "text-zinc-600" : "text-zinc-300"
              }`}
              title={request.currentResource?.label || request.currentResource?.id}
            >
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-zinc-300"
                checked={currentResourceOnly}
                disabled={!request.currentResource}
                onChange={(event) =>
                  setOptions((current) =>
                    normaliseRunOptions({
                      ...current,
                      currentResourceOnly: event.currentTarget.checked,
                    }),
                  )
                }
              />
              Current resource
            </label>
            <TranslationFiltersMenu
              filters={options.contentFilters}
              onChange={updateContentFilter}
            />
          </div>
        </div>

        {detectedLanguageCodes.length === 0 ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
            No supported IIIF languages were detected in this manifest.
          </div>
        ) : null}

        {sourceMatchesTarget ? (
          <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
            Select different source and target languages.
          </div>
        ) : null}

        <div className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-2">
          <div className="text-xs text-zinc-500">
            {missingTargets > 0 ? (
              <>
                <span className="font-semibold text-amber-600">{missingTargets}</span> missing
              </>
            ) : (
              <span className="text-zinc-400">No missing strings</span>
            )}
            {currentTargets.length > 0 ? (
              <>
                <span className="text-zinc-300"> · </span>
                <span>{currentTargets.length}</span> total
              </>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Missing target-language values will be filled using {TRANSLATION_MODEL_ID}. Existing target values are left
            unchanged.
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TranslationFiltersMenu({
  filters,
  onChange,
}: {
  filters: TranslationContentFilters;
  onChange: (filter: keyof TranslationContentFilters, enabled: boolean) => void;
}) {
  return (
    <details className="relative shrink-0">
      <summary className="cursor-pointer list-none rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300">
        Filters
      </summary>
      <div className="absolute right-0 z-20 mt-1 grid w-48 gap-2 rounded border border-zinc-200 bg-white p-2.5 text-xs text-zinc-700 shadow-lg">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-zinc-300"
            checked={filters.annotationBodies}
            onChange={(event) =>
              onChange("annotationBodies", event.currentTarget.checked)
            }
          />
          Annotation bodies
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-zinc-300"
            checked={filters.canvasLabels}
            onChange={(event) =>
              onChange("canvasLabels", event.currentTarget.checked)
            }
          />
          Canvas labels
        </label>
      </div>
    </details>
  );
}

function createTargetLanguageGroups(
  progress: TranslationLanguageProgress[],
): LanguageOptionGroup[] {
  const detectedLanguageCodes = new Set(progress.map((item) => item.language));
  const groups: LanguageOptionGroup[] = [];

  if (progress.length) {
    groups.push({
      label: "Detected in manifest",
      options: progress.map((item) => ({
        value: item.language,
        label: `${getLanguageLabel(item.language)} (${getLanguageProgressLabel(item)})`,
      })),
    });
  }

  groups.push({
    label: "All languages",
    options: M2M100_LANGUAGES.filter(
      (language) => !detectedLanguageCodes.has(language.code),
    ).map((language) => ({
      value: language.code,
      label: language.label,
    })),
  });

  return groups;
}

function CompactLanguageSelect({
  label,
  value,
  groups,
  emptyLabel = "No languages available",
  onChange,
}: {
  label: string;
  value: string;
  groups: LanguageOptionGroup[];
  emptyLabel?: string;
  onChange: (language: string) => void;
}) {
  const hasOptions = groups.some((group) => group.options.length);
  const hasValue = groups.some((group) =>
    group.options.some((option) => option.value === value),
  );

  return (
    <label className="grid min-w-0 flex-1 gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      <select
        className="w-full rounded border border-zinc-200 bg-white py-[5px] px-2 text-xs text-zinc-800 focus:border-me-primary-500 focus:outline-none focus:ring-2 focus:ring-me-primary-500/20"
        value={value}
        disabled={!hasOptions}
        onChange={(event) => onChange(event.target.value)}
      >
        {!hasValue ? (
          <option value={value} disabled>
            {hasOptions ? getLanguageLabel(value) : emptyLabel}
          </option>
        ) : null}
        {groups.map((group) =>
          group.options.length ? (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ) : null,
        )}
      </select>
    </label>
  );
}
