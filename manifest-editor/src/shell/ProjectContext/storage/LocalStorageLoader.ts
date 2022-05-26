import { EditorProject, ProjectStorage } from "../ProjectContext.types";
import { Vault } from "@iiif/vault";
import { Reference } from "@iiif/presentation-3";
import { ManifestStorage } from "../types/Storage";

export class LocalStorageLoader implements ProjectStorage<ManifestStorage> {
  type = "local-storage";
  namespace: string;

  vaults: Record<string, Vault> = {};
  saveInterval: number;

  constructor(settings?: { namespace?: string }) {
    this.namespace = settings?.namespace || "default";
    this.saveInterval = 5000;
  }

  shouldUpdateWithVault() {
    return true;
  }

  createVaultInstance(project: EditorProject): [Vault, Promise<void>] {
    const data = project.storage.data;

    if (this.vaults[project.id]) {
      return [this.vaults[project.id], Promise.resolve()];
    }

    const vault = new Vault();

    const promise = vault.loadManifest(project.resource.id, JSON.parse(JSON.stringify(data)));
    this.vaults[project.id] = vault;

    return [vault, promise as Promise<void>];
  }

  async getStorage(id: string): Promise<ManifestStorage | null> {
    try {
      const item = await localStorage.getItem(`${this.namespace}/store/${id}`);

      return item ? (JSON.parse(item) as ManifestStorage) : null;
    } catch (e) {
      return null;
    }
  }

  async updateStorage(id: string, storage: ManifestStorage): Promise<void> {
    await localStorage.setItem(`${this.namespace}/store/${id}`, JSON.stringify(storage));
  }

  async deleteStorage(id: string): Promise<void> {
    await localStorage.removeItem(`${this.namespace}/store/${id}`);
  }

  getLatestStorage(project: EditorProject): ManifestStorage {
    const vault = this.vaults[project.id];
    const manifestRef: Reference<"Manifest"> = {
      id: project.storage.data.id,
      type: "Manifest",
    };

    if (!vault) {
      return project.storage as ManifestStorage;
    }

    return {
      type: "manifest-storage",
      data: vault.toPresentation3(manifestRef),
    };
  }
}
