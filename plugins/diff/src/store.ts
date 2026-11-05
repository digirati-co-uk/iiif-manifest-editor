import type { DiffState, ResourceIdentity } from "@iiif/helpers/diff";
import { createStore } from "zustand/vanilla";
import { loadUndone, saveUndone, type UndoneEntry } from "./undone";

export type DiffView = "changes" | "visual" | "unified";

export function createDiffStore(initialUrl: string) {
  let request: AbortController | undefined;
  let autoloaded = false;
  return createStore<{
    url: string;
    source?: { state: DiffState; resource: ResourceIdentity; url: string; document?: unknown };
    loading: boolean;
    error?: string;
    selected?: string;
    /** Feedback from the last undo, when it could not be applied. */
    notice?: string;
    ignoreOrder: boolean;
    view: DiffView;
    /** Changes undone in this document, persisted so they can be redone after a reload. */
    undone: UndoneEntry[];
    addUndone: (entry: UndoneEntry) => void;
    removeUndone: (id: string) => void;
    update: (
      value: Partial<{ url: string; selected: string; notice: string | undefined; ignoreOrder: boolean; view: DiffView }>
    ) => void;
    /** Fetch the source. Silent loads never surface an error: an unresolvable source just stays unloaded. */
    load: (options?: { silent?: boolean }) => Promise<void>;
    /** Try the initial URL once per store. Failures are swallowed. */
    autoload: () => Promise<void>;
    cancel: () => void;
  }>((set, get) => ({
    url: initialUrl,
    loading: false,
    ignoreOrder: false,
    view: "changes",
    undone: loadUndone(initialUrl),
    addUndone: (entry) => {
      const undone = [...get().undone, entry];
      saveUndone(initialUrl, undone);
      set({ undone });
    },
    removeUndone: (id) => {
      const undone = get().undone.filter((entry) => entry.id !== id);
      saveUndone(initialUrl, undone);
      set({ undone });
    },
    update: (value) => set(value),
    cancel: () => {
      request?.abort();
      request = undefined;
      // An interrupted automatic attempt may be retried the next time the panel opens.
      if (!get().source) autoloaded = false;
      set({ loading: false });
    },
    autoload: async () => {
      if (autoloaded || get().source || get().loading) return;
      autoloaded = true;
      if (!/^https?:\/\//i.test(get().url.trim())) return;
      await get().load({ silent: true });
    },
    load: async ({ silent = false } = {}) => {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const url = get().url.trim();
      // Keep the previous source visible during a silent attempt so a failed reload changes nothing.
      set({ loading: true, error: undefined, ...(silent ? {} : { source: undefined, selected: undefined }) });
      try {
        const { fetchSource } = await import("./comparison");
        const source = await fetchSource(url, controller.signal);
        if (request === controller) set({ source: { ...source, url }, loading: false });
      } catch (error) {
        if (request === controller) {
          set({
            loading: false,
            error: silent ? undefined : error instanceof Error ? error.message : "Unable to load source.",
          });
        }
      }
    },
  }));
}

// State belongs to one editor Vault and root; no source leaks between projects.
const stores = new WeakMap<object, Map<string, ReturnType<typeof createDiffStore>>>();
export function getDiffStore(vault: object, id: string) {
  let resources = stores.get(vault);
  if (!resources) {
    resources = new Map();
    stores.set(vault, resources);
  }
  let store = resources.get(id);
  if (!store) {
    store = createDiffStore(id);
    resources.set(id, store);
  }
  return store;
}
