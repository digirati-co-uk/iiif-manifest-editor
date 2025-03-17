import { createContext, useContext, useMemo } from "react";
import {
  type AtlasStore,
  type AtlasStoreEvents,
  createAtlasStore,
} from "./AtlasStore";
import type { StoreApi } from "zustand";
import { useEmitter } from "../hooks/use-event";

export const AtlasStoreReactContext =
  createContext<StoreApi<AtlasStore> | null>(null);

export function useAtlasStore() {
  return useContext(AtlasStoreReactContext) as StoreApi<AtlasStore>;
}

export function AtlasStoreProvider({
  children,
}: { children: React.ReactNode }) {
  const emitter = useEmitter<AtlasStoreEvents>();
  const value = useMemo(() => {
    return createAtlasStore({ events: emitter });
  }, []);

  return (
    <AtlasStoreReactContext.Provider value={value}>
      {children}
    </AtlasStoreReactContext.Provider>
  );
}
