import { Vault } from "@iiif/helpers/vault";
import { modifyEntityField } from "@iiif/helpers/vault/actions";
import { describe, expect, test, vi, afterEach } from "vitest";
import { changesToUndo, compareDocuments, fetchSource, normalizeDocument, redoActions, undoActions } from "./comparison";
import { createDiffStore, getDiffStore } from "./store";

const id = "https://example.org/manifest";
const resource = { id, type: "Manifest" };
const original = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  ...resource,
  label: { en: ["Original"] },
  items: [
    { id: `${id}/1`, type: "Canvas", label: { en: ["One"] }, width: 100, height: 100, items: [] },
    { id: `${id}/2`, type: "Canvas", label: { en: ["Two"] }, width: 100, height: 100, items: [] },
  ],
};
afterEach(() => vi.unstubAllGlobals());

describe("document comparison", () => {
  test("compares a scoped editor export without importing the source or unrelated Vault data", () => {
    const vault = new Vault();
    vault.loadManifestSync(id, structuredClone(original));
    vault.loadManifestSync("https://example.org/unrelated", {
      ...structuredClone(original),
      id: "https://example.org/unrelated",
    });
    const before = JSON.stringify(vault.getState());
    const baseline = normalizeDocument(original);
    const result = compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
    expect(result.diff.changes).toEqual([]);
    expect(result.patch).toBe("");
    expect(JSON.stringify(vault.getState())).toBe(before);
  });
  test("reports nested edits and reordering independently and exports contextual hunks", () => {
    const edited = structuredClone(original);
    edited.items.reverse();
    edited.items[1].label.en = ["Updated"];
    const baseline = normalizeDocument(original);
    const result = compareDocuments(baseline.state, edited, resource);
    expect(result.diff.changes.map((change) => change.kind).sort()).toEqual(["reorder", "replace"]);
    expect(result.patch).toContain('"Updated"');
    expect(result.patch).toContain("@@");
    const unordered = compareDocuments(baseline.state, edited, resource, true);
    expect(unordered.diff.changes).toHaveLength(1);
    expect(unordered.diff.changes[0].resource.id).toBe(`${id}/1`);
  });
  test("avoids misleading patches when root IDs differ", () => {
    const baseline = normalizeDocument({ ...original, id: "https://example.org/other" });
    const result = compareDocuments(baseline.state, original, resource);
    expect(result.sameRoot).toBe(false);
    expect(result.patch).toBeNull();
    expect(result.diff.changes.length).toBeGreaterThan(0);
  });
  test("rejects non-IIIF sources", () => {
    expect(() => normalizeDocument({ hello: "world" })).toThrow();
  });
});

describe("source loading", () => {
  test("handles HTTP errors and restricts URL protocols", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetch);
    await expect(fetchSource(id, new AbortController().signal)).rejects.toThrow("HTTP 404");
    await expect(fetchSource("file:///tmp/source.json", new AbortController().signal)).rejects.toThrow("HTTP or HTTPS");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  test("a stale request cannot replace a newer comparison", async () => {
    const pending: Array<(value: unknown) => void> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise((resolve) => pending.push(resolve)))
    );
    const store = createDiffStore(id);
    const first = store.getState().load();
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    store.getState().update({ url: `${id}?new` });
    const second = store.getState().load();
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]({ ok: true, json: async () => original });
    await second;
    pending[0]({ ok: true, json: async () => ({ ...original, label: { en: ["Stale"] } }) });
    await first;
    expect(store.getState().source?.url).toBe(`${id}?new`);
    expect(store.getState().source?.state.entities.Manifest[id].label).toEqual(original.label);
    expect(store.getState().loading).toBe(false);
  });
  test("isolates state per Vault and document", () => {
    const vault = {};
    expect(getDiffStore(vault, id)).toBe(getDiffStore(vault, id));
    expect(getDiffStore(vault, id)).not.toBe(getDiffStore({}, id));
    expect(getDiffStore(vault, id)).not.toBe(getDiffStore(vault, `${id}/other`));
  });
});

