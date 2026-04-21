import type { Reference } from "@iiif/presentation-3";
import { Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import {
  type LayoutPanel,
  runBackgroundAction,
  useAppResource,
  useAvailableBackgroundActions,
  useBackgroundActionsStoreApi,
  useConfig,
  useEditingResource,
  useEditingResourceStack,
  usePluginRuntimeApi,
} from "@manifest-editor/shell";
import { type SVGProps, useEffect, useMemo, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { queueTranslationRunOptions } from "./background-action";
import {
  collectDetectedManifestLanguages,
  collectTranslationLanguageProgress,
  collectTranslationTargets,
  type TranslationLanguageProgress,
} from "./collection";
import {
  TRANSLATION_ACTION_ID,
  TRANSLATION_LANGUAGE_TAG_ACTION_ID,
  TRANSLATION_PLUGIN_ID,
  TRANSLATIONS_LEFT_PANEL_ID,
} from "./constants";
import { getLanguageLabel, getLanguageProgressLabel, M2M100_LANGUAGES } from "./languages";
import { getDefaultRunOptions, normaliseRunOptions, resolveSupportedLanguage } from "./options";
import type {
  TranslationContentFilters,
  TranslationOccurrence,
  TranslationPluginSettings,
  TranslationRunOptions,
  TranslationStatus,
  TranslationTarget,
} from "./types";
import { writeTranslationForOccurrence } from "./writeback";

export const translationsPanel: LayoutPanel = {
  id: TRANSLATIONS_LEFT_PANEL_ID,
  label: "Translations",
  icon: <TranslationsIcon />,
  render: () => <TranslationsPanel />,
};

export function TranslationsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.87 15.07l-2.54-2.51l.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17A15.9 15.9 0 0 1 9 11.35A15.34 15.34 0 0 1 6.69 8h-2c.7 1.56 1.66 3.02 2.81 4.28l-5.09 5.02L3.83 18L9 12.9l3.22 3.22l.65-1.05M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24z"
      />
    </svg>
  );
}

type FilterKey = "all" | "current" | "missing" | "existing" | "stale";
type LanguageOption = {
  value: string;
  label: string;
};
type LanguageOptionGroup = {
  label: string;
  options: LanguageOption[];
};

