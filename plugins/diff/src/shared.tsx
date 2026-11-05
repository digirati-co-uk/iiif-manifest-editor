import { useAppResource } from "@manifest-editor/shell";
import type { ResourceChange } from "@iiif/helpers/diff";
import { useCallback, useMemo, type ButtonHTMLAttributes, type ReactNode, type SVGProps } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { useStore } from "zustand";
import { changesToUndo, compareDocuments, redoActions, undoActions } from "./comparison";
import { createUndoneEntry, type UndoneEntry } from "./undone";
import { getDiffStore } from "./store";

export const DIFF_SIDEBAR = "@manifest-editor/diff/sidebar";
export const DIFF_MAIN = "@manifest-editor/diff/main";

const noChanges: ResourceChange[] = [];

/** Horizontal rhythm of the main page: one gutter, then each nesting level lines up under its parent's title. */
export const GUTTER = 20;
export const CHEVRON = 20; // 12px chevron + 8px gap


export function useDiffStore() {
  const resource = useAppResource();
  const vault = useVault();
  return useMemo(() => getDiffStore(vault, resource.id), [vault, resource.id]);
}

export function useDiff() {
  const resource = useAppResource();
  const store = useDiffStore();
  const state = useStore(store);
  // Recompute on nested resource edits as well as edits to the root.
  const document = useVaultSelector(
    (_state, vault) => JSON.stringify(vault.toPresentation3({ id: resource.id, type: resource.type } as any)),
    [resource.id, resource.type]
  );
  const comparison = useMemo(() => {
    if (!state.source) return undefined;
    try {
      return {
        ...compareDocuments(
          state.source.state,
          JSON.parse(document),
          { id: resource.id, type: resource.type },
          state.ignoreOrder
        ),
        error: undefined,
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to compare these resources." };
    }
  }, [document, resource.id, resource.type, state.source, state.ignoreOrder]);
  const changes = comparison && "diff" in comparison ? comparison.diff.changes : noChanges;
  const patch = comparison && "patch" in comparison ? comparison.patch : null;
  const sameRoot = comparison && "sameRoot" in comparison ? comparison.sameRoot : true;
  const vault = useVault();
  const apply = useCallback(
    (actions: ReturnType<typeof undoActions>) =>
      vault.batch(() => {
        // The helpers diff and the Vault ship matching action shapes from separate type declarations.
        for (const action of actions) vault.dispatch(action as any);
      }),
    [vault]
  );
  const undo = useCallback(
    (change: ResourceChange) => {
      if (!comparison || !("current" in comparison) || !state.source) return;
      try {
        const { diff } = comparison;
        const actions = undoActions(comparison.current, diff, diff.changes, change);
        apply(actions);
        store.getState().addUndone(createUndoneEntry(state.source.url, diff, change, changesToUndo(diff.changes, change)));
        store.getState().update({ notice: undefined });
      } catch {
        // The diff checks that the editor still holds the value it was computed from before touching anything.
        store.getState().update({ notice: "This change could not be undone because the document has moved on." });
      }
    },
    [comparison, state.source, apply, store]
  );
  const redo = useCallback(
    (entry: UndoneEntry) => {
      if (!comparison || !("current" in comparison)) return;
      try {
        apply(redoActions(comparison.current, entry));
        store.getState().removeUndone(entry.id);
        store.getState().update({ notice: undefined });
      } catch {
        store.getState().update({ notice: "This change could not be redone because that part of the document has been edited since." });
      }
    },
    [comparison, apply, store]
  );
  // Only entries made against the source currently loaded are meaningful.
  const undone = useMemo(
    () => state.undone.filter((entry) => entry.sourceUrl === state.source?.url),
    [state.undone, state.source?.url]
  );
  return { ...state, comparison, changes, patch, sameRoot, undo, redo, undone };
}

export type ChangeKind = ResourceChange["kind"];

export const kindMeta: Record<ChangeKind, { label: string; dot: string; badge: string }> = {
  add: { label: "Added", dot: "bg-green-500", badge: "bg-green-50 text-green-700 ring-green-600/20" },
  remove: { label: "Removed", dot: "bg-red-500", badge: "bg-red-50 text-red-700 ring-red-600/20" },
  replace: { label: "Changed", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  reorder: { label: "Reordered", dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 ring-sky-600/20" },
};

export function countKinds(changes: ResourceChange[]) {
  const counts: Record<ChangeKind, number> = { add: 0, remove: 0, replace: 0, reorder: 0 };
  for (const change of changes) counts[change.kind]++;
  return counts;
}

export function groupByResource(changes: ResourceChange[]) {
  const groups = new Map<string, ResourceChange[]>();
  for (const change of changes) {
    const key = `${change.resource.type} ${change.resource.id}`;
    const group = groups.get(key);
    if (group) group.push(change);
    else groups.set(key, [change]);
  }
  return [...groups.values()];
}

/** The tail of an ID is what distinguishes resources; the full ID is available as a tooltip. */
export function shortId(id: string) {
  const trimmed = id.replace(/\/+$/, "");
  const parts = trimmed.split("/");
  if (parts.length <= 3) return trimmed.replace(/^https?:\/\//, "");
  const tail = parts.slice(-2).join("/");
  return `…/${tail}`;
}

export function ChangePath({ path, className = "" }: { path: string[]; className?: string }) {
  if (!path.length) return <span className={`italic text-gray-500 ${className}`}>Entire resource</span>;
  return (
    <span className={`min-w-0 truncate ${className}`} title={path.join(" › ")}>
      {path.map((segment, index) => (
        <span key={index}>
          {index > 0 && <span className="px-0.5 text-gray-400">›</span>}
          <span className={index === path.length - 1 ? "font-medium text-gray-900" : "text-gray-500"}>{segment}</span>
        </span>
      ))}
    </span>
  );
}

export function KindDot({ kind }: { kind: ChangeKind }) {
  return <span aria-hidden="true" className={`inline-block size-2 shrink-0 rounded-full ${kindMeta[kind].dot}`} />;
}

export function KindBadge({ kind }: { kind: ChangeKind }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium leading-none ring-1 ring-inset ${kindMeta[kind].badge}`}
    >
      {kindMeta[kind].label}
    </span>
  );
}

/** Rounded outline button for per-change actions (Open, Undo, Redo). */
export function PillButton({
  icon,
  children,
  ...props
}: { icon?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-solid border-gray-300 bg-white px-3 py-0.5 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500 disabled:opacity-50"
    >
      {icon}
      {children}
    </button>
  );
}

export function UndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

export function RedoIcon(props: SVGProps<SVGSVGElement>) {
  return <UndoIcon {...props} style={{ transform: "scaleX(-1)" }} />;
}

export function OpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 20h16M4 4h16M15 9l3 3-3 3M6 12h12" />
    </svg>
  );
}

export function DiffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 3v12a4 4 0 0 0 4 4h4M5 3 2 6m3-3 3 3M19 21V9a4 4 0 0 0-4-4h-4m8 16-3-3m3 3 3-3" />
    </svg>
  );
}

export function ReloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />
    </svg>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.8 2.8L16 9.5" />
    </svg>
  );
}
