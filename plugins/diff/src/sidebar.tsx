import { ActionButton, Sidebar, SidebarContent, SidebarHeader, Spinner } from "@manifest-editor/components";
import { useLayoutActions } from "@manifest-editor/shell";
import { useMemo, useState } from "react";
import { Collapsible } from "./collapsible";
import {
  ChangePath,
  CheckCircleIcon,
  CHEVRON,
  countKinds,
  DIFF_MAIN,
  groupByResource,
  KindDot,
  kindMeta,
  ReloadIcon,
  shortId,
  useDiff,
  type ChangeKind,
} from "./shared";

const PAD = 12;
const rule = "1px solid #e5e7eb";
const hairline = "1px solid #f3f4f6";

const inputClass =
  "min-w-0 flex-1 rounded-none border-0 border-b border-b-me-gray-500 bg-me-gray-100 px-2 py-1.5 text-sm text-gray-900 outline-0 placeholder:text-gray-400 focus:border-b-me-primary-500 focus:bg-[#ECEEF5] focus:ring-0";

function SourceBar({ state }: { state: ReturnType<typeof useDiff> }) {
  const [editing, setEditing] = useState(false);
  const showForm = editing || !state.source;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setEditing(false);
    void state.load();
  };

  if (!showForm && state.source) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ padding: `8px ${PAD}px`, borderBottom: rule }}>
        <span className="shrink-0 font-medium uppercase tracking-wide text-gray-500">Source</span>
        <span className="min-w-0 flex-1 truncate text-gray-700" title={state.source.url}>
          {state.source.url.replace(/^https?:\/\//, "")}
        </span>
        <button
          type="button"
          className="shrink-0 rounded px-1 text-me-700 hover:bg-me-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500"
          onClick={() => setEditing(true)}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2" style={{ padding: `12px ${PAD}px`, borderBottom: rule }}>
      <label htmlFor="diff-source-url" className="text-xs font-medium uppercase tracking-wide text-gray-500">
        Source to compare against
      </label>
      <div className="flex items-stretch gap-2">
        <input
          id="diff-source-url"
          type="url"
          required
          value={state.url}
          onChange={(event) => state.update({ url: event.target.value })}
          placeholder="https://example.org/manifest.json"
          className={inputClass}
        />
        <ActionButton primary type="submit" isDisabled={state.loading} className="justify-center px-3">
          {state.loading ? <Spinner className="size-3.5" /> : "Compare"}
        </ActionButton>
      </div>
      {state.error ? (
        <p role="alert" className="m-0 text-xs text-red-700">
          {state.error} Check the URL and that the server allows cross-origin requests.
        </p>
      ) : state.loading ? (
        <p className="m-0 text-xs text-gray-500">Looking for source…</p>
      ) : (
        <p className="m-0 text-xs text-gray-500">
          A published copy of this resource. Edits you make are compared live against it.
        </p>
      )}
    </form>
  );
}

function Summary({ state }: { state: ReturnType<typeof useDiff> }) {
  const counts = useMemo(() => countKinds(state.changes), [state.changes]);
  const kinds = (Object.keys(kindMeta) as ChangeKind[]).filter((kind) => counts[kind] > 0);
  return (
    <div className="flex flex-col gap-2" style={{ padding: `8px ${PAD}px`, borderBottom: rule }}>
      <div className="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700" aria-live="polite">
        {kinds.length === 0 ? (
          <span className="flex items-center gap-1.5 text-green-700">
            <CheckCircleIcon className="size-4" /> No differences
          </span>
        ) : (
          kinds.map((kind) => (
            <span key={kind} className="flex items-center gap-1.5">
              <KindDot kind={kind} />
              <span className="font-semibold tabular-nums text-gray-900">{counts[kind]}</span>
              {kindMeta[kind].label.toLowerCase()}
            </span>
          ))
        )}
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-gray-600 select-none">
          <input
            type="checkbox"
            className="size-3.5 rounded accent-me-600"
            checked={state.ignoreOrder}
            onChange={(event) => state.update({ ignoreOrder: event.target.checked })}
          />
          Ignore order
        </label>
      </div>
      {!state.sameRoot && (
        <p className="m-0 rounded border border-solid border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
          Root IDs differ, so resources match by type and ID. Unified export is unavailable.
        </p>
      )}
    </div>
  );
}

export function DiffSidebar() {
  const state = useDiff();
  const actions = useLayoutActions();
  const groups = useMemo(() => groupByResource(state.changes), [state.changes]);
  const error = state.comparison?.error;

  return (
    <Sidebar>
      <SidebarHeader
        title="Diff"
        actions={[
          {
            id: "diff-reload",
            icon: state.loading ? <Spinner /> : <ReloadIcon />,
            title: "Reload source",
            disabled: state.loading || !state.url.trim(),
            onClick: () => void state.load(),
          },
        ]}
      />
      <SidebarContent>
        <SourceBar state={state} />
        {error && (
          <p role="alert" className="m-0 text-xs text-red-700" style={{ padding: `8px ${PAD}px` }}>
            {error}
          </p>
        )}
        {state.source && !error && <Summary state={state} />}
        {groups.map((group) => {
          const { resource } = group[0]!;
          return (
            <Collapsible
              key={`${resource.type} ${resource.id}`}
              style={{ borderBottom: rule }}
              reveal={group.some((change) => change.id === state.selected)}
              headerClassName="sticky top-0 z-[1] bg-gray-50/95 text-xs backdrop-blur"
              headerStyle={{ padding: `6px ${PAD}px`, borderBottom: hairline }}
              title={
                <>
                  <span className="font-semibold text-gray-800">{resource.type}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-gray-500" title={resource.id}>
                    {shortId(resource.id)}
                  </span>
                  <span className="tabular-nums text-gray-400">{group.length}</span>
                </>
              }
            >
              <ul>
                {group.map((change) => {
                  const selected = state.selected === change.id;
                  return (
                    <li key={change.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        title={kindMeta[change.kind].label}
                        onClick={() => {
                          state.update({ selected: change.id });
                          actions.centerPanel.open({ id: DIFF_MAIN });
                        }}
                        className={`flex w-full items-center gap-2 border-0 py-1.5 text-start text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-me-primary-500 ${
                          selected ? "bg-me-50" : "bg-transparent hover:bg-me-gray-100"
                        }`}
                        style={{
                          // The selection bar sits in the gutter, so unselected rows keep the same text alignment.
                          padding: `6px ${PAD}px 6px ${PAD + CHEVRON - 2}px`,
                          borderLeft: `2px solid ${selected ? "#b84c74" : "transparent"}`,
                        }}
                      >
                        <KindDot kind={change.kind} />
                        <ChangePath path={change.path} className="flex-1" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
