import { useContext } from "react";
import { type AtlasStore, AtlasStoreProvider, AtlasStoreReactContext } from "react-iiif-vault";
import type { StoreApi } from "zustand";

export { AtlasStoreProvider, AtlasStoreReactContext };

export function useAtlasStore() {
  return useContext(AtlasStoreReactContext) as StoreApi<AtlasStore>;
}
