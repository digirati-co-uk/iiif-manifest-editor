import { describe, expect, test } from "vitest";
import { editingStackReducer } from "./EditingStack.reducer";
import type { EditingStackState } from "./EditingStack.types";

const editable = (id: string, type: string) =>
  ({ resource: { type: "SpecificResource", source: { id, type } } }) as any;

describe("editingStackReducer", () => {
  test.each(["Canvas", "Timeline", "Scene"])("starts a new stack for a manifest %s", (type) => {
    const state: EditingStackState = {
      current: editable("manifest", "Manifest"),
      stack: [editable("annotation", "Annotation")],
      create: null,
    };

    expect(
      editingStackReducer(state, {
        type: "edit",
        payload: { resource: editable(type.toLowerCase(), type) },
      }).stack,
    ).toEqual([]);
  });
});
