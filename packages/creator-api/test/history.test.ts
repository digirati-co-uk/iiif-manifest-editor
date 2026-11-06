import { expect, test, vi } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { Creator } from "../src/Creator";
import { defineCreator } from "../src/creator-register";

const parent = { id: "c", type: "Canvas" as const };
test("creation, attachment and awaited effects undo together and redo does not rerun effects", async () => {
  const vault = new Vault({ history: true });
  vault.loadSync("c", { ...parent, width: 100, height: 100, items: [] });
  const effect = vi.fn(async (_result, { vault: scoped }) => {
    await Promise.resolve();
    scoped.modifyEntityField(parent, "width", 500);
  });
  const definition = defineCreator({
    id: "test/page",
    label: "Page",
    resourceType: "AnnotationPage",
    supports: {},
    sideEffects: [{ run: effect }],
    create: () => ({ id: "page", type: "AnnotationPage", items: [] }),
  });
  const creator = new Creator(vault, [definition]);
  await creator.create(definition.id, {}, { parent: { resource: parent, property: "items" } });
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.get(parent).width).toBe(500);
  expect(vault.undo().ok).toBe(true);
  expect(vault.get(parent).width).toBe(100);
  expect(vault.get(parent).items).toEqual([]);
  expect(vault.get({ id: "page", type: "AnnotationPage" })).toBeNull();
  expect(vault.redo().ok).toBe(true);
  expect(vault.get(parent).width).toBe(500);
  expect(effect).toHaveBeenCalledOnce();
});

test("aborting a creator invalidates awaited side effects while keeping applied work undoable", async () => {
  const vault = new Vault({ history: true });
  vault.loadSync("c", { ...parent, width: 100, height: 100, items: [] });
  const controller = new AbortController();
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const definition = defineCreator({
    id: "test/aborted-page",
    label: "Page",
    resourceType: "AnnotationPage",
    supports: {},
    create: () => ({ id: "page", type: "AnnotationPage", items: [] }),
    sideEffects: [
      {
        async run(_result, { vault: scoped }) {
          entered();
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          scoped.modifyEntityField(parent, "width", 500);
        },
      },
    ],
  });
  const pending = new Creator(vault, [definition]).create(
    definition.id,
    {},
    { signal: controller.signal, parent: { resource: parent, property: "items" } }
  );
  await started;
  controller.abort();
  release();
  await expect(pending).rejects.toThrow(/interaction is closed/);
  expect(vault.get(parent).width).toBe(100);
  expect(vault.undo().ok).toBe(true);
  expect(vault.get(parent).items).toEqual([]);
});

test("multi-selection preserves order at an insertion index through undo and redo", async () => {
  const vault = new Vault({ history: true });
  const manifest = { id: "m", type: "Manifest" as const };
  vault.loadSync("m", { ...manifest, items: [{ id: "existing", type: "Canvas", items: [] }] });
  const definition = defineCreator({
    id: "test/multiple",
    label: "Multiple canvases",
    resourceType: "Canvas",
    supports: {},
    create: () => ["first", "second"].map((id) => ({ id, type: "Canvas", items: [] })),
  });
  await new Creator(vault, [definition]).create(
    definition.id,
    {},
    {
      parent: { resource: manifest, property: "items", atIndex: 0 },
    }
  );
  const ids = () => vault.get(manifest).items.map((item) => item.id);
  expect(ids()).toEqual(["first", "second", "existing"]);
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo().ok).toBe(true);
  expect(ids()).toEqual(["existing"]);
  expect(vault.redo().ok).toBe(true);
  expect(ids()).toEqual(["first", "second", "existing"]);
});

test("reusing a loaded resource does not mutate retained snapshots or accumulate parent tracking", async () => {
  const vault = new Vault({ history: true });
  const manifest = { id: "m", type: "Manifest" as const };
  vault.loadSync("m", { ...manifest, items: [{ id: "c", type: "Canvas", items: [] }] });
  const definition = defineCreator({
    id: "test/reuse",
    label: "Reuse",
    resourceType: "Canvas",
    supports: {},
    create: (_data, ctx) => ctx.embed(ctx.vault.get(parent)),
  });
  const creator = new Creator(vault, [definition]);
  const before = vault.getState().iiif.entities;
  await creator.create(definition.id, {}, { parent: { resource: manifest, property: "start" } });
  const after = vault.getState().iiif.entities;
  expect(vault.undo()).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(before);
  expect(vault.redo()).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(after);
});
