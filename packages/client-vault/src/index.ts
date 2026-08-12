import type { Vault4Options } from "@iiif/helpers/vault-4";
import { ClientVault } from "./client-vault";
import { MessagePortClientVault } from "./message-port-client-vault";

export { ClientVault };
export { MessagePortClientVault };
export type * from "./protocol";

export async function createClientVault(url: string, options?: Partial<Vault4Options>) {
  const vault = new ClientVault(url, options);

  await vault.waitUntilReady();

  return vault;
}
