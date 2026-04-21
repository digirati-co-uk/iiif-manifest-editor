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
import { normaliseRunOptions } from "./options";
import type {
  TranslationContentFilters,
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

  const disabled =
    detectedLanguageCodes.length === 0 ||
    options.sourceLanguage === options.targetLanguage ||
    missingTargets === 0;

  return (
    <Modal
      title="Run translations"
      onClose={() => close(false)}
      className="max-w-3xl"
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
            disabled={disabled}
            onClick={() => close(options)}
          >
            Run translation
          </button>
        </div>
      }
    >
      <div className="grid gap-4 p-4 text-sm text-zinc-700">
        <div className="grid gap-3 sm:grid-cols-3">
          <LanguageSelect
            label="Source"
            value={options.sourceLanguage}
            groups={sourceLanguageGroups}
            emptyLabel="No detected languages"
            onChange={(sourceLanguage) =>
              setOptions((current) =>
                normaliseRunOptions({ ...current, sourceLanguage }),
              )
            }
          />
          <LanguageSelect
            label="Target"
            value={options.targetLanguage}
            groups={targetLanguageGroups}
            onChange={(targetLanguage) =>
              setOptions((current) =>
                normaliseRunOptions({ ...current, targetLanguage }),
              )
            }
          />
          <label className="grid gap-1">
            <span className="font-medium text-zinc-900">Runtime</span>
            <select
              className="rounded border border-zinc-300 bg-white p-2"
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

        <TranslationFiltersMenu
          filters={options.contentFilters}
          onChange={updateContentFilter}
        />

        <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
          <div className="font-medium text-zinc-900">
            {missingTargets} unique strings need translation
          </div>
          <div className="mt-1 text-zinc-500">
            Missing target-language values will be filled using{" "}
            {TRANSLATION_MODEL_ID}. Existing target values are left unchanged.
          </div>
        </div>

        {detectedLanguageCodes.length === 0 ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-900">
            No supported IIIF languages were detected in this manifest.
          </div>
        ) : null}

        {options.sourceLanguage === options.targetLanguage ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-900">
            Select different source and target languages.
          </div>
        ) : null}
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
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700">
        Filters
      </summary>
      <div className="absolute z-20 mt-1 grid w-56 gap-2 rounded border border-zinc-200 bg-white p-3 text-sm text-zinc-700 shadow-lg">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300"
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
            className="h-4 w-4 rounded border-zinc-300"
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

function LanguageSelect({
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
    <label className="grid gap-1">
      <span className="font-medium text-zinc-900">{label}</span>
      <select
        className="rounded border border-zinc-300 bg-white p-2"
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
