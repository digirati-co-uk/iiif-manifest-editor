import type { Vault4 } from "@iiif/helpers/vault-4";

export function serializeVaultResource(vault: Vault4, reference: any) {
  return vault.toPresentation4(reference);
}
