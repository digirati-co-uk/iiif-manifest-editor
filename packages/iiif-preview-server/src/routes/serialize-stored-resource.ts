import type { Vault4 } from "@iiif/helpers/vault-4";

export function serializeStoredResource(vault: Vault4, resource: any) {
  try {
    return vault.toPresentation3(resource);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Presentation 4 -> 3 downgrade unsupported:")) {
      return vault.toPresentation4(resource);
    }
    throw error;
  }
}
