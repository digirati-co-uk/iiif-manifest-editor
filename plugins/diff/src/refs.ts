/** A IIIF reference: what `items`, `annotations`, `structures` etc. contain in normalized form. */
export type Ref = { id: string; type?: string };

export function isReference(value: unknown): value is Ref {
  return !!value && typeof value === "object" && typeof (value as Ref).id === "string";
}

export function isReferenceList(value: unknown): value is Ref[] {
  return Array.isArray(value) && value.length > 0 && value.every(isReference);
}

/** One line of the diff between two lists of references, exactly as a text diff would report it. */
export interface RefOp {
  op: "equal" | "del" | "ins";
  ref: Ref;
  /** Zero based position in the source (equal and del). */
  from?: number;
  /** Zero based position in the current document (equal and ins). */
  to?: number;
}

// Beyond this the quadratic table is not worth it; the middle is reported as a wholesale replacement.
const MAX_TABLE = 4_000_000;

/**
 * Line diff of two reference lists. Common leading and trailing items are trimmed first, so the cost depends on how
 * much actually changed. A swap of two items is a delete and an insert for each, a single item dragged across a
 * list is one delete and one insert, and everything it passed is untouched context.
 */
export function diffRefs(before: Ref[], after: Ref[]): RefOp[] {
  let start = 0;
  while (start < before.length && start < after.length && before[start]!.id === after[start]!.id) start++;
  let endBefore = before.length;
  let endAfter = after.length;
  while (endBefore > start && endAfter > start && before[endBefore - 1]!.id === after[endAfter - 1]!.id) {
    endBefore--;
    endAfter--;
  }

  const ops: RefOp[] = [];
  for (let index = 0; index < start; index++) ops.push({ op: "equal", ref: before[index]!, from: index, to: index });

  const a = before.slice(start, endBefore);
  const b = after.slice(start, endAfter);
  if (a.length * b.length > MAX_TABLE) {
    a.forEach((ref, index) => ops.push({ op: "del", ref, from: start + index }));
    b.forEach((ref, index) => ops.push({ op: "ins", ref, to: start + index }));
  } else {
    // Longest common subsequence table, filled from the end so the walk below reads forwards.
    const width = b.length + 1;
    const table = new Uint32Array((a.length + 1) * width);
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        table[i * width + j] =
          a[i]!.id === b[j]!.id
            ? table[(i + 1) * width + j + 1]! + 1
            : Math.max(table[(i + 1) * width + j]!, table[i * width + j + 1]!);
      }
    }
    let i = 0;
    let j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i]!.id === b[j]!.id) {
        ops.push({ op: "equal", ref: a[i]!, from: start + i, to: start + j });
        i++;
        j++;
      } else if (j < b.length && (i === a.length || table[i * width + j + 1]! >= table[(i + 1) * width + j]!)) {
        ops.push({ op: "ins", ref: b[j]!, to: start + j });
        j++;
      } else {
        ops.push({ op: "del", ref: a[i]!, from: start + i });
        i++;
      }
    }
  }

  for (let index = 0; index < before.length - endBefore; index++) {
    ops.push({
      op: "equal",
      ref: before[endBefore + index]!,
      from: endBefore + index,
      to: endAfter + index,
    });
  }
  return ops;
}

export type RefSegment = { fold: false; ops: RefOp[] } | { fold: true; ops: RefOp[]; start: number };

/**
 * Group ops for display: runs of unchanged items far from any change become a single fold, keeping `context`
 * items beside each change. Short runs are never folded, since a fold costs a line itself.
 */
export function segmentRefs(ops: RefOp[], context = 2, expanded: ReadonlySet<number> = new Set()): RefSegment[] {
  const segments: RefSegment[] = [];
  let index = 0;
  while (index < ops.length) {
    if (ops[index]!.op !== "equal") {
      const start = index;
      while (index < ops.length && ops[index]!.op !== "equal") index++;
      segments.push({ fold: false, ops: ops.slice(start, index) });
      continue;
    }
    const start = index;
    while (index < ops.length && ops[index]!.op === "equal") index++;
    const run = ops.slice(start, index);
    const leading = start === 0 ? 0 : context;
    const trailing = index === ops.length ? 0 : context;
    if (run.length <= leading + trailing + 1 || expanded.has(start)) {
      segments.push({ fold: false, ops: run });
    } else {
      if (leading) segments.push({ fold: false, ops: run.slice(0, leading) });
      // The fold is keyed by the run's first op so it can be expanded again after edits elsewhere.
      segments.push({ fold: true, ops: run.slice(leading, run.length - trailing), start });
      if (trailing) segments.push({ fold: false, ops: run.slice(run.length - trailing) });
    }
  }
  return segments;
}

/** Count what happened in plain terms: an item deleted from one place and inserted elsewhere is a move. */
export function summarizeRefs(ops: RefOp[]) {
  const deleted = new Set(ops.filter((op) => op.op === "del").map((op) => op.ref.id));
  const inserted = new Set(ops.filter((op) => op.op === "ins").map((op) => op.ref.id));
  let moved = 0;
  for (const id of deleted) if (inserted.has(id)) moved++;
  return { moved, added: inserted.size - moved, removed: deleted.size - moved };
}
