import type { Vault4 } from "@iiif/helpers/vault-4";

export function serializeStoredResource(vault: Vault4, resource: any) {
  const hasScenes = resource.type === "Manifest" && resource.items?.some((item: any) => item.type === "Scene");
  return hasScenes ? vault.toPresentation4(resource) : vault.toPresentation3(resource);
}
