import { EditorProject } from "../ProjectContext.types";
import { Vault } from "@iiif/helpers/vault";
import { captureVaultCheckpoint, restoreVaultCheckpoint, type VaultCheckpoint } from "@manifest-editor/client-vault";
import { Collection, Manifest } from "@iiif/presentation-3";
import { ResourceKeyedStorage, ManifestStorage, CollectionStorage } from "../types/Storage";
import { AbstractVaultLoader } from "./AbstractVaultLoader";
import invariant from "tiny-invariant";
import localforage from "localforage";
import { randomId } from "../helpers/random-id";

type StoredProject = { version: 1; data: Manifest | Collection; checkpoint?: VaultCheckpoint };

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
      const key = `${this.namespace}/store/${storage.data.key}`;
      const stored = await this.storage.getItem<StoredProject>(key).catch(() => null);
      const item = stored ? null : localStorage.getItem(key);
      const manifest = stored?.data || (item ? JSON.parse(item) : null);

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
    const key = `${this.namespace}/store/${storage.data.key}`;
    await this.storage.setItem<StoredProject>(key, { version: 1, data: manifestStorage.data });
    localStorage.removeItem(key);
  }

  override createVaultInstance(project: EditorProject): [Vault, Promise<void>] {
    if (this.vaults[project.storage.data.key]) return super.createVaultInstance(project);
    const [vault, ready] = super.createVaultInstance(project);
    return [
      vault,
      ready.then(async () => {
        const stored = await this.storage
          .getItem<StoredProject>(`${this.namespace}/store/${project.storage.data.key}`)
          .catch(() => null);
        if (stored?.checkpoint) restoreVaultCheckpoint(vault, stored.checkpoint);
      }),
    ];
  }

  override async saveStorage(storage: ResourceKeyedStorage): Promise<void> {
    const vault = this.vaults[storage.data.key];
    if (!vault) return;
    const checkpoint = captureVaultCheckpoint(vault);
    const data = vault.toPresentation3<Manifest | Collection>({
      id: storage.data.id,
      type: storage.data.type as "Manifest" | "Collection",
    });
    if (!data) throw new Error("Project resource not found");
    const key = `${this.namespace}/store/${storage.data.key}`;
    await this.storage.setItem<StoredProject>(key, { version: 1, data, checkpoint });
    // Migrate only after the IndexedDB record has been written successfully.
    localStorage.removeItem(key);
  }

  async deleteStorage(storage: ResourceKeyedStorage): Promise<void> {
    this.vaults[storage.data.key] = null;
    const key = `${this.namespace}/store/${storage.data.key}`;
    await this.storage.removeItem(key);
    localStorage.removeItem(key);
  }

  getBackendStorage(project: EditorProject): ResourceKeyedStorage {
    // This will never change after creation, but other adapters might?
    return project.storage as ResourceKeyedStorage;
  }
}
