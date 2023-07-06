import create, { StoreApi } from "zustand/vanilla";
import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { Vault } from "@iiif/vault";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useExistingVault } from "react-iiif-vault";
import { SupportedSelector } from "@iiif/vault-helpers";
import { HistoryItem } from "@/components/widgets/IIIFExplorer/IIIFExplorer.types";

interface Store {
  history: HistoryItem[];
  selected: HistoryItem | null;

  // @todo type..
  refinements: any[];

  recent: HistoryItem[];

  error: string | null;

  scrollRestoreCache: Record<string, number>;

  setRecent(recent: HistoryItem[]): void;

  select(resource: HistoryItem, reset?: boolean): void;

  replace(resource: HistoryItem): void;
  setCurrentSelector(selector: SupportedSelector | undefined): void;

  clearListing(): void;
  addToListing(item: HistoryItem): void;
  removeFromListing(item: HistoryItem): void;

  updateKey(before: HistoryItem, after: HistoryItem): void;

  setScrollCache(id: string, scroll: number): void;
  back(): void;
}
export const createStore = (
  vault: Vault,
  options: { initial?: string; canReset?: boolean; onHistory?: (id: string, type: string) => void }
) =>
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

    setRecent(recent: HistoryItem[]) {
      // load if not loaded.
      set({ recent });
    },

    replace(resource) {
      get().back();
      get().select(resource);
    },

    setCurrentSelector(selector: SupportedSelector | undefined) {
      const selected = get().selected;
      if (!selected) {
        return;
      }

      set({ selected: { ...selected, selector } });
    },

    addToListing(item: HistoryItem) {
      const selected = get().selected;
      if (!selected) {
        return;
      }
      const listing = selected.listing || [];

      set({ selected: { ...selected, listing: [...listing.filter((t) => t.id !== item.id), item] } });
    },

    clearListing() {
      const selected = get().selected;
      if (!selected) {
        return;
      }
      set({ selected: { ...selected, listing: [] } });
    },

    removeFromListing(item: HistoryItem) {
      const selected = get().selected;
      if (!selected) {
        return;
      }
      if (!selected.listing) {
        return;
      }

      set({ selected: { ...selected, listing: selected.listing.filter((listItem) => listItem.id !== item.id) } });
    },

    select(_resource: string | HistoryItem, reset = false) {
      let resource = typeof _resource === "string" ? { id: _resource, type: "unknown" } : _resource;

      const status = vault.requestStatus(resource.id);
      const found = vault.get<any>(resource.id);
      if (found) {
        if (resource.type === "unknown") {
          resource.type = found.type;
        }
      }

      if (["Collection", "Manifest", "unknown"].includes(resource.type)) {
        if (!status || status.loadingState === "RESOURCE_ERROR") {
          vault
            .load<CollectionNormalized | ManifestNormalized>(_resource)
            .then((loaded) => {
              if (loaded && (resource.id !== loaded.id || resource.type !== loaded.type)) {
                get().updateKey(resource, loaded);
              }
            })
            .catch((error) => {
              set({ error: error.toString() });
            });
        } else if (status) {
          resource = vault.get<any>(resource, { skipSelfReturn: false });
        }
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

      // Add to history.
      if (options.onHistory) {
        options.onHistory(ref.id, ref.type);
      }
    },

    updateKey(before: HistoryItem, updated: HistoryItem) {
      const state = get();
      const newHistory = state.history.slice();
      let changed = false;
      for (let i = 0; i < state.history.length; i++) {
        const key = state.history[i];
        if (key.id === before.id) {
          changed = true;
          newHistory[i] = { id: updated.id, type: updated.type };
        }
      }
      if (changed) {
        set({ history: newHistory });
      }
      if (state.selected && state.selected.id === before.id) {
        set({ selected: { id: updated.id, type: updated.type } });
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
  entry?: HistoryItem;
  options?: { canReset?: boolean; onHistory?: (id: string, type: string) => void };
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
