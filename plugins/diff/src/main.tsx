import type { ResourceChange } from "@iiif/helpers/diff";
import { ActionButton, CloseIcon, DownloadIcon, Spinner } from "@manifest-editor/components";
import { useLayoutActions } from "@manifest-editor/shell";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Collapsible, FoldContext } from "./collapsible";
import { getSourceVault } from "./source-vault";
import type { DiffView } from "./store";
import {
  ChangePath,
  CheckCircleIcon,
  countKinds,
  DiffIcon,
  groupByResource,
  KindBadge,
  KindDot,
  kindMeta,
  shortId,
  CHEVRON,
  GUTTER,
  OpenIcon,
  PillButton,
  RedoIcon,
  UndoIcon,
  useDiff,
  type ChangeKind,
} from "./shared";
import type { UndoneEntry } from "./undone";
import { DiffData, JsonPanes, RefCode, referenceLists, VisualChange } from "./values";

function download(patch: string) {
  const url = URL.createObjectURL(new Blob([patch], { type: "text/x-diff;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "manifest.diff";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Placeholder({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="text-5xl text-gray-300">{icon}</div>
      <p className="font-medium text-gray-700">{title}</p>
      {children && <p className="max-w-sm text-sm text-gray-500">{children}</p>}
    </div>
  );
}

function lineClass(line: string) {
  if (line.startsWith("+++") || line.startsWith("---")) return "text-gray-500 font-medium";
  if (line.startsWith("@@")) return "bg-sky-50 text-sky-800";
  if (line.startsWith("+")) return "bg-green-50 text-green-900";
  if (line.startsWith("-")) return "bg-red-50 text-red-900";
  return "text-gray-700";
}

function Unified({ patch }: { patch: string }) {
  const lines = patch.split("\n");
  return (
    <pre aria-label="Unified diff" className="w-max min-w-full py-2 font-mono text-xs leading-5">
      {lines.map((line, index) => (
        <span key={index} className={`block ${lineClass(line)}`} style={{ padding: `0 ${GUTTER}px` }}>
          {line}
          {index < lines.length - 1 ? "\n" : ""}
        </span>
      ))}
    </pre>
  );
}

const hairline = "1px solid #f3f4f6";
const rule = "1px solid #e5e7eb";

function ChangeRow({
  change,
  view,
  selected,
  defaultOpen,
  first,
  canOpen,
  onUndo,
  onOpen,
}: {
  change: ResourceChange;
  view: DiffView;
  selected: boolean;
  defaultOpen: boolean;
  first: boolean;
  canOpen: boolean;
  onUndo: (change: ResourceChange) => void;
  onOpen: (change: ResourceChange) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView?.({ block: "center" });
  }, [selected]);
  const lists = referenceLists(change);
  return (
    <div
      ref={ref}
      className={selected ? "bg-me-50/60" : ""}
      style={{ borderTop: first ? undefined : hairline }}
    >
      <Collapsible
        defaultOpen={defaultOpen}
        reveal={selected}
        headerClassName="hover:bg-gray-50"
        headerStyle={{ padding: `4px ${GUTTER}px 4px ${GUTTER + CHEVRON}px` }}
        buttonClassName="py-1"
        title={
          <>
            <KindBadge kind={change.kind} />
            <ChangePath path={change.path} className="text-sm" />
            {lists && <span className="text-xs text-gray-400">{lists.after.length} items</span>}
          </>
        }
        actions={
          <span className="flex shrink-0 items-center gap-1.5">
            {canOpen && (
              <PillButton icon={<OpenIcon />} onClick={() => onOpen(change)} title="Edit this resource in the sidebar">
                Open
              </PillButton>
            )}
            <PillButton icon={<UndoIcon />} onClick={() => onUndo(change)} title="Restore the source value in the editor">
              Undo
            </PillButton>
          </span>
        }
      >
        <div style={{ padding: `4px ${GUTTER}px 16px ${GUTTER + CHEVRON * 2}px` }}>
          {view === "visual" ? (
            <VisualChange change={change} />
          ) : lists ? (
            <RefCode {...lists} />
          ) : (
            <JsonPanes change={change} />
          )}
        </div>
      </Collapsible>
    </div>
  );
}

function ResourceSection({
  group,
  view,
  selected,
  defaultOpen,
  canOpen,
  onUndo,
  onOpen,
}: {
  group: ResourceChange[];
  view: DiffView;
  selected?: string;
  defaultOpen: boolean;
  canOpen: boolean;
  onUndo: (change: ResourceChange) => void;
  onOpen: (change: ResourceChange) => void;
}) {
  const { resource } = group[0]!;
  const counts = useMemo(() => countKinds(group), [group]);
  return (
    <Collapsible
      className=""
      reveal={group.some((change) => change.id === selected)}
      headerClassName="sticky top-0 z-10 bg-gray-50/95 backdrop-blur"
      headerStyle={{ padding: `8px ${GUTTER}px`, borderBottom: rule }}
      title={
        <>
          <span className="text-sm font-semibold text-gray-900">{resource.type}</span>
          <span className="min-w-0 truncate font-mono text-xs text-gray-500" title={resource.id}>
            {shortId(resource.id)}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-2.5 text-xs text-gray-500">
            {(Object.keys(kindMeta) as ChangeKind[])
              .filter((kind) => counts[kind])
              .map((kind) => (
                <span key={kind} className="flex items-center gap-1" title={kindMeta[kind].label}>
                  <KindDot kind={kind} />
                  <span className="tabular-nums">{counts[kind]}</span>
                </span>
              ))}
          </span>
        </>
      }
    >
      <div style={{ borderBottom: rule }}>
        {group.map((change, index) => (
          <ChangeRow
            key={change.id}
            change={change}
            view={view}
            first={index === 0}
            selected={change.id === selected}
            defaultOpen={defaultOpen}
            canOpen={canOpen}
            onUndo={onUndo}
            onOpen={onOpen}
          />
        ))}
      </div>
    </Collapsible>
  );
}

/** Undone changes are kept as plain rows, with nothing to expand: just what it was and a way back. */
function UndoneSection({
  entries,
  onRedo,
  onForget,
}: {
  entries: UndoneEntry[];
  onRedo: (entry: UndoneEntry) => void;
  onForget: (entry: UndoneEntry) => void;
}) {
  return (
    <Collapsible
      headerClassName="bg-gray-50/95"
      headerStyle={{ padding: `8px ${GUTTER}px`, borderTop: rule, borderBottom: rule }}
      title={
        <>
          <span className="text-sm font-semibold text-gray-900">Undone</span>
          <span className="text-xs tabular-nums text-gray-500">{entries.length}</span>
        </>
      }
    >
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center gap-2 hover:bg-gray-50"
          style={{
            padding: `6px ${GUTTER}px 6px ${GUTTER + CHEVRON * 2}px`,
            borderTop: index === 0 ? undefined : hairline,
          }}
        >
          <KindBadge kind={entry.change.kind} />
          <ChangePath path={entry.change.path} className="text-sm" />
          <span className="min-w-0 flex-1 truncate text-xs text-gray-500" title={entry.change.resource.id}>
            {entry.change.resource.type}{" "}
            <span className="font-mono text-[11px] text-gray-400">{shortId(entry.change.resource.id)}</span>
            {entry.changeIds.length > 1 && ` · +${entry.changeIds.length - 1} related`}
          </span>
          <button
            type="button"
            onClick={() => onForget(entry)}
            title="Forget this change"
            className="shrink-0 border-0 bg-transparent px-1 text-xs text-gray-500 hover:text-gray-800"
          >
            Forget
          </button>
          <PillButton icon={<RedoIcon />} onClick={() => onRedo(entry)} title="Put this change back in the editor">
            Redo
          </PillButton>
        </div>
      ))}
    </Collapsible>
  );
}

