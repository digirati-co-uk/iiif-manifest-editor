import { Reference } from "@iiif/presentation-3";
import { createContext, ReactNode, useContext, useMemo } from "react";
import invariant from "tiny-invariant";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { EditorInstance } from "../../editor-api/EditorInstance";

interface ResourceEditingContext {
  resource: Reference<any> | null;
}

const ResourceEditingReactContext = createContext<ResourceEditingContext>({
  resource: null,
});

export function useEditingContext() {
  return useContext(ResourceEditingReactContext);
}

/**
 * useResource
 *
 * Only use this if you KNOW that there is a resource (e.g. in a panel)
 */
export function useResource<T = Record<string, never>>(): T & Reference<any> {
  const vault = useVault();
  const { resource } = useEditingContext();

  invariant(resource, "Nothing selected");

  const { id, type } = resource;

  const fullResource = useVaultSelector(() => {
    return vault.get({ id, type });
  }, [id, type]);

  return fullResource as T & Reference<any>;
}

/**
 * useOptionalResource
 *
 * Use in components where you don't know if something is editing. (e.g. canvas listing)
 */
export function useOptionalResource() {
  const { resource } = useEditingContext();

  return resource;
}

export function ResourceEditingProvider({
  resource,
  children,
}: {
  resource: { id: string; type: string } | null | undefined;
  children: ReactNode;
}) {
  const { id, type } = resource || {};

  return (
    <ResourceEditingReactContext.Provider
      value={useMemo(
        () => ({
          // Current resource.
          resource: id && type ? { id, type } : null,
        }),
        [id, type]
      )}
    >
      {children}
    </ResourceEditingReactContext.Provider>
  );
}
