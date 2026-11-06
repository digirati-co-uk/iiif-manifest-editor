import { describe, expect, test } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import {
  CanvasCompositionDraft,
  EditorInstance,
  VaultEditSession,
  finishVaultEditSessions,
  movePaintingImage,
  resizeCanvas,
} from "../src/index";

const canvasRef = { id: "c", type: "Canvas" as const };
function setup() {
  const vault = new Vault({ history: { metadata: ["canvas-layout"] } });
  vault.loadSync("m", {
    id: "m",
    type: "Manifest",
    items: [
      {
        ...canvasRef,
        width: 100,
        height: 100,
        items: [
          {
            id: "p",
            type: "AnnotationPage",
            items: [
              {
                id: "a",
                type: "Annotation",
                motivation: "painting",
                target: {
                  type: "SpecificResource",
                  source: canvasRef,
                  selector: { type: "FragmentSelector", value: "xywh=0,0,50,50" },
                },
                body: [{ id: "i", type: "Image", width: 50, height: 50 }],
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}

describe("ME composition drafts", () => {
  test("previews and discard do not mutate history or overwrite another edit", () => {
    const vault = setup(),
      draft = new CanvasCompositionDraft(vault, "c");
    resizeCanvas(draft.vault, draft.canvas, { x: 0, y: 0, width: 300, height: 200 });
    expect(vault.get(canvasRef).width).toBe(100);
    vault.modifyEntityField(canvasRef, "label", { en: ["Other edit"] });
    draft.discard();
    expect(vault.get(canvasRef).label).toEqual({ en: ["Other edit"] });
    expect(vault.history!.getState().undo).toHaveLength(1);
  });
  test("applies all composition fields in one group and preserves unrelated content", () => {
    const vault = setup(),
      draft = new CanvasCompositionDraft(vault, "c");
    resizeCanvas(draft.vault, draft.canvas, { x: 0, y: 0, width: 300, height: 200 });
    movePaintingImage(draft.vault, draft.canvas, "a", { x: 20, y: 30, width: 80, height: 90 });
    vault.modifyEntityField(canvasRef, "label", { en: ["Unrelated"] });
    expect(draft.apply().ok).toBe(true);
    expect(vault.get(canvasRef).width).toBe(300);
    expect(vault.history!.getState().undo).toHaveLength(2);
    expect(vault.undo().ok).toBe(true);
    expect(vault.get(canvasRef).width).toBe(100);
    expect(vault.get(canvasRef).label).toEqual({ en: ["Unrelated"] });
    expect(vault.redo().ok).toBe(true);
    expect(vault.get(canvasRef).width).toBe(300);
  });
  test("stale composition cannot overwrite changed owned fields", () => {
    const vault = setup(),
      draft = new CanvasCompositionDraft(vault, "c");
    resizeCanvas(draft.vault, draft.canvas, { x: 0, y: 0, width: 300, height: 200 });
    vault.modifyEntityField(canvasRef, "width", 150);
    expect(draft.apply()).toMatchObject({ ok: false, reason: "conflict" });
    expect(vault.get(canvasRef).width).toBe(150);
  });
});

test("field sessions group debounced writes without capturing other fields", () => {
  const vault = setup(),
    session = new VaultEditSession(vault, "Edit label");
  const editor = new EditorInstance({ vault, reference: canvasRef });
  session.run((scoped) => editor.withVault(scoped).descriptive.label.set({ en: ["one"] }));
  session.run((scoped) => editor.withVault(scoped).descriptive.label.set({ en: ["two"] }));
  finishVaultEditSessions(vault);
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo().ok).toBe(true);
  expect(vault.get(canvasRef).label).not.toEqual({ en: ["one"] });
  session.dispose();
});

test("annotation class and stylesheet are one atomic edit", () => {
  const vault = setup(),
    editor = new EditorInstance({ vault, reference: { id: "a", type: "Annotation" } });
  editor.annotation.target.setBoxStyle({ borderColor: "red" });
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo().ok).toBe(true);
  expect(editor.annotation.target.getStyleClass()).toBeUndefined();
});

test("document replacement invalidates a composition draft", () => {
  const vault = setup(),
    draft = new CanvasCompositionDraft(vault, "c");
  resizeCanvas(draft.vault, draft.canvas, { x: 0, y: 0, width: 300, height: 200 });
  vault.getStore().setState({ iiif: vault.getState().iiif });
  expect(draft.apply()).toEqual({ ok: false, reason: "disabled" });
  expect(vault.get(canvasRef).width).toBe(100);
  draft.discard();
});

test.each([false, true])("replacement discards pending field flushes (already written: %s)", (written) => {
  const vault = setup();
  const session = new VaultEditSession(vault, "Edit label");
  if (written) session.run((scoped) => scoped.modifyEntityField(canvasRef, "label", { en: ["Old document"] }));
  session.onFlush(() => session.run((scoped) => scoped.modifyEntityField(canvasRef, "label", { en: ["Stale draft"] })));
  vault.getStore().setState({ iiif: vault.getState().iiif });
  const label = vault.get(canvasRef).label;
  finishVaultEditSessions(vault);
  session.dispose();
  expect(vault.get(canvasRef).label).toEqual(label);
  expect(vault.history!.getState().undo).toHaveLength(0);
});
