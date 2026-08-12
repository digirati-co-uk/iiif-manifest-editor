import { EditorProject } from "../ProjectContext.types";
import type { Vault4 } from "@iiif/helpers/vault-4";
import { Collection, Manifest } from "@iiif/parser";
import { ManifestStorage, CollectionStorage, RemoteWebsocketStorage } from "../types/Storage";
import { AbstractVaultLoader } from "./AbstractVaultLoader";
import { ClientVault } from "@manifest-editor/client-vault";

export class WebsocketLoader extends AbstractVaultLoader<RemoteWebsocketStorage> {
  type = "websocket-storage";
  baseUrl: string;
  token: string;

  constructor(settings: { baseUrl: string; token: string }) {
    super({ saveInterval: 5000 });
    this.baseUrl = settings.baseUrl;
    this.token = settings.token;
  }

  getStorage(storage: RemoteWebsocketStorage): Promise<CollectionStorage | ManifestStorage | null> {
    throw new Error("Method not implemented.");
  }

  shouldUpdateWithVault() {
    return true;
  }

  async create(project: EditorProject, data: Manifest | Collection): Promise<RemoteWebsocketStorage> {
    throw new Error("Cannot create new project from Manifest Editor");
  }

  canCreate(): boolean {
    return false;
  }

  canDelete(): boolean {
    return false;
  }

  createVaultInstance(project: EditorProject): [Vault4, Promise<void>] {
    const vault = new ClientVault(`${this.baseUrl}/vault/${project.storage.data.id}?token=${this.token}`);

    return [vault as unknown as Vault4, vault.waitUntilReady()];
  }

  closeVaultInstance(project: EditorProject, vault: Vault4): void {
    if (vault instanceof ClientVault) {
      vault.ws.close();
    }
  }

  async saveStorageData(
    manifestStorage: ManifestStorage | CollectionStorage,
    storage: RemoteWebsocketStorage
  ): Promise<void> {
    // No-op? Maybe in the future we will send a message to the server to save the manifest
  }

  async deleteStorage(storage: RemoteWebsocketStorage): Promise<void> {
    throw new Error("Cannot delete");
  }

  getBackendStorage(project: EditorProject): RemoteWebsocketStorage {
    // This will never change after creation, but other adapters might?
    return project.storage as RemoteWebsocketStorage;
  }
}
