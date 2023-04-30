import { Vault } from "@iiif/vault";
import { EditorProject, ProjectStorage } from "../ProjectContext.types";
import { Collection, Manifest, Reference } from "@iiif/presentation-3";
import { CollectionStorage, ManifestStorage, Storage } from "../types/Storage";

export abstract class AbstractVaultLoader<T extends Storage>
  implements ProjectStorage<ManifestStorage | CollectionStorage, Manifest | Collection, T>
{
  abstract type: string;
  vaults: Record<string, Vault | null> = {};
  saveInterval: number;

  protected constructor(config: Partial<{ saveInterval: number }> = {}) {
    this.saveInterval = config.saveInterval || 5000;
  }

  shouldUpdateWithVault() {
    return true;
  }

  canCreate() {
    return true;
  }

  canDelete() {
    return true;
  }

  abstract create(project: EditorProject, data: Manifest | Collection): Promise<T>;

  createVaultInstance(project: EditorProject): [Vault, Promise<void>] {
    const foundVault = this.vaults[project.storage.data.key];
    if (foundVault) {
      return [foundVault, Promise.resolve()];
    }

    const vault = new Vault();

    const promise = async () => {
      const data = await this.getStorage(project.storage as any);
      await vault.loadManifest(project.resource.id, JSON.parse(JSON.stringify(data?.data)));
      this.vaults[project.storage.data.key] = vault;
    };

    return [vault, promise() as Promise<void>];
  }

  async saveStorage(storage: T): Promise<void> {
    const vault = this.vaults[storage.data.key];
    const manifestRef: Reference<"Manifest" | "Collection"> = {
      id: storage.data.id,
      type: storage.data.type,
    };

    // There will only be something to save if there is active vault.
    if (vault) {
      const data = vault.toPresentation3<Manifest | Collection>(manifestRef);

      const stored: ManifestStorage | CollectionStorage =
        data.type === "Collection"
          ? ({
              type: "collection-storage",
              data,
            } as CollectionStorage)
          : ({
              type: "manifest-storage",
              data,
            } as ManifestStorage);

      await this.saveStorageData(stored, storage);
    }
  }

  abstract getStorage(storage: T): Promise<CollectionStorage | ManifestStorage | null>;

  abstract saveStorageData(manifest: CollectionStorage | ManifestStorage, storage: T): void | Promise<void>;

  abstract deleteStorage(storage: T): Promise<void>;

  abstract getBackendStorage(project: EditorProject): T;
}
