import { Vault } from "@iiif/helpers/vault";

const vaults = new WeakMap<object, Vault>();

/**
 * A private Vault holding only the source document, so the editor's own components (thumbnails, labels) can
 * render source resources. It is never connected to the editor Vault. Created on demand and cached per source.
 */
export function getSourceVault(source: { state: object; resource: { id: string }; document?: unknown }) {
  let vault = vaults.get(source.state);
  if (!vault) {
    vault = new Vault();
    if (source.document) vault.loadSync(source.resource.id, structuredClone(source.document));
    vaults.set(source.state, vault);
  }
  return vault;
}
