import type { VaultOptions } from "@iiif/helpers/vault";
import { ClientVault } from "./client-vault";
import { MessagePortClientVault } from "./message-port-client-vault";

export { ClientVault };
export { MessagePortClientVault };
export type * from "./protocol";

export async function createClientVault(
  url: string,
  options?: Partial<VaultOptions>,
) {
  const vault = new ClientVault(url, options);

  await vault.waitUntilReady();

  return vault;
}
