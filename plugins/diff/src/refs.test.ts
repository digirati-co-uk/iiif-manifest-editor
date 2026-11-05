import { expect, test } from "vitest";
import { diffRefs, isReferenceList, segmentRefs, summarizeRefs } from "./refs";

const refs = (...ids: string[]) => ids.map((id) => ({ id, type: "Canvas" }));
const lines = (before: string[], after: string[]) =>
  diffRefs(refs(...before), refs(...after))
    .filter((op) => op.op !== "equal")
    .map((op) => `${op.op === "del" ? "-" : "+"}${op.ref.id}`);

test("swapping two items shows both, with the shifted one as context that carries both positions", () => {
  const ops = diffRefs(refs("a", "b"), refs("b", "a"));
  expect(new Set(ops.map((op) => op.ref.id))).toEqual(new Set(["a", "b"]));
  const context = ops.find((op) => op.op === "equal")!;
  expect(context.from).not.toBe(context.to);
  expect(summarizeRefs(ops)).toEqual({ moved: 1, added: 0, removed: 0 });
});
test("a single item dragged a long way is one delete and one insert", () => {
  expect(lines(["a", "b", "c", "d", "e"], ["e", "a", "b", "c", "d"])).toEqual(["+e", "-e"]);
});
test("additions and removals are reported where they sit", () => {
  const ops = diffRefs(refs("a", "b", "c"), refs("a", "c", "d"));
  expect(ops.map((op) => `${op.op}:${op.ref.id}`)).toEqual(["equal:a", "del:b", "equal:c", "ins:d"]);
  expect(summarizeRefs(ops)).toEqual({ moved: 0, added: 1, removed: 1 });
});
test("positions refer to each side", () => {
  const ops = diffRefs(refs("a", "b", "c"), refs("c", "a", "b"));
  expect(ops.find((op) => op.op === "ins")).toMatchObject({ to: 0 });
  expect(ops.find((op) => op.op === "del")).toMatchObject({ from: 2 });
});
test("long unchanged runs fold, keeping context beside the change", () => {
  const ids = Array.from({ length: 20 }, (_, index) => String(index));
  const after = [...ids];
  after.splice(10, 0, after.splice(2, 1)[0]!);
  const segments = segmentRefs(diffRefs(refs(...ids), refs(...after)));
  expect(segments.some((segment) => segment.fold)).toBe(true);
  expect(segments.reduce((total, segment) => total + (segment.fold ? 0 : segment.ops.length), 0)).toBeLessThan(14);
});
test("detects lists of references", () => {
  expect(isReferenceList(refs("a"))).toBe(true);
  expect(isReferenceList(["a"])).toBe(false);
  expect(isReferenceList([])).toBe(false);
});
