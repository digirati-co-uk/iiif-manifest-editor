import { CollectionStorage, ManifestStorage, RemoteWebsocketStorage } from "@/shell/ProjectContext/types/Storage";
import { AbstractVaultLoader, EditorProject } from "@/shell";
import { Collection, Manifest } from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";

export class SingleVaultLoader extends AbstractVaultLoader<RemoteWebsocketStorage> {
  vault: Vault;
  type = "single-vault-loader";

  constructor(vault: Vault) {
    super();
    this.vault = vault;
  }

  async create(project: EditorProject, data: Manifest | Collection): Promise<RemoteWebsocketStorage> {
    throw new Error("Cannot create");
  }

  getStorage(storage: RemoteWebsocketStorage): Promise<CollectionStorage | ManifestStorage | null> {
    throw new Error("Method not implemented.");
  }

  shouldUpdateWithVault() {
    return true;
  }

  canCreate(): boolean {
    return false;
  }

  canDelete(): boolean {
    return false;
  }

  createVaultInstance(project: EditorProject): [Vault, Promise<void>] {
    const vault = this.vault;
    return [vault, Promise.resolve()];
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
