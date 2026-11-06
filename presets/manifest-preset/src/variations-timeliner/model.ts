import { emptyAnnotationPage, emptyRange, normalize } from "@iiif/parser";
import { getValue } from "@iiif/helpers";
import type { Vault } from "@iiif/helpers/vault";
import { addMappings, importEntities } from "@iiif/helpers/vault/actions";
import type { Reference } from "@iiif/presentation-3";
import { createTemporalCanvasReference, makeRangeId, parseTemporalRangeItem } from "../av-ranges/temporal-range-utils";

export type Bubble = {
  id: string;
  title: string;
  summary: string;
  start: number;
  end: number;
  height: number;
  colour?: string;
  parent: Reference<"Manifest" | "Range">;
  property: "items" | "structures";
  index: number;
  children: Bubble[];
};

/** Project the existing IIIF hierarchy; groups get their extent from their children. */
export function getBubbles(vault: Pick<Vault, "get">, manifest: any, canvasId: string): Bubble[] {
  const bubbles: Bubble[] = [];
  function visit(
    ref: Reference<"Range">,
    parent: Bubble["parent"],
    property: Bubble["property"],
    index: number,
    path: Set<string>
  ): Bubble | null {
    if (path.has(ref.id)) return null;
    const range = vault.get(ref) as any;
    if (!range?.items) return null;
    const nextPath = new Set(path).add(ref.id);
    const children = range.items
      .map((item: any, i: number) => (item.type === "Range" ? visit(item, ref, "items", i, nextPath) : null))
      .filter(Boolean) as Bubble[];
    const intervals = range.items
      .map((item: any) => parseTemporalRangeItem(item))
      .filter((item: any) => item?.canvasId === canvasId && item.end > item.start);
    const spans = [...intervals, ...children];
    if (!spans.length) return null;
    const bubble: Bubble = {
      id: range.id,
      title: getValue(range.label) || "Untitled section",
      summary: getValue(range.summary) || "",
      start: Math.min(...spans.map((item) => item.start)),
      end: Math.max(...spans.map((item) => item.end)),
      height: 1 + Math.max(0, ...children.map((item) => item.height)),
      colour: readSectionColour(range),
      parent,
      property,
      index,
      children,
    };
    bubbles.push(bubble);
    return bubble;
  }
  (manifest?.structures || []).forEach((ref: Reference<"Range">, index: number) =>
    visit(ref, { id: manifest.id, type: "Manifest" }, "structures", index, new Set())
  );
  return bubbles;
}

function insertEntity(vault: Vault, type: "Range" | "AnnotationPage", id: string, data: Record<string, unknown>) {
  vault.dispatch(importEntities({ entities: { [type]: { [id]: data } } as any }));
  vault.dispatch(addMappings({ mapping: { [id]: type } }));
  return { id, type } as const;
}

function insertRange(vault: Vault, id: string, data: Record<string, unknown>) {
  return insertEntity(vault, "Range", id, { ...emptyRange, id, type: "Range", ...data });
}

function parentItems(vault: Vault, bubble: Bubble): any[] {
  return (vault.get(bubble.parent) as any)[bubble.property] || [];
}

export function addSection(
  vault: Vault,
  manifest: any,
  canvasId: string,
  duration: number,
  options: { start?: number; end?: number; label?: string } = {}
) {
  const start = options.start ?? 0;
  const end = options.end ?? duration;
  if (!Number.isFinite(duration) || duration <= 0 || !(start >= 0) || !(end > start) || end > duration) return null;
  const id = makeRangeId(manifest.id);
  vault.batch(() => {
    const ref = insertRange(vault, id, {
      label: { en: [options.label?.trim() || "Untitled section"] },
      items: [createTemporalCanvasReference(canvasId, start, end)],
    });
    vault.modifyEntityField({ id: manifest.id, type: "Manifest" }, "structures", [...(manifest.structures || []), ref]);
  });
  return id;
}

export type BubbleRow = { bubble: Bubble; level: number };

/** Depth-first rows in manifest order, for the sections sidebar. */
export function bubbleRows(bubbles: Bubble[]): BubbleRow[] {
  const rows: BubbleRow[] = [];
  const visit = (bubble: Bubble, level: number) => {
    rows.push({ bubble, level });
    bubble.children.forEach((child) => visit(child, level + 1));
  };
  bubbles.filter((bubble) => bubble.parent.type === "Manifest").forEach((bubble) => visit(bubble, 0));
  return rows;
}

