import { beforeEach, expect, test, vi } from "vitest";
import { LocalStorageLoader } from "../src/storage/LocalStorageLoader";
import type { EditorProject } from "../src/ProjectContext.types";
const store = vi.hoisted(() => new Map<string, any>());
vi.mock("localforage", () => ({
  default: {
    createInstance: () => ({
      getItem: vi.fn(async (key: string) => store.get(key) || null),
      setItem: vi.fn(async (key: string, value: any) => {
        store.set(key, structuredClone(value));
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    }),
  },
}));
beforeEach(() => {
  store.clear();
  localStorage.clear();
});
const manifest = { id: "m", type: "Manifest" as const, label: { en: ["Original"] }, items: [] };
test("legacy project migrates to one IndexedDB record with document and both history stacks", async () => {
  const loader = new LocalStorageLoader();
  const storage = await loader.create({} as EditorProject, manifest);
  const project = { storage, resource: { id: "m", type: "Manifest" } } as EditorProject;
  const [vault, ready] = loader.createVaultInstance(project);
  await ready;
  vault.modifyEntityField(manifest, "label", { en: ["Changed"] });
  vault.modifyEntityField(manifest, "summary", { en: ["Summary"] });
  vault.undo();
  await loader.saveStorage(storage);
  expect(localStorage.getItem(`default/store/${storage.data.key}`)).toBeNull();
  const reopened = new LocalStorageLoader();
  const [restored, restoredReady] = reopened.createVaultInstance(project);
  await restoredReady;
  expect(restored.history!.getState()).toMatchObject({ canUndo: true, canRedo: true });
  expect(restored.redo().ok).toBe(true);
  expect(restored.get(manifest).summary).toEqual({ en: ["Summary"] });
  expect(restored.undo().ok).toBe(true);
  expect(restored.undo().ok).toBe(true);
  expect(restored.get(manifest).label).toEqual({ en: ["Original"] });
  await reopened.deleteStorage(storage);
  expect(store.size).toBe(0);
});
test("failed IndexedDB migration retains the original project", async () => {
  const loader = new LocalStorageLoader();
  const storage = await loader.create({} as EditorProject, manifest);
  const project = { storage, resource: manifest } as unknown as EditorProject;
  const [vault, ready] = loader.createVaultInstance(project);
  await ready;
  vault.modifyEntityField(manifest, "label", { en: ["Changed"] });
  vi.mocked(loader.storage.setItem).mockRejectedValueOnce(new Error("Quota exceeded"));
  await expect(loader.saveStorage(storage)).rejects.toThrow("Quota exceeded");
  expect(localStorage.getItem(`default/store/${storage.data.key}`)).not.toBeNull();
});
