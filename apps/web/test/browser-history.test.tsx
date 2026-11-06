import { beforeEach, expect, test, vi } from "vitest";
import {
  captureVaultCheckpoint,
  createManifestEditorVault,
  restoreVaultCheckpoint,
} from "@manifest-editor/client-vault";
import {
  closeBrowserProject,
  createBrowserProject,
  internal_getBrowserProjectById,
  openBrowserProject,
  saveBrowserProjectVaultData,
} from "../src/components/browser-editor/browser-state";
const data = vi.hoisted(() => new Map<string, any>());
vi.mock("idb-keyval", () => ({
  createStore: () => ({}),
  get: async (key: string) => structuredClone(data.get(key)),
  set: async (key: string, value: any) => {
    data.set(key, structuredClone(value));
  },
  update: async (key: string, callback: (value: any) => any) => {
    data.set(key, structuredClone(callback(structuredClone(data.get(key)))));
  },
  del: async (key: string) => {
    data.delete(key);
  },
  delMany: async () => {},
  keys: async () => [...data.keys()],
}));
vi.mock("../src/components/site/Provider", () => ({ queryClient: {} }));
beforeEach(() => data.clear());
const ref = { id: "m", type: "Manifest" as const };
test("browser project stores document and undo/redo in one record and detects stale writers", async () => {
  const vault = createManifestEditorVault();
  vault.loadSync("m", { ...ref, label: { en: ["Original"] }, items: [] });
  const resource = { ...ref, label: { en: ["Original"] }, thumbnail: "" };
  const project = await createBrowserProject("p", resource, ref, vault.getState().iiif, {});
  vault.modifyEntityField(ref, "label", { en: ["Edited"] });
  const checkpoint = captureVaultCheckpoint(vault);
  const etag = await saveBrowserProjectVaultData(
    "p",
    checkpoint.vaultData,
    project.etag!,
    undefined,
    checkpoint.historySnapshot
  );
  await closeBrowserProject("p");
  const opened = await openBrowserProject("p");
  const restored = createManifestEditorVault();
  expect(restoreVaultCheckpoint(restored, opened.project)).toBe(true);
  expect(restored.undo().ok).toBe(true);
  expect(restored.get(ref).label).toEqual({ en: ["Original"] });
  expect(restored.redo().ok).toBe(true);
  await expect(saveBrowserProjectVaultData("p", project.vaultData, project.etag!)).rejects.toThrow("etag mismatch");
  expect((await internal_getBrowserProjectById("p"))!.etag).toBe(etag);
  // A document-only autosave must remove the preceding snapshot, never replay stale history.
  await saveBrowserProjectVaultData("p", checkpoint.vaultData, etag);
  expect((await internal_getBrowserProjectById("p"))!.historySnapshot).toBeUndefined();
});