/** Largest stretch of the canvas not yet covered by a top-level section. */
export function largestGap(bubbles: Bubble[], duration: number, minimum = 0.25) {
  const roots = bubbles.filter((bubble) => bubble.parent.type === "Manifest").sort((a, b) => a.start - b.start);
  let cursor = 0;
  let best: { start: number; end: number } | null = null;
  const consider = (start: number, end: number) => {
    if (end - start >= minimum && (!best || end - start > best.end - best.start)) best = { start, end };
  };
  for (const root of roots) {
    consider(cursor, root.start);
    cursor = Math.max(cursor, root.end);
  }
  consider(cursor, duration);
  return best as { start: number; end: number } | null;
}

const COLOUR_KEY = "tl:backgroundColour";
const isColourEntry = (item: any) =>
  Object.values(item?.label || {})
    .flat()
    .includes(COLOUR_KEY);

/**
 * Custom bubble colour. The original Timeliner stores it as a `tl:backgroundColour` property, but the IIIF
 * serializer only writes known Range properties, so a copy is kept in the Range's `metadata` where it is
 * saved and exported with the manifest. The metadata entry wins when both are present.
 */
export function readSectionColour(range: any): string | undefined {
  const entry = (range?.metadata || []).find(isColourEntry);
  return (Object.values(entry?.value || {}).flat()[0] as string | undefined) || range?.[COLOUR_KEY] || undefined;
}

export function setSectionColour(vault: Vault, id: string, colour: string | null) {
  const ref = { id, type: "Range" } as const;
  const others = ((vault.get(ref) as any).metadata || []).filter((item: any) => !isColourEntry(item));
  vault.batch(() => {
    vault.modifyEntityField(
      ref,
      "metadata",
      colour ? [...others, { label: { none: [COLOUR_KEY] }, value: { none: [colour] } }] : others
    );
    vault.modifyEntityField(ref, COLOUR_KEY, colour || undefined);
  });
}

export function validateSectionTimes(start: number, end: number, duration: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "Enter a start and end time.";
  if (start < 0 || end > duration) return "Times must be within the canvas duration.";
  if (end <= start) return "The end time must be after the start time.";
  return null;
}

/** Only simple leaves have editable times; groups derive their extent from their children. */
export function setSectionTimes(
  vault: Vault,
  id: string,
  canvasId: string,
  start: number,
  end: number,
  duration: number
) {
  const range = vault.get({ id, type: "Range" }) as any;
  if (range?.items?.length !== 1 || !parseTemporalRangeItem(range.items[0])) return false;
  if (validateSectionTimes(start, end, duration)) return false;
  vault.modifyEntityField({ id, type: "Range" }, "items", [createTemporalCanvasReference(canvasId, start, end)]);
  return true;
}

/** Only split simple leaves: never discard nested ranges or additional canvas targets. */
export function canSplit(vault: Vault, bubble: Bubble, time: number) {
  const range = vault.get({ id: bubble.id, type: "Range" }) as any;
  return (
    range?.items?.length === 1 && !!parseTemporalRangeItem(range.items[0]) && time > bubble.start && time < bubble.end
  );
}

export function splitSection(vault: Vault, bubble: Bubble, canvasId: string, time: number) {
  if (!canSplit(vault, bubble, time)) return null;
  const range = vault.get({ id: bubble.id, type: "Range" }) as any;
  const id = makeRangeId(bubble.parent.id);
  vault.batch(() => {
    const ref = insertRange(vault, id, {
      ...range,
      id,
      label: { ...range.label, en: [`${bubble.title} 2`] },
      items: [createTemporalCanvasReference(canvasId, time, bubble.end)],
    });
    vault.modifyEntityField({ id: bubble.id, type: "Range" }, "items", [
      createTemporalCanvasReference(canvasId, bubble.start, time),
    ]);
    const items = [...parentItems(vault, bubble)];
    items.splice(bubble.index + 1, 0, ref);
    vault.modifyEntityField(bubble.parent, bubble.property, items);
  });
  return id;
}

export function canGroup(bubbles: Bubble[]) {
  if (bubbles.length < 2) return false;
  const sorted = [...bubbles].sort((a, b) => a.index - b.index);
  return sorted.every(
    (bubble, i) =>
      bubble.parent.id === sorted[0]!.parent.id &&
      bubble.property === sorted[0]!.property &&
      bubble.index === sorted[0]!.index + i
  );
}

export function groupSections(vault: Vault, selected: Bubble[]) {
  if (!canGroup(selected)) return null;
  const sorted = [...selected].sort((a, b) => a.index - b.index);
  const first = sorted[0]!;
  const id = makeRangeId(first.parent.id);
  vault.batch(() => {
    const ref = insertRange(vault, id, {
      label: { en: ["Untitled group"] },
      items: sorted.map((bubble) => ({ id: bubble.id, type: "Range" })),
    });
    const items = [...parentItems(vault, first)];
    items.splice(first.index, sorted.length, ref);
    vault.modifyEntityField(first.parent, first.property, items);
  });
  return id;
}

