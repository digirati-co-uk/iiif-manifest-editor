import { createContext, useContext, useEffect, useMemo } from "react";
import { createStore, type StoreApi, useStore } from "zustand";
import { randomId } from "../helpers";

export type ContextMenuItem = {
  id: string;
  label: string;
  onAction: (options: { position: { x: number; y: number }; resource: { id: string; type: string } }) => void;
  disabled?: boolean;
  enabled?: boolean;
  enabledFunction?: (options: { resource: { id: string; type: string } }) => boolean;
  order?: number;
};

export type ContextMenuRequest = {
  resource?: { id?: string; type: string };
  sectionTitle?: string;
  items: Array<ContextMenuItem>;
};

type ContextMenuStore = {
  specificMenus: Record<
    string,
    {
      menus: Record<
        string,
        | {
            sectionTitle?: string;
            items: Array<ContextMenuItem>;
          }
        | undefined
      >;
    }
  >;

  resourceMenus: Record<
    string,
    {
      menus: Record<
        string,
        | {
            sectionTitle?: string;
            items: Array<ContextMenuItem>;
          }
        | undefined
      >;
    }
  >;

  hookMenuItem(req: ContextMenuRequest): () => void;
};

function createContextMenuStore() {
  return createStore<ContextMenuStore>((set, get) => ({
    specificMenus: {},
    resourceMenus: {},
    hookMenuItem(req: ContextMenuRequest) {
      const requestId = randomId();
      const resourceId = req.resource?.id || "";
      const resourceType = req.resource?.type;
      if (!resourceType) return () => {};

      if (resourceId) {
        set((prev) => {
          return {
            specificMenus: {
              ...prev.specificMenus,
              [resourceId]: {
                ...(prev.specificMenus[resourceId] || {}),
                menus: {
                  ...(prev.specificMenus[resourceId]?.menus || {}),
                  [requestId]: {
                    sectionTitle: req.sectionTitle,
                    items: req.items,
                  },
                },
              },
            },
          };
        });

        return () => {
          set((prev) => {
            return {
              specificMenus: {
                ...prev.specificMenus,
                [resourceId]: {
                  ...(prev.specificMenus[resourceId] || {}),
                  menus: {
                    ...(prev.specificMenus[resourceId]?.menus || {}),
                    [requestId]: undefined,
                  },
                },
              },
            };
          });
        };
      }
      set((prev) => {
        return {
          resourceMenus: {
            ...prev.resourceMenus,
            [resourceType]: {
              ...(prev.resourceMenus[resourceType] || {}),
              menus: {
                ...(prev.resourceMenus[resourceType]?.menus || {}),
                [requestId]: {
                  sectionTitle: req.sectionTitle,
                  items: req.items,
                },
              },
            },
          },
        };
      });

      return () => {
        set((prev) => {
          return {
            resourceMenus: {
              ...prev.resourceMenus,
              [resourceType]: {
                ...(prev.resourceMenus[resourceType] || {}),
                menus: {
                  ...(prev.resourceMenus[resourceType]?.menus || {}),
                  [requestId]: undefined,
                },
              },
            },
          };
        });
      };
    },
  }));
}

export const ContextMenuReactContext = createContext<StoreApi<ContextMenuStore> | null>(null);

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => {
    return createContextMenuStore();
  }, []);

  return <ContextMenuReactContext.Provider value={store}>{children}</ContextMenuReactContext.Provider>;
}

function useContextMenuStore() {
  const ctx = useContext(ContextMenuReactContext);
  if (!ctx) {
    throw new Error("useContextMenuStore must be used within a ContextMenuProvider");
  }
  return ctx;
}

export function useResourceContextMenuItems(req: { id?: string; type: string }) {
  const store = useContextMenuStore();
  const resourceMenus = useStore(store, (s) => s.resourceMenus);
  const specificMenus = useStore(store, (s) => s.specificMenus);

  return useMemo(() => {
    const specificRequests = specificMenus[req.id || ""]?.menus || {};
    const resourceRequests = resourceMenus[req.type]?.menus || {};

    const specificItems = Object.values(specificRequests).flat();
    const resourceItems = Object.values(resourceRequests).flat();

    const items = [...resourceItems, ...specificItems].filter((t) => typeof t !== "undefined");
    const seenIds: string[] = [];
    const returnSections = [];

    for (const section of items) {
      const sectionItems = [];
      for (const sectionItem of section.items || []) {
        if (sectionItem.id && seenIds.includes(sectionItem.id)) continue;
        seenIds.push(sectionItem.id);
        sectionItems.push(sectionItem);
      }
      if (sectionItems.length) {
        returnSections.push({
          ...section,
          items: sectionItems,
        });
      }
    }

    return returnSections;
  }, [specificMenus, resourceMenus, req.id, req.type]);
}

export function useCustomContextMenu(req: ContextMenuRequest, deps: any[] = []) {
  const store = useContextMenuStore();
  const hookMenuItem = useStore(store, (s) => s.hookMenuItem);

  useEffect(() => {
    return hookMenuItem(req);
  }, [hookMenuItem, req.resource?.id, req.resource?.type, ...deps]);
}
