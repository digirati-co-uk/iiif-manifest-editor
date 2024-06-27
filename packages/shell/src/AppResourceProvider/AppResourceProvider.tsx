import { createContext, useContext } from "react";
import { CollectionContext, ManifestContext, VaultProvider, useExistingVault } from "react-iiif-vault";
import invariant from "tiny-invariant";

export interface Resource {
  id: string;
  type: string;
}

const AppResourceReactProvider = createContext<Resource | null>(null);
const AppResourceInstanceReactProvider = createContext<string | null>(null);

export function useAppResourceInstance() {
  const ctx = useContext(AppResourceInstanceReactProvider);
  const resource = useContext(AppResourceReactProvider);

  const instanceId = ctx || resource?.id;

  invariant(instanceId, "useResourceInstance can only be called from inside <ResourceProvider />");

  return instanceId;
}

export function useAppResource() {
  const ctx = useContext(AppResourceReactProvider);

  invariant(ctx, "useResource can only be called from inside <ResourceProvider />");

  return ctx;
}

export function AppResourceInstanceProvider({ id, children }: { id?: string; children: React.ReactNode }) {
  if (!id) {
    return children;
  }
  return <AppResourceInstanceReactProvider.Provider value={id}>{children}</AppResourceInstanceReactProvider.Provider>;
}

export function AppResourceProvider({ resource, children }: { resource?: Resource; children: React.ReactNode }) {
  const vault = useExistingVault();

  let inner = children;

  if (resource && resource.type === "Manifest") {
    inner = (
      <VaultProvider vault={vault || undefined}>
        <ManifestContext manifest={resource.id || ""}>{children}</ManifestContext>
      </VaultProvider>
    );
  }

  if (resource && resource.type === "Collection") {
    inner = (
      <VaultProvider vault={vault || undefined}>
        <CollectionContext collection={resource.id || ""}>{children}</CollectionContext>
      </VaultProvider>
    );
  }

  return <AppResourceReactProvider.Provider value={resource as any}>{inner}</AppResourceReactProvider.Provider>;
}
