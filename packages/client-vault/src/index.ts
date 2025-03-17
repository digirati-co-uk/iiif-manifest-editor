import type { VaultOptions } from "@iiif/helpers/vault";
import { ClientVault } from "./client-vault";

export { ClientVault };

export async function createClientVault(
  url: string,
  options?: Partial<VaultOptions>,
) {
  const vault = new ClientVault(url, options);

  await vault.waitUntilReady();

  return vault;
}
