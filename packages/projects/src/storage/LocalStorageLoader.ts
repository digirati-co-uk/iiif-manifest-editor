import { EditorProject } from "../ProjectContext.types";
import { Vault } from "@iiif/helpers/vault";
import { Collection, Manifest } from "@iiif/presentation-3";
import { ResourceKeyedStorage, ManifestStorage, CollectionStorage } from "../types/Storage";
import { AbstractVaultLoader } from "./AbstractVaultLoader";
import invariant from "tiny-invariant";
import localforage from "localforage";
import { randomId } from "../helpers/random-id";

export class LocalStorageLoader extends AbstractVaultLoader<ResourceKeyedStorage> {
  type = "local-storage";
  namespace: string;
  storage: LocalForage;

  vaults: Record<string, Vault | null> = {};

  constructor(settings?: { namespace?: string }) {
    super({ saveInterval: 5000 });
    this.namespace = settings?.namespace || "default";
    this.storage = localforage.createInstance({
      name: "local-storage-resource-loader",
    });
  }

  shouldUpdateWithVault() {
    return true;
  }

  async create(project: EditorProject, data: Manifest | Collection): Promise<ResourceKeyedStorage> {
    const key = randomId();

    await localStorage.setItem(`${this.namespace}/store/${key}`, JSON.stringify(data));

    return {
      type: "resource-keyed-storage",
      data: {
        id: data.id,
        type: data.type,
        key,
      },
    };
  }

  async getStorage(storage: ResourceKeyedStorage): Promise<CollectionStorage | ManifestStorage | null> {
    try {
      const item = await localStorage.getItem(`${this.namespace}/store/${storage.data.key}`);
      const manifest = item ? (JSON.parse(item) as any) : null;

      invariant(manifest, "Resource not found");

      if (manifest.type === "Collection") {
        return {
          type: "collection-storage",
          data: manifest,
        };
      }

      return {
        type: "manifest-storage",
        data: manifest,
      };
    } catch (e) {
      return null;
    }
  }

  async saveStorageData(
    manifestStorage: ManifestStorage | CollectionStorage,
    storage: ResourceKeyedStorage
  ): Promise<void> {
    await localStorage.setItem(`${this.namespace}/store/${storage.data.key}`, JSON.stringify(manifestStorage.data));
  }

  async deleteStorage(storage: ResourceKeyedStorage): Promise<void> {
    this.vaults[storage.data.key] = null;
    await localStorage.removeItem(`${this.namespace}/store/${storage.data.key}`);
  }

  getBackendStorage(project: EditorProject): ResourceKeyedStorage {
    // This will never change after creation, but other adapters might?
    return project.storage as ResourceKeyedStorage;
  }
}
