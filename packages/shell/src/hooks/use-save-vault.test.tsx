import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { captureVaultCheckpoint, createManifestEditorVault } from "@manifest-editor/client-vault";
import { useSaveVault } from "./use-save-vault";
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
test("autosave preserves field grouping and saves the sealed checkpoint without another edit", async () => {
  const vault = createManifestEditorVault();
  const ref = { id: "m", type: "Manifest" as const };
  vault.loadSync("m", { ...ref, label: { en: ["Original"] }, items: [] });
  const saves: ReturnType<typeof captureVaultCheckpoint>[] = [];
  const element = document.createElement("div"),
    root = createRoot(element);
  function Harness() {
    useSaveVault(
      vault,
      () => {
        saves.push(captureVaultCheckpoint(vault));
      },
      100
    );
    return null;
  }
  try {
    await act(async () => root.render(<Harness />));
    const session = vault.beginInteraction({ label: "Edit title" });
    await act(async () => {
      session.vault.modifyEntityField(ref, "label", { en: ["Changed"] });
      await new Promise((resolve) => window.setTimeout(resolve, 150));
    });
    expect(saves).toHaveLength(1);
    expect(saves[0].historySnapshot).toBeUndefined();
    await act(async () => root.render(<Harness />));
    expect(saves).toHaveLength(1); // Changing callback identity is not a teardown/save.
    await act(async () => {
      session.finish();
      await new Promise((resolve) => window.setTimeout(resolve, 150));
    });
    expect(saves).toHaveLength(2);
    expect(saves[1].historySnapshot).toBeDefined();
    expect(vault.history!.getState().undo).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
  }
});
test("disabled autosave never saves on callback changes or unmount", async () => {
  const vault = createManifestEditorVault(),
    save = vi.fn();
  const root = createRoot(document.createElement("div"));
  function Harness() {
    useSaveVault(vault, () => save(), 100, false);
    return null;
  }
  await act(async () => root.render(<Harness />));
  await act(async () => root.render(<Harness />));
  await act(async () => root.unmount());
  expect(save).not.toHaveBeenCalled();
});
