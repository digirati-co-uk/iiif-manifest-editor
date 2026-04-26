import { getValue } from "@iiif/helpers";
import { isSpecificResource } from "@iiif/parser";
import type {
  InternationalString,
  Reference,
  SpecificResource,
} from "@iiif/presentation-3";

export type TemporalRangeItemReference = SpecificResource & {
  source: Reference<"Canvas">;
  selector?:
    | { type?: string; value?: string }
    | Array<{ type?: string; value?: string }>;
};

export interface TemporalRangeSegment {
  id: string;
  type: "Range";
  canvasId: string;
  title: string;
  label?: InternationalString;
  start: number;
  end: number;
  duration: number;
  behavior?: string[];
  range: any;
  rangeRef: Reference<"Range">;
  parentRef: Reference<"Manifest" | "Range">;
  parentKey: "structures" | "items";
  parentIndex: number;
  item: TemporalRangeItemReference;
  itemIndex: number;
}

export interface TemporalRangeValidationIssue {
  code: "invalid-time" | "out-of-bounds" | "overlap" | "blank-title";
  rangeId?: string;
  message: string;
}

export interface TemporalRangeValidationResult {
  valid: boolean;
  issues: TemporalRangeValidationIssue[];
}

const TEMPORAL_FRAGMENT_REGEX =
  /(?:^|[&#])t=(?:npt:)?([0-9]+(?:\.[0-9]+)?)?(?:,([0-9]+(?:\.[0-9]+)?))?/;

export function normaliseSeconds(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value * 1000) / 1000);
}

export function formatTemporalFragmentValue(start: number, end: number) {
  return `t=${formatSecondsForSelector(start)},${formatSecondsForSelector(end)}`;
}

export function formatSecondsForSelector(value: number) {
  const rounded = normaliseSeconds(value);
  return rounded.toFixed(3).replace(/\.?0+$/, "");
}

export function createTemporalCanvasReference(
  canvasId: string,
  start: number,
  end: number,
): TemporalRangeItemReference {
  return {
    type: "SpecificResource",
    source: { id: canvasId, type: "Canvas" },
    selector: {
      type: "FragmentSelector",
      value: formatTemporalFragmentValue(start, end),
    },
  };
}

export function parseTemporalRangeItem(
  item: unknown,
): { canvasId: string; start: number; end: number } | null {
  if (!item || typeof item !== "object" || !isSpecificResource(item)) {
    return null;
  }

  const source = item.source;
  const rawSourceId = typeof source === "string" ? source : source?.id;
  const sourceType = typeof source === "string" ? "Canvas" : source?.type;
  if (!rawSourceId || sourceType !== "Canvas") {
    return null;
  }

  const selectorValues = getSelectorValues((item as any).selector);
  const sourceMatch = parseTemporalFragment(rawSourceId);
  const selectorMatch = selectorValues.map(parseTemporalFragment).find(Boolean);
  const temporal = selectorMatch || sourceMatch;

  if (!temporal) {
    return null;
  }

  return {
    canvasId: rawSourceId.split("#")[0] || rawSourceId,
    start: temporal.start,
    end: temporal.end,
  };
}

export function getTemporalSegmentsFromStructures(
  vault: { get: (ref: any, options?: any) => any },
  manifest: any,
): TemporalRangeSegment[] {
  const segments: TemporalRangeSegment[] = [];
  const structures = manifest?.structures || [];

  structures.forEach((rangeRef: Reference<"Range">, index: number) => {
    collectTemporalSegments(
      vault,
      rangeRef,
      { id: manifest.id, type: "Manifest" },
      "structures",
      index,
      segments,
    );
  });

  return sortTemporalSegments(segments);
}

export function sortTemporalSegments(segments: TemporalRangeSegment[]) {
  return [...segments].sort(
    (a, b) =>
      a.canvasId.localeCompare(b.canvasId) ||
      a.start - b.start ||
      a.end - b.end,
  );
}

export function getSegmentsForCanvas(
  segments: TemporalRangeSegment[],
  canvasId: string,
) {
  return segments
    .filter((segment) => segment.canvasId === canvasId)
    .sort((a, b) => a.start - b.start || a.end - b.end);
}

export function getTemporalGaps(
  segments: Pick<TemporalRangeSegment, "start" | "end">[],
  duration: number,
) {
  const gaps: Array<{ start: number; end: number; duration: number }> = [];
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  let cursor = 0;

  for (const segment of sorted) {
    if (segment.start > cursor) {
      gaps.push({
        start: cursor,
        end: segment.start,
        duration: segment.start - cursor,
      });
    }
    cursor = Math.max(cursor, segment.end);
  }

  if (duration > cursor) {
    gaps.push({ start: cursor, end: duration, duration: duration - cursor });
  }

  return gaps;
}

