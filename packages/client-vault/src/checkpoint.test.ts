import { expect, test } from "vitest";
import { captureVaultCheckpoint, restoreVaultCheckpoint } from "./checkpoint";
import { createManifestEditorVault } from "./editor-vault";
const ref = { id: "m", type: "Manifest" as const };
function setup() {
  const vault = createManifestEditorVault();
  vault.loadSync("m", { ...ref, label: { en: ["Original"] }, items: [] });
  return vault;
}
test("project checkpoint restores both stacks, authored metadata and an imported graph", () => {
  const vault = setup();
  vault.modifyEntityField(ref, "label", { en: ["Changed"] });
  vault.modifyEntityField(ref, "summary", { en: ["Summary"] });
  vault.undo();
  const stored = structuredClone(captureVaultCheckpoint(vault));
  const restored = setup();
  expect(restoreVaultCheckpoint(restored, stored)).toBe(true);
  expect(restored.history!.getState()).toMatchObject({ canUndo: true, canRedo: true });
  expect(restored.redo().ok).toBe(true);
  expect(restored.get(ref).summary).toEqual({ en: ["Summary"] });
  expect(restored.undo().ok).toBe(true);
  expect(restored.undo().ok).toBe(true);
  expect(restored.get(ref).label).toEqual({ en: ["Original"] });
});
test("open autosaves omit old history; sealing allows the complete interaction to persist", () => {
  const vault = setup();
  const context = vault.beginInteraction({ label: "Edit title" });
  context.vault.modifyEntityField(ref, "label", { en: ["Draft"] });
  expect(captureVaultCheckpoint(vault).historySnapshot).toBeUndefined();
  context.finish();
  const restored = setup();
  expect(restoreVaultCheckpoint(restored, captureVaultCheckpoint(vault))).toBe(true);
  expect(restored.undo().ok).toBe(true);
  expect(restored.get(ref).label).toEqual({ en: ["Original"] });
});
test("legacy, corrupt and mismatched checkpoints recover the saved document with empty history", () => {
  const vault = setup();
  const checkpoint = captureVaultCheckpoint(vault);
  vault.modifyEntityField(ref, "label", { en: ["Latest"] });
  const latest = vault.getState().iiif;
  for (const historySnapshot of [undefined, { version: 999 }, checkpoint.historySnapshot]) {
    const restored = setup();
    expect(restoreVaultCheckpoint(restored, { vaultData: latest, historySnapshot: historySnapshot as any })).toBe(
      false
    );
    expect(restored.get(ref).label).toEqual({ en: ["Latest"] });
    expect(restored.history!.getState().undo).toEqual([]);
  }
});