/** Deleting a group promotes its children, preserving the underlying sections. */
export function removeSection(vault: Vault, bubble: Bubble) {
  const range = vault.get({ id: bubble.id, type: "Range" }) as any;
  const items = [...parentItems(vault, bubble)];
  items.splice(bubble.index, 1, ...(range.items || []).filter((item: any) => item.type === "Range"));
  vault.modifyEntityField(bubble.parent, bubble.property, items);
}

// Curve adapted from IUBLibTech/timeliner SingleBubble (MIT, see NOTICE).
export function bubblePath(x: number, width: number, height: number, square: boolean) {
  if (square) return `M${x},0 L${x},${-height} L${x + width},${-height} L${x + width},0 Z`;
  const dx = width * 0.375;
  return `M${x},0 C${x},${-height} ${x + dx},${-height} ${x + width / 2},${-height} C${x + width - dx},${-height} ${x + width},${-height} ${x + width},0 Z`;
}

export type Marker = { id: string; title: string; time: number; pageId: string };

/** Time of a point-selector (or `t=` fragment) annotation targeting the canvas, otherwise null. */
function markerTime(annotation: any, canvasId: string): number | null {
  const targets = Array.isArray(annotation?.target) ? annotation.target : [annotation?.target];
  for (const target of targets) {
    const source = typeof target?.source === "string" ? target.source : target?.source?.id;
    const selector = target?.selector;
    const time =
      selector?.type === "PointSelector"
        ? Number(selector.t)
        : selector?.type === "FragmentSelector"
          ? Number(/^t=(\d+(?:\.\d+)?)$/.exec(selector.value)?.[1])
          : NaN;
    if (source === canvasId && Number.isFinite(time) && time >= 0) return time;
  }
  return null;
}

type OwnerRef = Reference<"Manifest" | "Canvas">;
type MarkerPage = {
  owner: OwnerRef;
  page: any;
  /** Every annotation on the page is a marker for this canvas, so it can be merged safely. */
  onlyMarkers: boolean;
};

/** Annotation pages (on the manifest, then the canvas) that already hold point-selector markers. */
function findMarkerPages(vault: Pick<Vault, "get">, manifest: any, canvasId: string): MarkerPage[] {
  const canvas = vault.get({ id: canvasId, type: "Canvas" }) as any;
  const owners: Array<[OwnerRef, any[]]> = [
    [{ id: manifest.id, type: "Manifest" }, manifest?.annotations || []],
    [{ id: canvasId, type: "Canvas" }, canvas?.annotations || []],
  ];
  const found: MarkerPage[] = [];
  for (const [owner, pages] of owners) {
    for (const pageRef of pages) {
      const page = vault.get(pageRef) as any;
      const items: any[] = page?.items || [];
      const markers = items.filter((item) => markerTime(vault.get(item), canvasId) !== null);
      if (markers.length) found.push({ owner, page, onlyMarkers: markers.length === items.length });
    }
  }
  return found;
}

export function getMarkers(vault: Pick<Vault, "get">, manifest: any, canvasId: string): Marker[] {
  const markers: Marker[] = [];
  for (const { page } of findMarkerPages(vault, manifest, canvasId)) {
    for (const annotationRef of page.items || []) {
      const annotation = vault.get(annotationRef) as any;
      const time = markerTime(annotation, canvasId);
      if (time !== null)
        markers.push({
          id: annotation.id,
          title: getValue(annotation.label) || "Untitled marker",
          time,
          pageId: page.id,
        });
    }
  }
  return markers.sort((a, b) => a.time - b.time);
}

/** The shared page markers are created in when no page with point selectors exists yet. */
export const markerPageId = (manifestId: string) => `${manifestId}/markers`;

/**
 * Merge pages that contain nothing but markers (for example one page per marker, as earlier versions
 * created) into the first marker page, removing the emptied pages from their owner.
 */
export function consolidateMarkerPages(vault: Vault, manifest: any, canvasId: string) {
  const [primary, ...rest] = findMarkerPages(vault, manifest, canvasId);
  if (!primary) return;
  const duplicates = rest.filter((item) => item.onlyMarkers && item.owner.id === primary.owner.id);
  if (!duplicates.length) return;
  const mergedIds = new Set(duplicates.map((item) => item.page.id as string));
  vault.batch(() => {
    const items = [...(primary.page.items || [])];
    for (const { page } of duplicates)
      for (const item of page.items || []) if (!items.some((existing) => existing.id === item.id)) items.push(item);
    vault.modifyEntityField({ id: primary.page.id, type: "AnnotationPage" }, "items", items);
    const owner = vault.get(primary.owner) as any;
    vault.modifyEntityField(
      primary.owner,
      "annotations",
      (owner.annotations || []).filter((ref: any) => !mergedIds.has(ref.id))
    );
  });
}

