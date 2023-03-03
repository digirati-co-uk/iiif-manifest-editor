import create, { StoreApi } from "zustand/vanilla";
import { CollectionNormalized, ManifestNormalized, Reference } from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useExistingVault } from "react-iiif-vault";

interface Store {
  history: Reference[];
  selected: Reference | null;

  // @todo type..
  refinements: any[];

  recent: Reference[];

  error: string | null;

  scrollRestoreCache: Record<string, number>;

  setRecent(recent: Reference[]): void;

  select(resource: Reference, reset?: boolean): void;
  updateKey(before: Reference, after: Reference): void;

  setScrollCache(id: string, scroll: number): void;
  back(): void;
}
export const createStore = (vault: Vault, options: { initial?: string; canReset?: boolean }) =>
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

    setRecent(recent: Reference[]) {
      // load if not loaded.
      set({ recent });
    },

    select(_resource: string | Reference, reset = false) {
      let resource = typeof _resource === "string" ? { id: _resource, type: "unknown" } : _resource;

      const status = vault.requestStatus(resource.id);
      const found = vault.get<any>(resource.id);
      if (found) {
        resource.type = found.type;
      }

      if (!status || status.loadingState === "RESOURCE_ERROR") {
        vault
          .load<CollectionNormalized | ManifestNormalized>(_resource)
          .then((loaded) => {
            if (loaded && resource.id !== loaded.id) {
              get().updateKey(resource, loaded);
            }
          })
          .catch((error) => {
            set({ error: error.toString() });
          });
      } else if (status) {
        resource = vault.get<any>(resource, { skipSelfReturn: false });
      }

      const ref = { id: resource.id, type: resource.type };

      if (reset) {
        set({ selected: ref, history: [] });
        return;
      }
      // 1. Check if it's in the recent list
      const state = get();
      if (state.history.find((r) => r.id === ref.id)) {
        // We found it!
        set({ selected: ref });
      } else {
        // 2. If not - add to the end
        set((s) => ({
          selected: ref,
          history: [...s.history, ref],
        }));
      }
    },

    updateKey(before: Reference, updated: Reference) {
      const state = get();
      const newHistory = state.history.slice(0);
      let changed = false;
      for (let i = 0; i < state.history.length; i++) {
        const key = state.history[i];
        if (key === before) {
          changed = true;
          newHistory[i] = updated;
        }
      }
      if (changed) {
        set({ history: newHistory });
      }
      if (state.selected && state.selected.id === before.id) {
        set({ selected: updated });
      }
    },

    back() {
      const state = get();
      const len = state.history.length;
      if (!options.canReset && (len < 2 || !state.selected)) {
        return;
      }
      const index = state.history.findIndex((s) => s && s.id === state.selected?.id);
      if (index >= 1) {
        const selected = state.history[index - 1];
        state.select(selected);
        set({
          history: state.history.slice(0, index),
        });
      } else {
        set({ history: [], selected: null });
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

export function ExplorerStoreProvider({
  children,
  entry,
  options,
}: {
  children?: ReactNode;
  entry?: Reference;
  options?: { canReset?: boolean };
}) {
  const vault = useExistingVault();

  const store = useMemo(() => {
    const store = createStore(vault, options || {});

    // Initialisation.
    if (entry) {
      store.getState().select(entry);
    }

    return store;
  }, [vault]);

  return <ReactContext.Provider value={store}>{children}</ReactContext.Provider>;
}
