import type { DiffState, DiffValue, ResourceChange } from "@iiif/helpers/diff";
import type { Vault } from "@iiif/helpers/vault";
import { CanvasThumbnailGridItem } from "@manifest-editor/components";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { LocaleString, VaultProvider } from "react-iiif-vault";
import { diffRefs, isReferenceList, segmentRefs, summarizeRefs, type Ref, type RefOp } from "./refs";
import { shortId } from "./shared";

/** What the value renderers can look up: resources on either side, and the source as a renderable Vault. */
export const DiffData = createContext<{ source?: DiffState; current?: DiffState; sourceVault?: () => Vault }>({});

function useEntity(ref: Ref) {
  const { source, current } = useContext(DiffData);
  const bucket = ref.type || "";
  return current?.entities[bucket]?.[ref.id] ?? source?.entities[bucket]?.[ref.id];
}

function hasLabel(entity: any): entity is { label: Record<string, string[]> } {
  return !!entity?.label && Object.keys(entity.label).length > 0;
}

function RefLabel({ reference }: { reference: Ref }) {
  const entity = useEntity(reference);
  return hasLabel(entity) ? (
    <LocaleString as="span">{entity.label}</LocaleString>
  ) : (
    <span className="font-mono text-xs text-gray-500">{shortId(reference.id)}</span>
  );
}

function valueList(value: DiffValue): Ref[] | undefined {
  if (!value.exists) return [];
  if (Array.isArray(value.value) && value.value.length === 0) return [];
  return isReferenceList(value.value) ? value.value : undefined;
}

/** Item-by-item view of a list of references, or undefined when this change is not one. */
export function referenceLists(change: ResourceChange) {
  const before = valueList(change.before);
  const after = valueList(change.after);
  if (!before || !after) return undefined;
  if (!before.length && !after.length) return undefined;
  return { before, after };
}

// Diff colours are shared by the code and visual renderings of a list so the two read as one thing.
const RED = { bg: "#fef2f2", ink: "#7f1d1d", edge: "#f87171" };
const GREEN = { bg: "#f0fdf4", ink: "#14532d", edge: "#22c55e" };

function RefSummary({ ops }: { ops: RefOp[] }) {
  const { moved, added, removed } = summarizeRefs(ops);
  const parts = [
    [moved, "moved"],
    [added, "added"],
    [removed, "removed"],
  ].filter(([count]) => count);
  return (
    <p className="mb-2 mt-0 text-xs text-gray-500">
      {parts.map(([count, label], index) => (
        <span key={label}>
          {index > 0 && " · "}
          <span className="font-medium text-gray-800">{count}</span> {label}
        </span>
      ))}
    </p>
  );
}

function FoldButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-0 bg-transparent p-0 text-xs text-gray-400 hover:text-gray-700"
    >
      ⋯ {count} unchanged
    </button>
  );
}

function useExpanded() {
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  return [expanded, (start: number) => setExpanded((value) => new Set(value).add(start))] as const;
}

/**
 * The changing items only, as the lines of code a text diff would show: `-` where an item was in the source, `+`
 * where it is now, and a little unchanged context. Context rows show both positions, so an item that was merely
 * pushed along by a move is visibly shifted too.
 */