/**
 * Add a point-selector marker. It joins the annotation page that already holds markers for the canvas;
 * only when there is none is a single shared page created. Stray one-marker pages are merged into it.
 */
export function addMarker(vault: Vault, manifest: any, canvasId: string, time: number) {
  if (!Number.isFinite(time) || time < 0) return;
  const id = `${manifest.id}/marker/${crypto.randomUUID()}`;
  const normalized = normalize({
    id: `${id}/page`,
    type: "AnnotationPage",
    items: [
      {
        id,
        type: "Annotation",
        motivation: "commenting",
        label: { en: ["Untitled marker"] },
        body: { type: "TextualBody", value: "", format: "text/plain" },
        target: {
          type: "SpecificResource",
          source: { id: canvasId, type: "Canvas" },
          selector: { type: "PointSelector", t: time },
        },
      },
    ],
  });
  const annotationRef = { id, type: "Annotation" };
  const { AnnotationPage: _wrapper, ...entities } = normalized.entities as Record<string, unknown>;
  const { [`${id}/page`]: _ignored, ...mapping } = normalized.mapping as Record<string, string>;
  const existing = findMarkerPages(vault, manifest, canvasId)[0];
  const sharedId = markerPageId(manifest.id);
  const attachedShared = (manifest.annotations || []).some((ref: any) => ref.id === sharedId);

  vault.batch(() => {
    vault.dispatch(importEntities({ entities: entities as any }));
    vault.dispatch(addMappings({ mapping: mapping as any }));
    if (existing || attachedShared) {
      const pageRef = { id: existing ? existing.page.id : sharedId, type: "AnnotationPage" } as const;
      const page = vault.get(pageRef) as any;
      vault.modifyEntityField(pageRef, "items", [...(page.items || []), annotationRef]);
    } else {
      insertEntity(vault, "AnnotationPage", sharedId, {
        ...emptyAnnotationPage,
        id: sharedId,
        type: "AnnotationPage",
        label: { en: ["Markers"] },
        items: [annotationRef],
      });
      vault.modifyEntityField({ id: manifest.id, type: "Manifest" }, "annotations", [
        ...(manifest.annotations || []),
        { id: sharedId, type: "AnnotationPage" },
      ]);
    }
  });
  consolidateMarkerPages(vault, vault.get({ id: manifest.id, type: "Manifest" }), canvasId);
  return id;
}

export function removeMarker(vault: Vault, marker: Marker) {
  const ref = { id: marker.pageId, type: "AnnotationPage" } as const;
  const page = vault.get(ref) as any;
  vault.modifyEntityField(
    ref,
    "items",
    (page.items || []).filter((item: any) => item.id !== marker.id)
  );
}

/** Move a shared boundary once, keeping adjacent leaves joined. */
export function moveBoundary(
  vault: Vault,
  bubbles: Bubble[],
  canvasId: string,
  from: number,
  to: number,
  duration: number
) {
  const leaves = bubbles.filter((bubble) => !bubble.children.length);
  const affected = leaves.filter((bubble) => bubble.start === from || bubble.end === from);
  if (!affected.length || from <= 0 || from >= duration || !Number.isFinite(to)) return;
  // Multi-target ranges require the main editor; never replace their other targets.
  if (affected.some((bubble) => (vault.get({ id: bubble.id, type: "Range" }) as any).items.length !== 1)) return;
  const min = Math.max(0, ...affected.filter((bubble) => bubble.end === from).map((bubble) => bubble.start + 0.001));
  const max = Math.min(
    duration,
    ...affected.filter((bubble) => bubble.start === from).map((bubble) => bubble.end - 0.001)
  );
  const next = Math.max(min, Math.min(max, to));
  vault.batch(() => {
    affected.forEach((bubble) =>
      vault.modifyEntityField({ id: bubble.id, type: "Range" }, "items", [
        createTemporalCanvasReference(
          canvasId,
          bubble.start === from ? next : bubble.start,
          bubble.end === from ? next : bubble.end
        ),
      ])
    );
  });
}

/** Simple leaves target one time span of the canvas, so their times can be edited directly. */
export function isSimpleLeaf(vault: Pick<Vault, "get">, id: string) {
  const range = vault.get({ id, type: "Range" }) as any;
  return range?.items?.length === 1 && !!parseTemporalRangeItem(range.items[0]);
}
