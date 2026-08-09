import type { Vault4 } from "@iiif/helpers/vault-4";

export function serializeVaultResource(vault: Vault4, reference: any) {
  const resource: any = vault.get(reference);
  const hasScenes = resource?.type === "Manifest" && resource.items?.some((item: any) => item.type === "Scene");
  return hasScenes ? vault.toPresentation4(reference) : vault.toPresentation3(reference);
}