export function validateTemporalSegments(
  segments: Array<Pick<TemporalRangeSegment, "id" | "title" | "start" | "end">>,
  canvasDuration: number,
  options: { requireTitle?: boolean } = {},
): TemporalRangeValidationResult {
  const issues: TemporalRangeValidationIssue[] = [];
  const sorted = [...segments].sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );

  for (const segment of sorted) {
    if (segment.end <= segment.start) {
      issues.push({
        code: "invalid-time",
        rangeId: segment.id,
        message: "End time must be after start time.",
      });
    }
    if (segment.start < 0 || segment.end > canvasDuration) {
      issues.push({
        code: "out-of-bounds",
        rangeId: segment.id,
        message: "Range must stay within the canvas duration.",
      });
    }
    if (options.requireTitle && !segment.title.trim()) {
      issues.push({
        code: "blank-title",
        rangeId: segment.id,
        message: "Title is required.",
      });
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1]!;
    const current = sorted[i]!;
    if (current.start < previous.end) {
      issues.push({
        code: "overlap",
        rangeId: current.id,
        message: "Ranges cannot overlap.",
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function clampIntervalToNeighbors(
  interval: { start: number; end: number },
  neighbors: Array<Pick<TemporalRangeSegment, "id" | "start" | "end">>,
  canvasDuration: number,
  currentId?: string,
) {
  const sorted = [...neighbors]
    .filter((segment) => segment.id !== currentId)
    .sort((a, b) => a.start - b.start);
  const previous = [...sorted]
    .reverse()
    .find(
      (segment) =>
        segment.end <= interval.start || segment.start < interval.start,
    );
  const next = sorted.find(
    (segment) => segment.start >= interval.end || segment.end > interval.start,
  );
  const minStart = previous ? previous.end : 0;
  const maxEnd = next ? next.start : canvasDuration;
  const start = Math.min(
    Math.max(normaliseSeconds(interval.start), minStart),
    maxEnd,
  );
  const end = Math.max(
    start,
    Math.min(Math.max(normaliseSeconds(interval.end), minStart), maxEnd),
  );

  return { start, end };
}

export function formatTime(value: number) {
  const totalMs = Math.round(normaliseSeconds(value) * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;

  const hh = hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "";
  return `${hh}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

/** Like formatTime but without milliseconds — for display-only contexts. */
export function formatTimeDisplay(value: number) {
  const totalSec = Math.floor(normaliseSeconds(value));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const hh = hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "";
  return `${hh}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number.parseFloat(trimmed);
  }

  const parts = trimmed.split(":");
  if (parts.length < 2 || parts.length > 3) {
    return null;
  }

  const numeric = parts.map((part) => Number.parseFloat(part));
  if (numeric.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (numeric.length === 2) {
    return numeric[0]! * 60 + numeric[1]!;
  }

  return numeric[0]! * 3600 + numeric[1]! * 60 + numeric[2]!;
}

export function makeRangeId(manifestId: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${manifestId}/range/${random}`;
}

function collectTemporalSegments(
  vault: { get: (ref: any, options?: any) => any },
  rangeRef: Reference<"Range">,
  parentRef: Reference<"Manifest" | "Range">,
  parentKey: "structures" | "items",
  parentIndex: number,
  segments: TemporalRangeSegment[],
) {
  const range = vault.get(rangeRef, { skipSelfReturn: false });
  if (!range?.items) {
    return;
  }

  range.items.forEach((item: any, itemIndex: number) => {
    if (item?.type === "Range") {
      collectTemporalSegments(
        vault,
        item,
        { id: range.id, type: "Range" },
        "items",
        itemIndex,
        segments,
      );
      return;
    }

    const temporal = parseTemporalRangeItem(item);
    if (!temporal) {
      return;
    }

    segments.push({
      id: range.id,
      type: "Range",
      canvasId: temporal.canvasId,
      title: getValue(range.label) || "Untitled range",
      label: range.label,
      start: temporal.start,
      end: temporal.end,
      duration: temporal.end - temporal.start,
      behavior: range.behavior,
      range,
      rangeRef: { id: range.id, type: "Range" },
      parentRef,
      parentKey,
      parentIndex,
      item,
      itemIndex,
    });
  });
}

function getSelectorValues(selector: unknown): string[] {
  if (!selector) {
    return [];
  }
  const selectors = Array.isArray(selector) ? selector : [selector];
  return selectors
    .map((entry: any) => {
      if (typeof entry === "string") return entry;
      if (entry?.type === "FragmentSelector" && typeof entry.value === "string")
        return entry.value;
      if (typeof entry?.value === "string") return entry.value;
      return "";
    })
    .filter(Boolean);
}

function parseTemporalFragment(
  value: string,
): { start: number; end: number } | null {
  const match = TEMPORAL_FRAGMENT_REGEX.exec(value);
  if (!match) {
    return null;
  }
  const start = match[1] ? Number.parseFloat(match[1]) : 0;
  const end = match[2] ? Number.parseFloat(match[2]) : Number.NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }
  return {
    start: normaliseSeconds(start),
    end: normaliseSeconds(end),
  };
}