export function RefCode({ before, after }: { before: Ref[]; after: Ref[] }) {
  const ops = useMemo(() => diffRefs(before, after), [before, after]);
  const [expanded, expand] = useExpanded();
  const segments = useMemo(() => segmentRefs(ops, 2, expanded), [ops, expanded]);
  const number = (value?: number) => (value === undefined ? "" : value + 1);
  return (
    <div>
      <RefSummary ops={ops} />
      <div className="font-mono text-xs leading-5">
        {segments.map((segment, index) =>
          segment.fold ? (
            <div key={`fold-${segment.start}`} style={{ paddingLeft: 100 }}>
              <FoldButton count={segment.ops.length} onClick={() => expand(segment.start)} />
            </div>
          ) : (
            segment.ops.map((op) => {
              const shifted = op.op === "equal" && op.from !== op.to;
              const tone = op.op === "del" ? RED : op.op === "ins" ? GREEN : undefined;
              return (
                <div
                  key={`${index}-${op.op}-${op.ref.id}`}
                  className="flex"
                  style={tone ? { background: tone.bg, color: tone.ink } : { color: "#4b5563" }}
                >
                  <span className="w-9 shrink-0 select-none pr-2 text-right text-gray-400">{number(op.from)}</span>
                  <span
                    className={`w-9 shrink-0 select-none pr-2 text-right ${shifted ? "font-semibold text-sky-700" : "text-gray-400"}`}
                  >
                    {number(op.to)}
                  </span>
                  <span className="w-5 shrink-0 select-none text-center">
                    {op.op === "ins" ? "+" : op.op === "del" ? "−" : ""}
                  </span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap pr-4" style={{ overflowWrap: "anywhere" }}>
                    {`{ "id": "${op.ref.id}", "type": "${op.ref.type ?? ""}" },`}
                    <RefComment reference={op.ref} />
                  </span>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}

function RefComment({ reference }: { reference: Ref }) {
  const entity = useEntity(reference);
  if (!hasLabel(entity)) return null;
  return (
    <span className="ml-3 text-gray-400">
      {"// "}
      <LocaleString as="span">{entity.label}</LocaleString>
    </span>
  );
}

const CELL = 96;

function Cell({ op, moved, side }: { op: RefOp; moved: boolean; side: "before" | "after" }) {
  const changed = op.op !== "equal";
  const tone = side === "before" ? RED : GREEN;
  const tag = !changed
    ? undefined
    : op.op === "del"
      ? moved
        ? "Moved away"
        : "Removed"
      : moved
        ? "Moved here"
        : "Added";
  const position = side === "before" ? op.from : op.to;
  const canvas = op.ref.type === "Canvas";
  return (
    <li style={{ width: CELL, listStyle: "none" }}>
      <div
        style={{
          borderRadius: 6,
          outline: changed ? `2px solid ${tone.edge}` : undefined,
          outlineOffset: 2,
          opacity: changed ? 1 : 0.55,
        }}
      >
        {canvas ? (
          <CanvasThumbnailGridItem id={op.ref.id} />
        ) : (
          <div
            className="flex items-center justify-center rounded border border-gray-200 bg-white p-2 text-center text-xs text-gray-700"
            style={{ height: CELL }}
          >
            <RefLabel reference={op.ref} />
          </div>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between gap-1 text-[11px] text-gray-500">
        <span className="tabular-nums">{position === undefined ? "" : `#${position + 1}`}</span>
        {tag && (
          <span className="rounded px-1 py-0.5 leading-none" style={{ background: tone.bg, color: tone.ink }}>
            {tag}
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * Source and current side by side, as the thumbnails the rest of the editor uses. Only the changing items and a
 * little context are shown: each strip is that side of the same diff the code view lists.
 */
export function RefVisual({ before, after }: { before: Ref[]; after: Ref[] }) {
  const { sourceVault } = useContext(DiffData);
  const ops = useMemo(() => diffRefs(before, after), [before, after]);
  const [expanded, expand] = useExpanded();
  const segments = useMemo(() => segmentRefs(ops, 2, expanded), [ops, expanded]);
  const movedIds = useMemo(() => {
    const deleted = new Set(ops.filter((op) => op.op === "del").map((op) => op.ref.id));
    return new Set(ops.filter((op) => op.op === "ins" && deleted.has(op.ref.id)).map((op) => op.ref.id));
  }, [ops]);

  const strip = (side: "before" | "after") => {
    const wanted = side === "before" ? "del" : "ins";
    const list = (
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "16px 14px", margin: 0, padding: 0 }}>
        {segments.map((segment) =>
          segment.fold ? (
            <li key={`fold-${segment.start}`} style={{ listStyle: "none", alignSelf: "center" }}>
              <FoldButton count={segment.ops.length} onClick={() => expand(segment.start)} />
            </li>
          ) : (
            segment.ops
              .filter((op) => op.op === "equal" || op.op === wanted)
              .map((op) => <Cell key={`${op.op}-${op.ref.id}`} op={op} moved={movedIds.has(op.ref.id)} side={side} />)
          )
        )}
      </ul>
    );
    return (
      <div style={{ minWidth: 0 }}>
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, borderRadius: 3, background: side === "before" ? RED.edge : GREEN.edge }}
          />
          {side === "before" ? "Source" : "Current"}
        </div>
        {/* The source side renders from its own Vault, so canvases that no longer exist still have a thumbnail. */}
        {side === "before" && sourceVault ? (
          <VaultProvider vault={sourceVault() as any}>{list}</VaultProvider>
        ) : (
          list
        )}
      </div>
    );
  };

  return (
    <div>
      <RefSummary ops={ops} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
        {strip("before")}
        {strip("after")}
      </div>
    </div>
  );
}

/** Raw JSON panes. Faithful to the data, and the best view for anything unusual. */
export function JsonPanes({ change }: { change: ResourceChange }) {
  const pane = (value: DiffValue, side: "before" | "after") =>
    value.exists ? (
      <div style={{ flex: "1 1 280px", minWidth: 0 }}>
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {side === "before" ? "Source" : "Current"}
        </div>
        <pre
          className="m-0 max-h-96 overflow-auto p-3 font-mono text-xs leading-relaxed text-gray-800"
          style={{
            background: side === "before" ? RED.bg : GREEN.bg,
            borderLeft: `3px solid ${side === "before" ? RED.edge : GREEN.edge}`,
          }}
        >
          {JSON.stringify(value.value, null, 2)}
        </pre>
      </div>
    ) : null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {pane(change.before, "before")}
      {pane(change.after, "after")}
    </div>
  );
}

// ---- Visual rendering --------------------------------------------------------------------------------------------

function Language({ code }: { code: string }) {
  return (
    <span className="me-2 inline-block rounded bg-gray-100 px-1 text-[10px] font-medium uppercase text-gray-500">
      {code}
    </span>
  );
}

function International({ value }: { value: Record<string, string[]> }) {
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(value).map(([language, strings]) => (
        <div key={language}>
          <Language code={language} />
          <LocaleString as="span" enableDangerouslySetInnerHTML>
            {{ [language]: strings }}
          </LocaleString>
        </div>
      ))}
    </div>
  );
}

const isMap = (value: unknown): value is Record<string, string[]> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => Array.isArray(entry) && entry.every((item) => typeof item === "string"));

function LabelValuePairs({ items }: { items: Array<{ label?: unknown; value?: unknown }> }) {
  return (
    <dl className="grid grid-cols-[minmax(6rem,12rem)_1fr] gap-x-4 gap-y-1 text-sm">
      {items.map((item, index) => (
        <div key={index} className="contents">
          <dt className="font-medium text-gray-600">
            {isMap(item.label) ? <LocaleString as="span">{item.label}</LocaleString> : null}
          </dt>
          <dd className="min-w-0 break-words">
            {isMap(item.value) ? <LocaleString as="span" enableDangerouslySetInnerHTML>{item.value}</LocaleString> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Images({ items }: { items: Array<{ id: string }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        // oxlint-disable-next-line jsx-a11y/alt-text
        <img key={item.id} src={item.id} alt="" className="max-h-24 max-w-40 rounded border border-gray-200 object-contain" />
      ))}
    </div>
  );
}

const scalar = (value: unknown): value is string | number | boolean =>
  ["string", "number", "boolean"].includes(typeof value);

/** Render one side of a change the way a reader would see it, falling back to JSON for the unknown. */
export function PropertyValue({ path, value }: { path: string[]; value: any }) {
  const [property, language] = path;
  if ((property === "label" || property === "summary") && language && Array.isArray(value)) {
    return <International value={{ [language]: value }} />;
  }
  if (isMap(value)) return <International value={value} />;
  if (property === "metadata" && Array.isArray(value)) return <LabelValuePairs items={value} />;
  if (property === "requiredStatement" && value && typeof value === "object") return <LabelValuePairs items={[value]} />;
  if (Array.isArray(value) && value.length && value.every((item) => item?.type === "Image" && item.id)) {
    return <Images items={value} />;
  }
  if (Array.isArray(value) && value.length && value.every(scalar)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, index) => (
          <span key={index} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
            {String(item)}
          </span>
        ))}
      </div>
    );
  }
  if (scalar(value)) return <span className="break-words text-sm text-gray-900">{String(value)}</span>;
  return (
    <pre className="max-h-64 overflow-auto font-mono text-xs leading-relaxed text-gray-700">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

/** A resource that exists on only one side: show what it is rather than a wall of JSON. */
function ResourceSummary({ change, side }: { change: ResourceChange; side: "before" | "after" }) {
  const { sourceVault } = useContext(DiffData);
  const { type, id } = change.resource;
  const reference = { id, type };
  const entity = useEntity(reference) as { width?: number; height?: number } | undefined;
  const card =
    type === "Canvas" ? (
      <div style={{ width: 112, flexShrink: 0 }}>
        <CanvasThumbnailGridItem id={id} />
      </div>
    ) : null;
  return (
    <div className="flex items-start gap-4">
      {card && side === "before" && sourceVault ? <VaultProvider vault={sourceVault() as any}>{card}</VaultProvider> : card}
      <div className="min-w-0 text-sm">
        <div className="font-medium text-gray-900">
          <RefLabel reference={reference} />
        </div>
        <div className="font-mono text-xs text-gray-500" title={id}>
          {type} · {shortId(id)}
        </div>
        {entity?.width && entity?.height && (
          <div className="mt-1 text-xs text-gray-500">
            {entity.width} × {entity.height}
          </div>
        )}
      </div>
    </div>
  );
}

export function VisualChange({ change }: { change: ResourceChange }) {
  const lists = referenceLists(change);
  if (lists) return <RefVisual {...lists} />;
  if (change.path.length === 0) {
    const side = change.after.exists ? "after" : "before";
    return <ResourceSummary change={change} side={side} />;
  }
  const pane = (value: DiffValue, side: "before" | "after") =>
    value.exists ? (
      <div
        style={{
          flex: "1 1 280px",
          minWidth: 0,
          padding: "8px 12px",
          background: side === "before" ? RED.bg : GREEN.bg,
          borderLeft: `3px solid ${side === "before" ? RED.edge : GREEN.edge}`,
        }}
      >
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {side === "before" ? "Source" : "Current"}
        </div>
        <PropertyValue path={change.path} value={value.value} />
      </div>
    ) : null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {pane(change.before, "before")}
      {pane(change.after, "after")}
    </div>
  );
}
