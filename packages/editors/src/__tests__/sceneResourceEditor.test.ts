import { describe, expect, test } from "vitest";
import { isSceneEditorSelectionClick } from "../components/SceneEditor/SceneResourceEditor";

describe("Scene resource editor selection", () => {
  test("accepts short clicks with negligible movement", () => {
    expect(isSceneEditorSelectionClick({ x: 10, y: 10, time: 100 }, { x: 12, y: 11, time: 180 })).toBe(true);
  });

  test("rejects camera gestures that move or take too long", () => {
    expect(isSceneEditorSelectionClick({ x: 10, y: 10, time: 100 }, { x: 14, y: 10, time: 180 })).toBe(false);
    expect(isSceneEditorSelectionClick({ x: 10, y: 10, time: 100 }, { x: 10, y: 10, time: 601 })).toBe(false);
  });
});