describe("undo", () => {
  const edit = (change: (document: typeof original) => void) => {
    const vault = new Vault();
    vault.loadManifestSync(id, structuredClone(original));
    const document = vault.toPresentation3(resource) as any;
    change(document);
    return document;
  };
  const undoAll = (editedDocument: any) => {
    const baseline = normalizeDocument(original);
    const first = compareDocuments(baseline.state, editedDocument, resource);
    const vault = new Vault();
    vault.loadManifestSync(id, structuredClone(editedDocument));
    for (const change of first.diff.changes) {
      const current = compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
      const target = current.diff.changes.find((candidate) => candidate.id === change.id);
      if (!target) continue;
      vault.batch(() => {
        for (const action of undoActions(current.current, current.diff, current.diff.changes, target)) {
          vault.dispatch(action);
        }
      });
    }
    return compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
  };

  test("reverting each change restores the source", () => {
    const result = undoAll(
      edit((document) => {
        document.label = { en: ["Changed"] };
        document.items.reverse();
        document.items[0].label = { en: ["Renamed"] };
      })
    );
    expect(result.diff.changes).toEqual([]);
  });

  test("undoing an added resource removes the reference to it as well", () => {
    const result = undoAll(
      edit((document) => {
        document.items.push({ id: `${id}/3`, type: "Canvas", label: { en: ["Three"] }, width: 1, height: 1, items: [] });
      })
    );
    expect(result.diff.changes).toEqual([]);
  });

  test("undoing a removed resource restores it", () => {
    const result = undoAll(
      edit((document) => {
        document.items.pop();
      })
    );
    expect(result.diff.changes).toEqual([]);
  });
});

describe("source vault", () => {
  test("holds the source on its own so editor components can render removed resources", async () => {
    const { getSourceVault } = await import("./source-vault");
    const source = normalizeDocument(original);
    const vault = getSourceVault({ ...source });
    expect(vault.get({ id: `${id}/1`, type: "Canvas" })).toBeTruthy();
    expect(getSourceVault({ ...source })).toBe(vault);
    expect(vault).not.toBe(new Vault());
  });
});

describe("redo", () => {
  test("redoing restores exactly what was undone, including added resources and their references", async () => {
    const { createUndoneEntry } = await import("./undone");
    const vault = new Vault();
    const edited = structuredClone(original) as any;
    edited.label = { en: ["Changed"] };
    edited.items.push({ id: `${id}/3`, type: "Canvas", label: { en: ["Three"] }, width: 1, height: 1, items: [] });
    vault.loadManifestSync(id, structuredClone(edited));
    const baseline = normalizeDocument(original);
    const snapshot = JSON.stringify(vault.toPresentation3(resource));

    for (const pick of [(c: any) => c.path[0] === "label", (c: any) => c.path.length === 0]) {
      const current = compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
      const change = current.diff.changes.find(pick)!;
      const ids = changesToUndo(current.diff.changes, change);
      vault.batch(() => undoActions(current.current, current.diff, current.diff.changes, change).forEach((a) => vault.dispatch(a as any)));
      const entry = createUndoneEntry("https://example.org/source", current.diff, change, ids);
      const after = compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
      expect(after.diff.changes.some((c) => ids.includes(c.id))).toBe(false);
      vault.batch(() => redoActions(after.current, JSON.parse(JSON.stringify(entry))).forEach((a) => vault.dispatch(a as any)));
    }
    expect(JSON.stringify(vault.toPresentation3(resource))).toBe(snapshot);
  });

  test("redo refuses when that part of the document was edited since", async () => {
    const { createUndoneEntry } = await import("./undone");
    const vault = new Vault();
    const edited = structuredClone(original);
    edited.label = { en: ["Changed"] };
    vault.loadManifestSync(id, structuredClone(edited));
    const baseline = normalizeDocument(original);
    const current = compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
    const change = current.diff.changes[0]!;
    vault.batch(() => undoActions(current.current, current.diff, current.diff.changes, change).forEach((a) => vault.dispatch(a as any)));
    const entry = createUndoneEntry("u", current.diff, change, changesToUndo(current.diff.changes, change));
    vault.dispatch(modifyEntityField({ id, type: "Manifest", key: "label", value: { en: ["Edited again"] } }));
    const now = compareDocuments(baseline.state, vault.toPresentation3(resource), resource);
    expect(() => redoActions(now.current, entry)).toThrow();
  });
});
