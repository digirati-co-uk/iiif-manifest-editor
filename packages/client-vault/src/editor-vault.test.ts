import { expect, test } from "vitest";
import { createManifestEditorVault, EDITOR_HISTORY_METADATA } from "./editor-vault";
import { vaultDocumentChanged } from "./document-changes";

const canvas = { id: "c", type: "Canvas" as const };
test("ME history includes authored metadata and leaves initial loads unrecorded", () => {
  const vault = createManifestEditorVault();
  vault.loadSync("c", { ...canvas, width: 100, height: 100 });
  expect(vault.history!.getState().undo).toHaveLength(0);
  const before = vault.getState();
  vault.batch(() => {
    for (const namespace of EDITOR_HISTORY_METADATA) vault.setMetaValue([canvas.id, namespace, "value"], "authored");
  });
  expect(vaultDocumentChanged(before, vault.getState())).toBe(true);
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo().ok).toBe(true);
  for (const namespace of EDITOR_HISTORY_METADATA)
    expect(vault.getState().iiif.meta.c?.[namespace]?.value).toBeUndefined();
  expect(vault.redo().ok).toBe(true);
});

test("operational metadata and semantic no-ops do not dirty the document", () => {
  const vault = createManifestEditorVault();
  vault.loadSync("c", { ...canvas, width: 100, height: 100 });
  const before = vault.getState();
  vault.setMetaValue([canvas.id, "task-run", "status"], "pending");
  vault.modifyEntityField(canvas, "width", 100);
  expect(vaultDocumentChanged(before, vault.getState())).toBe(false);
  expect(vault.history!.getState().undo).toHaveLength(0);
});

test("hosts can opt out or configure retention without losing ME namespaces", () => {
  expect(createManifestEditorVault({ history: false }).history).toBeUndefined();
  const vault = createManifestEditorVault({ history: { maxGroups: 1, metadata: ["host"] } });
  vault.loadSync("c", { ...canvas, width: 100, height: 100 });
  vault.setMetaValue([canvas.id, "host", "value"], "one");
  vault.setMetaValue([canvas.id, "canvas-layout", "value"], "two");
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo().ok).toBe(true);
  expect(vault.getState().iiif.meta.c?.host?.value).toBe("one");
});