function ViewToggle({
  view,
  count,
  canUnify,
  onChange,
}: {
  view: DiffView;
  count: number;
  canUnify: boolean;
  onChange: (view: DiffView) => void;
}) {
  const item = (id: DiffView, label: string, disabled = false) => (
    <button
      type="button"
      aria-pressed={view === id}
      disabled={disabled}
      title={disabled ? "Unified export requires matching root IDs." : undefined}
      onClick={() => onChange(id)}
      className={`whitespace-nowrap rounded px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500 ${
        view === id ? "bg-white font-medium text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex shrink-0 gap-0.5 rounded-md bg-me-gray-100 p-0.5">
      {item("changes", count ? `Changes · ${count}` : "Changes")}
      {item("visual", "Visual")}
      {item("unified", "Unified", !canUnify)}
    </div>
  );
}

function FoldButton({ onFold }: { onFold: (open: boolean) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <button
      type="button"
      onClick={() => {
        onFold(!open);
        setOpen(!open);
      }}
      className="shrink-0 whitespace-nowrap rounded px-2 py-1 text-xs text-gray-600 hover:bg-me-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500"
    >
      {open ? "Collapse all" : "Expand all"}
    </button>
  );
}

/** A full screen rather than a card: the page header, then one continuous document of collapsible sections. */
export function DiffMain() {
  const state = useDiff();
  const actions = useLayoutActions();
  const [fold, setFold] = useState({ open: true, tick: 0 });
  const error = state.comparison?.error;
  const { changes, patch } = state;
  // A stored "unified" preference falls back when this comparison cannot export a patch.
  const view: DiffView = patch === null && state.view === "unified" ? "changes" : state.view;
  const groups = useMemo(() => groupByResource(changes), [changes]);
  const openResource = (change: ResourceChange) =>
    actions.edit({ id: change.resource.id, type: change.resource.type }, undefined, { forceOpen: true });
  const data = useMemo(
    () => ({
      source: state.source?.state,
      current: state.comparison && "current" in state.comparison ? state.comparison.current : undefined,
      sourceVault: state.source ? () => getSourceVault(state.source!) : undefined,
    }),
    [state.source, state.comparison]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <header
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1"
        style={{ minHeight: 48, padding: `6px ${GUTTER}px`, borderBottom: rule }}
      >
        <h2 className="m-0 text-sm font-semibold text-gray-900">Diff</h2>
        {state.source && !error && (
          <>
            <ViewToggle
              view={view}
              count={changes.length}
              canUnify={patch !== null}
              onChange={(next) => state.update({ view: next })}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-gray-500" title={state.source.url}>
              Source <span aria-hidden="true">→</span> Current editor
            </span>
            {view !== "unified" && changes.length > 0 && (
              <FoldButton onFold={(open) => setFold((value) => ({ open, tick: value.tick + 1 }))} />
            )}
            <ActionButton className="shrink-0" isDisabled={!patch} onPress={() => patch && download(patch)}>
              <DownloadIcon /> Download .diff
            </ActionButton>
          </>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={actions.centerPanel.popStack}
          className="ml-auto rounded p-1.5 text-gray-600 hover:bg-me-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500"
        >
          <CloseIcon />
        </button>
      </header>
      {state.notice && (
        <p
          role="alert"
          className="m-0 shrink-0 bg-amber-50 text-xs text-amber-800"
          style={{ padding: `8px ${GUTTER}px`, borderBottom: "1px solid #fde68a" }}
        >
          {state.notice}
        </p>
      )}
      {!state.source ? (
        state.loading ? (
          <Placeholder icon={<Spinner />} title="Looking for source…" />
        ) : (
          <Placeholder icon={<DiffIcon />} title="No source loaded">
            Choose a published version in the sidebar to compare it with your current document.
          </Placeholder>
        )
      ) : error ? (
        <p role="alert" className="m-0 text-sm text-red-700" style={{ padding: GUTTER }}>
          {error}
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          {!changes.length ? (
            <div style={{ padding: "64px 0" }}>
              <Placeholder icon={<CheckCircleIcon />} title="No differences">
                Your document matches the source.
              </Placeholder>
            </div>
          ) : view === "unified" && patch !== null ? (
            <Unified patch={patch} />
          ) : (
            <DiffData.Provider value={data}>
              <FoldContext.Provider value={fold}>
                {groups.map((group) => (
                  <ResourceSection
                    key={`${group[0]!.resource.type} ${group[0]!.resource.id}`}
                    group={group}
                    view={view}
                    selected={state.selected}
                    // Long diffs start folded to the list of changes; short ones open straight onto their content.
                    defaultOpen={changes.length <= 24}
                    canOpen={!!data.current?.entities[group[0]!.resource.type]?.[group[0]!.resource.id]}
                    onUndo={state.undo}
                    onOpen={openResource}
                  />
                ))}
              </FoldContext.Provider>
            </DiffData.Provider>
          )}
          {state.undone.length > 0 && (
            <UndoneSection entries={state.undone} onRedo={state.redo} onForget={(entry) => state.removeUndone(entry.id)} />
          )}
          <div style={{ height: 96 }} />
        </div>
      )}
    </div>
  );
}
