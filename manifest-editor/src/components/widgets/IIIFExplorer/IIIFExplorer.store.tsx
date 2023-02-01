import create, { StoreApi } from "zustand/vanilla";
import { CollectionNormalized, ManifestNormalized, Reference } from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useExistingVault } from "react-iiif-vault";

interface Store {
  history: string[];
  selected: string | null;

  // @todo type..
  refinements: any[];

  recent: string[];

  error: string | null;

  scrollRestoreCache: Record<string, number>;

  setRecent(recent: string[]): void;

  select(resource: string, reset?: boolean): void;
  updateKey(before: string, after: string): void;

  setScrollCache(id: string, scroll: number): void;
  back(): void;
}
export const createStore = (vault: Vault, initial?: string) =>
  create<Store>()((set, get) => ({
    history: [],
    selected: null,
    refinements: [],
    error: null,
    recent: [],
    scrollRestoreCache: {},
    resetError() {
      set({ error: null });
    },

    setScrollCache(id: string, scroll: number) {
      if (id) {
        set((s) => ({
          scrollRestoreCache: { ...s.scrollRestoreCache, [id]: scroll },
        }));
      }
    },

    setRecent(recent: string[]) {
      // load if not loaded.
      set({ recent });
    },

    select(resource: string, reset = false) {
      vault
        .load<CollectionNormalized | ManifestNormalized>(resource)
        .then((loaded) => {
          if (loaded && resource !== loaded.id) {
            get().updateKey(resource, loaded.id);
          }
          // ?
        })
        .catch((error) => {
          set({ error: error.toString() });
        });

      if (reset) {
        set({ selected: resource, history: [] });
        return;
      }
      // 1. Check if it's in the recent list
      const state = get();
      if (state.history.find((r) => r === resource)) {
        // We found it!
        set({ selected: resource });
      } else {
        // 2. If not - add to the end
        set((s) => ({
          selected: resource,
          history: [...s.history, resource],
        }));
      }
    },

    updateKey(before: string, after: string) {
      const state = get();
      const newHistory = state.history.slice(0);
      let changed = false;
      for (let i = 0; i < state.history.length; i++) {
        const key = state.history[i];
        if (key === before) {
          changed = true;
          newHistory[i] = after;
        }
      }
      if (changed) {
        set({ history: newHistory });
      }
      if (state.selected === before) {
        set({ selected: after });
      }
    },

    back() {
      const state = get();
      const len = state.history.length;
      if (len < 2 || !state.selected) {
        return;
      }
      const index = state.history.findIndex((s) => s && s === state.selected);
      if (index !== -1) {
        const selected = state.history[index - 1];
        state.select(selected);
        set({
          history: state.history.slice(0, index),
        });
      }
    },
  }));

const ReactContext = createContext<StoreApi<Store> | undefined>(undefined);

export function useExplorerStore() {
  const store = useContext(ReactContext);
  if (!store) {
    throw new Error("No store found");
  }
  return store;
}

export function ExplorerStoreProvider({ children, entry }: { children?: ReactNode; entry?: Reference }) {
  const vault = useExistingVault();

  const store = useMemo(() => {
    const store = createStore(vault);

    // Initialisation.
    if (entry) {
      store.getState().select(entry.id);
    }

    return store;
  }, [vault]);

  return <ReactContext.Provider value={store}>{children}</ReactContext.Provider>;
}
