import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import {
  type LayoutPanel,
  type PluginMetadata,
  type SpecificationReportItem,
  type SpecificationReportStatus,
  useAppResource,
  useEditingResource,
  useEditingResourceStack,
  useLayoutActions,
  useSpecificationReport,
  useSpecifications,
} from "@manifest-editor/shell";
import { type SVGProps, useMemo, useState } from "react";

export default {
  id: "@manifest-editor/specifications",
  label: "Specifications",
  description: "Review project specifications and required Manifest work.",
  author: "Digirati",
  official: true,
  defaultEnabled: false,
  tags: ["specifications", "guidance", "validation"],
  supports: {
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const leftPanels: LayoutPanel[] = [
  {
    id: "manifest-specifications",
    label: "Specifications",
    icon: <SpecificationsIcon />,
    render: () => <SpecificationsPanel />,
  },
];

function SpecificationsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6 22q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h9l5 5v13q0 .825-.587 1.413T18 22zm8-14V4H6v16h12V8zm-6 4h8v-2H8zm0 4h8v-2H8zm0-8h4V6H8z"
      />
    </svg>
  );
}

function SpecificationsPanel() {
  const specifications = useSpecifications();
  const report = useSpecificationReport();
  const actions = useLayoutActions();
  const rootResource = useAppResource() as ResourceReference;
  const currentResource = useCurrentSpecificationResource(rootResource);
  const [activeScope, setActiveScope] = useState<ScopeFilter>("current");
  const [ruleTypeFilter, setRuleTypeFilter] = useState<RuleTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [hideCompleted, setHideCompleted] = useState(false);
  const currentResourceResults = useMemo(
    () =>
      report.results.filter((result) =>
        resultAppliesToResource(result, currentResource, rootResource),
      ),
    [
      report.results,
      currentResource.id,
      currentResource.type,
      rootResource.id,
      rootResource.type,
    ],
  );
  const scopedResults =
    activeScope === "current" ? currentResourceResults : report.results;
  const filteredResults = useMemo(
    () =>
      scopedResults.filter((result) =>
        resultMatchesFilters(result, {
          ruleTypeFilter,
          statusFilter,
          hideCompleted,
        }),
      ),
    [scopedResults, ruleTypeFilter, statusFilter, hideCompleted],
  );
  const scopedCounts = useMemo(
    () => countStatuses(scopedResults),
    [scopedResults],
  );
  const totalActionable = scopedResults.filter(isActionable).length;
  const ruleTypeOptions = useMemo(
    () => createRuleTypeOptions(scopedResults),
    [scopedResults],
  );
  const statusOptions = useMemo(
    () => createStatusOptions(scopedResults, statusFilter),
    [scopedResults, statusFilter],
  );
  const filtersActive =
    ruleTypeFilter !== "all" || statusFilter !== "all" || hideCompleted;
  const scopeTabs: Array<{
    key: ScopeFilter;
    label: string;
    count: number;
    title?: string;
  }> = [
    {
      key: "current",
      label: "Current resource",
      count: currentResourceResults.length,
      title: `Current ${currentResource.type.toLowerCase()}`,
    },
    { key: "all", label: "All rules", count: report.results.length },
  ];

  function clearFilters() {
    setRuleTypeFilter("all");
    setStatusFilter("all");
    setHideCompleted(false);
  }

  function openResult(result: SpecificationReportItem) {
    const editorTarget = result.editorTarget;
    const resource = editorTarget?.resource || result.target;
    if (!resource) return;

    if (resource.type === "Canvas") {
      actions.open("current-canvas");
    }

    actions.edit(resource, undefined, {
      forceOpen: true,
      selectedTab: editorTarget?.selectedTab,
      property: editorTarget?.propertyPath?.[0],
    });
  }

  return (
    <Sidebar>
      <SidebarHeader title="Specifications" />
      <SidebarContent className="flex min-h-0 flex-col gap-0 p-0">
        {!specifications.length ? (
          <div className="m-4 rounded border border-gray-200 bg-white p-3 text-sm text-gray-600">
            No specifications are configured for this editor instance. Use the
            Specification selector in the editor header to choose one.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-zinc-100 p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <SummaryMetric
                  label="Done"
                  value={scopedCounts.satisfied}
                  tone="success"
                />
                <SummaryMetric
                  label="Open"
                  value={totalActionable}
                  tone={totalActionable ? "warning" : "success"}
                />
                <SummaryMetric
                  label="Skipped"
                  value={scopedCounts["not-applicable"]}
                  tone="neutral"
                />
              </div>

              <div className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700">
                <div className="font-medium text-gray-900">
                  {specifications.length} specification
                  {specifications.length === 1 ? "" : "s"}
                </div>
                <div className="mt-1">
                  {report.results.length} rule result
                  {report.results.length === 1 ? "" : "s"} checked in order.
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {specifications.map((specification) => (
                  <div
                    className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700"
                    key={specification.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-gray-900">
                        {specification.label}
                      </div>
                      {specification.version ? (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                          v{specification.version}
                        </span>
                      ) : null}
                    </div>
                    {specification.description ? (
                      <div className="mt-1 text-gray-600">
                        {specification.description}
                      </div>
                    ) : null}
                    <div className="mt-2 text-[11px] text-gray-400">
                      {specification.rules.length} rule
                      {specification.rules.length === 1 ? "" : "s"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <CompactSelect
                    label="Rule"
                    value={ruleTypeFilter}
                    options={ruleTypeOptions}
                    onChange={(value) =>
                      setRuleTypeFilter(value as RuleTypeFilter)
                    }
                  />
                  <CompactSelect
                    label="Status"
                    value={statusFilter}
                    options={statusOptions}
                    onChange={(value) => setStatusFilter(value as StatusFilter)}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                    <input
                      className="h-4 w-4 rounded border-zinc-300 text-me-primary-500 focus:ring-me-primary-500"
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(event) =>
                        setHideCompleted(event.currentTarget.checked)
                      }
                    />
                    Hide completed items
                  </label>
                  {filtersActive ? (
                    <button
                      className="text-xs font-medium text-me-primary-600 hover:underline"
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 overflow-x-auto border-b border-zinc-100 bg-zinc-50/50">
              {scopeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors ${
                    activeScope === tab.key
                      ? "-mb-px border-b-2 border-me-primary-500 text-me-primary-600"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                  title={tab.title}
                  onClick={() => setActiveScope(tab.key)}
                >
                  {tab.label}
                  <span
                    className={`text-[10px] ${
                      activeScope === tab.key
                        ? "text-me-primary-400"
                        : "text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {filteredResults.length ? (
                <div className="flex flex-col gap-2">
                  {filteredResults.map((result) => (
                    <SpecificationResultCard
                      key={result.id}
                      result={result}
                      onOpen={() => openResult(result)}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-xs text-zinc-400">
                  {getEmptyResultsMessage({
                    activeScope,
                    currentResource,
                    scopedResults,
                    filtersActive,
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

type ScopeFilter = "current" | "all";
type ResourceReference = { id: string; type: string };
type RuleTypeFilter = "all" | SpecificationReportItem["ruleType"];
type StatusFilter = "all" | "attention" | SpecificationReportStatus;
type SelectOption = {
  value: string;
  label: string;
  count: number;
};

const emptyStatusCounts: Record<SpecificationReportStatus, number> = {
  satisfied: 0,
  missing: 0,
  invalid: 0,
  disallowed: 0,
  "not-applicable": 0,
};

const ruleTypeLabels: Record<SpecificationReportItem["ruleType"], string> = {
  "disallow-property": "Disallowed properties",
  "require-non-empty": "Required fields",
  "fixed-value": "Fixed values",
  "iiif:canvas-with-image-service": "Image service canvas",
  "iiif:thumbnail-from-body-service": "Thumbnail source",
  "iiif:valid-rights": "Rights",
  "iiif:required-statement": "Required statement",
  "iiif:metadata-template": "Metadata template",
};

function useCurrentSpecificationResource(
  rootResource: ResourceReference,
): ResourceReference {
  const current = useEditingResource();
  const stack = useEditingResourceStack();

  return useMemo(() => {
    const resources = [current, ...stack]
      .map((item) => item?.resource?.source)
      .filter((resource): resource is ResourceReference => {
        return !!resource?.id && !!resource.type;
      });
    const canvas = resources.find((resource) => resource.type === "Canvas");
    const manifest = resources.find((resource) => resource.type === "Manifest");
    const selected = canvas || manifest || rootResource;

    return {
      id: selected.id,
      type: selected.type,
    } as ResourceReference;
  }, [current, stack, rootResource]);
}

function resultAppliesToResource(
  result: SpecificationReportItem,
  resource: ResourceReference,
  rootResource: ResourceReference,
) {
  if (referencesEqual(result.target, resource)) return true;
  if (referencesEqual(result.editorTarget?.resource, resource)) return true;

  const hasSpecificResource = result.target || result.editorTarget?.resource;
  return !hasSpecificResource && referencesEqual(resource, rootResource);
}

function referencesEqual(
  a: ResourceReference | null | undefined,
  b: ResourceReference | null | undefined,
) {
  return !!a && !!b && a.id === b.id && a.type === b.type;
}

function resultMatchesFilters(
  result: SpecificationReportItem,
  filters: {
    ruleTypeFilter: RuleTypeFilter;
    statusFilter: StatusFilter;
    hideCompleted: boolean;
  },
) {
  if (filters.hideCompleted && result.status === "satisfied") return false;
  if (
    filters.ruleTypeFilter !== "all" &&
    result.ruleType !== filters.ruleTypeFilter
  ) {
    return false;
  }
  if (filters.statusFilter === "all") return true;
  if (filters.statusFilter === "attention") return isActionable(result);
  return result.status === filters.statusFilter;
}

function isActionable(result: SpecificationReportItem) {
  return result.status !== "satisfied" && result.status !== "not-applicable";
}

function countStatuses(results: SpecificationReportItem[]) {
  const counts = { ...emptyStatusCounts };
  for (const result of results) {
    counts[result.status] += 1;
  }
  return counts;
}

function createRuleTypeOptions(
  results: SpecificationReportItem[],
): SelectOption[] {
  const counts = new Map<SpecificationReportItem["ruleType"], number>();
  for (const result of results) {
    counts.set(result.ruleType, (counts.get(result.ruleType) || 0) + 1);
  }

  return [
    { value: "all", label: "All rule types", count: results.length },
    ...Object.entries(ruleTypeLabels)
      .map(([value, label]) => ({
        value,
        label,
        count: counts.get(value as SpecificationReportItem["ruleType"]) || 0,
      }))
      .filter((option) => option.count > 0),
  ];
}

function createStatusOptions(
  results: SpecificationReportItem[],
  activeStatus: StatusFilter,
): SelectOption[] {
  const counts = countStatuses(results);
  const options: SelectOption[] = [
    { value: "all", label: "All statuses", count: results.length },
    {
      value: "attention",
      label: "Needs work",
      count: results.filter(isActionable).length,
    },
    { value: "missing", label: "Missing", count: counts.missing },
    { value: "invalid", label: "Invalid", count: counts.invalid },
    { value: "disallowed", label: "Disallowed", count: counts.disallowed },
    { value: "satisfied", label: "Done", count: counts.satisfied },
    {
      value: "not-applicable",
      label: "Skipped",
      count: counts["not-applicable"],
    },
  ];

  return options.filter(
    (option) =>
      option.value === "all" ||
      option.value === activeStatus ||
      option.count > 0,
  );
}

function getEmptyResultsMessage({
  activeScope,
  currentResource,
  scopedResults,
  filtersActive,
}: {
  activeScope: ScopeFilter;
  currentResource: ResourceReference;
  scopedResults: SpecificationReportItem[];
  filtersActive: boolean;
}) {
  if (filtersActive) return "No rules match these filters.";
  if (scopedResults.length === 0 && activeScope === "current") {
    return `No rules target the current ${currentResource.type.toLowerCase()}.`;
  }
  return "No rule results found.";
}

function CompactSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <select
        className="min-w-0 rounded border border-zinc-200 bg-white px-2 py-[5px] text-xs text-zinc-700 focus:border-me-primary-500 focus:outline-none focus:ring-2 focus:ring-me-primary-500/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "neutral";
}) {
  const className =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-gray-200 bg-gray-50 text-gray-800";

  return (
    <div className={`rounded border p-2 ${className}`}>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function SpecificationResultCard({
  result,
  onOpen,
}: {
  result: SpecificationReportItem;
  onOpen: () => void;
}) {
  const badgeClass = getBadgeClass(result.status);

  return (
    <div className="rounded border border-gray-200 bg-white p-3 text-sm">
      <div className="flex items-start gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${badgeClass}`}
        >
          {result.status.replace("-", " ")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900">{result.ruleLabel}</div>
          <div className="mt-1 text-gray-600">{result.message}</div>
          <div className="mt-1 truncate text-[11px] text-gray-400">
            {result.specificationLabel}
          </div>
        </div>
      </div>

      {result.editorTarget || result.target ? (
        <button
          className="mt-3 text-sm font-medium text-me-primary-600 hover:underline"
          type="button"
          onClick={onOpen}
        >
          Open field
        </button>
      ) : null}
    </div>
  );
}

function getBadgeClass(status: SpecificationReportItem["status"]) {
  switch (status) {
    case "satisfied":
      return "bg-green-100 text-green-800";
    case "missing":
      return "bg-amber-100 text-amber-800";
    case "invalid":
    case "disallowed":
      return "bg-red-100 text-red-800";
    case "not-applicable":
      return "bg-gray-100 text-gray-700";
  }
}
