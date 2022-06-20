import { EditorProject, ProjectStorage } from "../ProjectContext.types";
import { Vault } from "@iiif/vault";
import { Manifest, Reference } from "@iiif/presentation-3";
import { ManifestKeyedStorage, ManifestStorage } from "../types/Storage";
import { v4 } from "uuid";
import { AbstractVaultLoader } from "./AbstractVaultLoader";
import { writeTextFile } from "@tauri-apps/api/fs";
import invariant from "tiny-invariant";

export class LocalStorageLoader extends AbstractVaultLoader<ManifestKeyedStorage> {
  type = "local-storage";
  namespace: string;

  vaults: Record<string, Vault | null> = {};

  constructor(settings?: { namespace?: string }) {
    super({ saveInterval: 5000 });
    this.namespace = settings?.namespace || "default";
  }

  shouldUpdateWithVault() {
    return true;
  }

  async create(project: EditorProject, data: Manifest): Promise<ManifestKeyedStorage> {
    const key = v4();

    await localStorage.setItem(`${this.namespace}/store/${key}`, JSON.stringify(data));

    return {
      type: "manifest-keyed-storage",
      data: {
        id: data.id,
        key,
      },
    };
  }

  async getStorage(storage: ManifestKeyedStorage): Promise<ManifestStorage | null> {
    try {
      const item = await localStorage.getItem(`${this.namespace}/store/${storage.data.key}`);
      const manifest = item ? (JSON.parse(item) as Manifest) : null;

      invariant(manifest, "Manifest not found");

      return {
        type: "manifest-storage",
        data: manifest,
      };
    } catch (e) {
      return null;
    }
  }

  async saveStorageData(manifestStorage: ManifestStorage, storage: ManifestKeyedStorage): Promise<void> {
    await localStorage.setItem(`${this.namespace}/store/${storage.data.key}`, JSON.stringify(manifestStorage.data));
  }

  async deleteStorage(storage: ManifestKeyedStorage): Promise<void> {
    this.vaults[storage.data.key] = null;
    await localStorage.removeItem(`${this.namespace}/store/${storage.data.key}`);
  }

  getBackendStorage(project: EditorProject): ManifestKeyedStorage {
    // This will never change after creation, but other adapters might?
    return project.storage as ManifestKeyedStorage;
  }
}