function TranslationsPanel() {
  const config = useConfig();
  const rootResource = useAppResource();
  const currentResource = useCurrentTranslationResource(rootResource as Reference);
  const plugins = usePluginRuntimeApi();
  const settings = plugins.getSettings<TranslationPluginSettings>(TRANSLATION_PLUGIN_ID);
  const defaults = useMemo(() => getDefaultRunOptions(config, settings), [config, settings]);
  const [options, setOptions] = useState<TranslationRunOptions>(defaults);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("missing");

  useEffect(() => {
    setOptions(defaults);
  }, [defaults.sourceLanguage, defaults.targetLanguage, defaults.runtime]);

  const detectedLanguages = useVaultSelector(
    (_state, vault) => collectDetectedManifestLanguages(vault, rootResource as any),
    [rootResource.id, rootResource.type],
  );
  const detectedLanguageCodes = useMemo(
    () => detectedLanguages.map((language) => language.language),
    [detectedLanguages],
  );
  const detectedLanguageKey = detectedLanguageCodes.join("|");

  useEffect(() => {
    if (!detectedLanguageCodes.length || detectedLanguageCodes.includes(options.sourceLanguage)) {
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

  const targets = useVaultSelector(
    (_state, vault) => collectTranslationTargets(vault, rootResource as any, options),
    [
      rootResource.id,
      rootResource.type,
      options.sourceLanguage,
      options.targetLanguage,
      options.runtime,
      options.contentFilters.annotationBodies,
      options.contentFilters.canvasLabels,
    ],
  );
  const currentResourceTargets = useVaultSelector(
    (_state, vault) => collectTranslationTargets(vault, currentResource, options),
    [
      currentResource.id,
      currentResource.type,
      options.sourceLanguage,
      options.targetLanguage,
      options.runtime,
      options.contentFilters.annotationBodies,
      options.contentFilters.canvasLabels,
    ],
  );
  const targetLanguageProgress = useVaultSelector(
    (_state, vault) => collectTranslationLanguageProgress(vault, rootResource as any, options, detectedLanguageCodes),
    [
      rootResource.id,
      rootResource.type,
      options.sourceLanguage,
      options.runtime,
      options.contentFilters.annotationBodies,
      options.contentFilters.canvasLabels,
      detectedLanguageKey,
    ],
  );
  const vault = useVault();
  const action = useTranslationAction();
  const languageTagAction = useTranslationLanguageTagAction();
  const store = useBackgroundActionsStoreApi();
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
  const unsupportedConfiguredLanguages = useMemo(
    () => (config.i18n?.availableLanguages || []).filter((language) => !resolveSupportedLanguage(language)),
    [config.i18n?.availableLanguages],
  );
  const counts = useMemo(() => getStatusCounts(targets), [targets]);
  const currentResourceCounts = useMemo(() => getStatusCounts(currentResourceTargets), [currentResourceTargets]);
  const busy = action?.instance?.status === "preparing" || action?.instance?.status === "running";
  const languageTagBusy =
    languageTagAction?.instance?.status === "preparing" || languageTagAction?.instance?.status === "running";
  const canRun =
    !!action &&
    !busy &&
    detectedLanguageCodes.length > 0 &&
    options.sourceLanguage !== options.targetLanguage &&
    counts.missing > 0;

  const updateOptions = (patch: Partial<TranslationRunOptions>) => {
    setOptions((current) => normaliseRunOptions({ ...current, ...patch }));
  };
  const updateContentFilter = (filter: keyof TranslationContentFilters, enabled: boolean) => {
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

  const runTranslation = () => {
    if (!action || !canRun) return;
    queueTranslationRunOptions(action.instanceKey, options);
    void runBackgroundAction({ store, context: action.context });
  };
  const runLanguageTagging = () => {
    if (!languageTagAction || languageTagBusy) return;
    void runBackgroundAction({ store, context: languageTagAction.context });
  };

  const filteredTargets = useMemo(() => {
    if (activeFilter === "current") return currentResourceTargets;
    if (activeFilter === "all") return targets;
    return targets.filter((t) => t.status === activeFilter);
  }, [targets, currentResourceTargets, activeFilter]);

  const filterTabs: Array<{
    key: FilterKey;
    label: string;
    count: number;
    title?: string;
  }> = [
    { key: "all", label: "All", count: targets.length },
    {
      key: "current",
      label: "Current resource",
      count: currentResourceCounts.total,
      title: `Current ${currentResource.type.toLowerCase()}`,
    },
    { key: "missing", label: "Missing", count: counts.missing },
    { key: "existing", label: "Done", count: counts.existing },
    { key: "stale", label: "Stale", count: counts.stale },
  ];

  return (
    <Sidebar>
      <SidebarHeader title="Translations" />
      <SidebarContent className="flex min-h-0 flex-col gap-0 p-0">
        {/* Controls */}
        <div className="flex flex-col gap-2 border-b border-zinc-100 p-3">
          <div className="flex items-end gap-1.5">
            <CompactLanguageSelect
              label="From"
              value={options.sourceLanguage}
              groups={sourceLanguageGroups}
              emptyLabel="No detected languages"
              onChange={(sourceLanguage) => updateOptions({ sourceLanguage })}
            />
            <span className="mb-[7px] text-zinc-300 select-none">→</span>
            <CompactLanguageSelect
              label="To"
              value={options.targetLanguage}
              groups={targetLanguageGroups}
              onChange={(targetLanguage) => updateOptions({ targetLanguage })}
            />
            <label className="grid shrink-0 gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Mode</span>
              <select
                className="rounded border border-zinc-200 bg-white py-[5px] px-2 text-xs text-zinc-700 focus:border-me-primary-500 focus:outline-none focus:ring-2 focus:ring-me-primary-500/20"
                value={options.runtime}
                onChange={(event) =>
                  updateOptions({
                    runtime: event.target.value as TranslationRunOptions["runtime"],
                  })
                }
              >
                <option value="auto">Auto</option>
                <option value="webgpu">WebGPU</option>
                <option value="wasm">WASM</option>
              </select>
            </label>
          </div>

          {unsupportedConfiguredLanguages.length ? (
            <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
              Unsupported languages: {unsupportedConfiguredLanguages.join(", ")}
            </div>
          ) : null}

          {detectedLanguageCodes.length === 0 ? (
            <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
              No supported IIIF languages were detected in this manifest.
            </div>
          ) : null}

          {options.sourceLanguage === options.targetLanguage ? (
            <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
              Choose different source and target languages.
            </div>
          ) : null}

          {/* Stats + Run */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[7rem] flex-1 text-xs text-zinc-500">
              {counts.missing > 0 && (
                <>
                  <span className="font-semibold text-amber-600">{counts.missing}</span> missing
                </>
              )}
              {counts.missing > 0 && counts.existing > 0 && <span className="text-zinc-300"> · </span>}
              {counts.existing > 0 && (
                <>
                  <span className="font-semibold text-green-600">{counts.existing}</span> done
                </>
              )}
              {counts.stale > 0 && (
                <>
                  <span className="text-zinc-300"> · </span>
                  <span className="font-semibold text-red-500">{counts.stale}</span> stale
                </>
              )}
              {targets.length === 0 && <span className="text-zinc-400">No strings found</span>}
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!languageTagAction || languageTagBusy}
              onClick={runLanguageTagging}
              title="Tag each canvas with its detected language"
            >
              {languageTagBusy ? (
                <>
                  <SpinnerIcon className="h-3 w-3 animate-spin" />
                  Tagging…
                </>
              ) : (
                <>
                  <TagIcon className="h-3 w-3" />
                  Tag languages
                </>
              )}
            </button>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded border border-me-primary-500 bg-me-primary-500 px-2.5 py-1.5 text-xs font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canRun}
              onClick={runTranslation}
              title={
                canRun ? `Translate ${counts.missing} missing string${counts.missing === 1 ? "" : "s"}` : undefined
              }
            >
              {busy ? (
                <>
                  <SpinnerIcon className="h-3 w-3 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <PlayIcon className="h-3 w-3" />
                  Translate
                </>
              )}
            </button>
            <TranslationFiltersMenu filters={options.contentFilters} onChange={updateContentFilter} />
          </div>
        </div>

        {/* Filter tabs */}
        {targets.length > 0 && (
          <div className="flex shrink-0 overflow-x-auto border-b border-zinc-100 bg-zinc-50/50">
            {filterTabs
              .filter((tab) => tab.key === "all" || tab.key === "current" || tab.count > 0)
              .map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors ${
                    activeFilter === tab.key
                      ? "-mb-px border-b-2 border-me-primary-500 text-me-primary-600"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                  title={tab.title}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  {tab.label}
                  <span className={`text-[10px] ${activeFilter === tab.key ? "text-me-primary-400" : "text-zinc-400"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
          </div>
        )}

        {/* Translation list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredTargets.length ? (
            filteredTargets.map((target) => (
              <TranslationTargetRow
                key={target.key}
                target={target}
                onSave={(value) => {
                  for (const occurrence of target.occurrences) {
                    writeTranslationForOccurrence({ vault }, occurrence, value);
                  }
                }}
              />
            ))
          ) : (
            <div className="px-4 py-8 text-center text-xs text-zinc-400">
              {targets.length === 0
                ? "No translatable strings found."
                : activeFilter === "current"
                  ? "No current resource strings."
                  : `No ${activeFilter} strings.`}
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function useTranslationAction() {
  return useAvailableAction(TRANSLATION_ACTION_ID);
}

function useTranslationLanguageTagAction() {
  return useAvailableAction(TRANSLATION_LANGUAGE_TAG_ACTION_ID);
}

function useAvailableAction(actionId: string) {
  const groups = useAvailableBackgroundActions();
  return useMemo(
    () => groups.flatMap((group) => group.actions).find((action) => action.definition.id === actionId) || null,
    [groups, actionId],
  );
}

function useCurrentTranslationResource(rootResource: Reference): Reference {
  const current = useEditingResource();
  const stack = useEditingResourceStack();

  return useMemo(() => {
    const resources = [current, ...stack]
      .map((item) => item?.resource?.source)
      .filter((resource): resource is Reference => {
        return !!resource?.id && !!resource.type;
      });
    const canvas = resources.find((resource) => resource.type === "Canvas");
    const manifest = resources.find((resource) => resource.type === "Manifest");
    const selected = canvas || manifest || rootResource;

    return {
      id: selected.id,
      type: selected.type,
    } as Reference;
  }, [current, stack, rootResource]);
}

function TranslationTargetRow({ target, onSave }: { target: TranslationTarget; onSave: (value: string) => void }) {
  const firstOccurrence = target.occurrences[0];
  const targetText = getTargetText(target.occurrences);
  const [draft, setDraft] = useState(targetText);
  const isDone = target.status === "existing" || target.status === "suggested";
  const [expanded, setExpanded] = useState(!isDone);

  useEffect(() => {
    setDraft(targetText);
  }, [targetText]);

  const save = () => {
    if (draft.trim() !== targetText.trim()) {
      onSave(draft);
    }
  };

  return (
    <div className={`border-b border-zinc-100 last:border-0 ${isDone && !expanded ? "opacity-60" : ""}`}>
      {/* Header — always visible, click to expand/collapse */}
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-zinc-50/80 focus:outline-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-zinc-800">
            {firstOccurrence?.resource.label || firstOccurrence?.resource.id}
          </span>
          <span className="text-[11px] text-zinc-400">
            {firstOccurrence?.propertyLabel || "String"}
            {target.occurrences.length > 1 ? ` · ${target.occurrences.length}×` : ""}
          </span>
        </div>
        <StatusDot status={target.status} />
        <ChevronIcon expanded={expanded} />
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-3 pb-3">
          {/* Source text — clearly labelled, easy to read */}
          <div className="mb-2 rounded border border-zinc-100 bg-zinc-50 px-2.5 py-2 text-xs leading-relaxed text-zinc-700">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-me-primary-400">Source</div>
            {target.sourceText}
          </div>
          <textarea
            className="w-full min-h-[2.5rem] [field-sizing:content] rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 transition-colors placeholder:text-zinc-300 focus:border-me-primary-500 focus:outline-none focus:ring-2 focus:ring-me-primary-500/20"
            value={draft}
            placeholder={`${getLanguageLabel(target.targetLanguage)} translation…`}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
          />
        </div>
      )}
    </div>
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
            onChange={(event) => onChange("annotationBodies", event.currentTarget.checked)}
          />
          Annotation bodies
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-zinc-300"
            checked={filters.canvasLabels}
            onChange={(event) => onChange("canvasLabels", event.currentTarget.checked)}
          />
          Canvas labels
        </label>
      </div>
    </details>
  );
}

function createTargetLanguageGroups(progress: TranslationLanguageProgress[]): LanguageOptionGroup[] {
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
    options: M2M100_LANGUAGES.filter((language) => !detectedLanguageCodes.has(language.code)).map((language) => ({
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
  const hasValue = groups.some((group) => group.options.some((option) => option.value === value));

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

const statusDotConfig: Record<TranslationStatus, { dot: string; label: string; text: string }> = {
  missing: { dot: "bg-amber-400", text: "text-amber-700", label: "Missing" },
  existing: { dot: "bg-green-400", text: "text-green-700", label: "Done" },
  stale: { dot: "bg-red-400", text: "text-red-600", label: "Stale" },
  suggested: { dot: "bg-sky-400", text: "text-sky-700", label: "Suggested" },
  skipped: { dot: "bg-zinc-300", text: "text-zinc-500", label: "Skipped" },
};

function StatusDot({ status }: { status: TranslationStatus }) {
  const c = statusDotConfig[status] || statusDotConfig.skipped;
  return (
    <span className={`flex shrink-0 items-center gap-1 text-[10px] font-medium ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-zinc-300 transition-transform ${expanded ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.59 13.41 12.58 5.4A2 2 0 0 0 11.17 4H5a1 1 0 0 0-1 1v6.17a2 2 0 0 0 .59 1.41l8.01 8.01a2 2 0 0 0 2.82 0l5.17-5.17a2 2 0 0 0 0-2.82ZM7.5 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function getStatusCounts(targets: TranslationTarget[]) {
  return targets.reduce(
    (counts, target) => {
      counts.total += 1;
      counts[target.status] = (counts[target.status] || 0) + 1;
      return counts;
    },
    {
      total: 0,
      missing: 0,
      existing: 0,
      suggested: 0,
      skipped: 0,
      stale: 0,
    } as Record<TranslationTarget["status"] | "total", number>,
  );
}

function getTargetText(occurrences: TranslationOccurrence[]) {
  for (const occurrence of occurrences) {
    if (occurrence.targetText?.trim()) {
      return occurrence.targetText;
    }
  }
  return "";
}
