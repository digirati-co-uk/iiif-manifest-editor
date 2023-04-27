import { EditorProject } from "../ProjectContext.types";
import { ResourceKeyedStorage, ManifestStorage, CollectionStorage } from "../types/Storage";
import { Manifest } from "@iiif/presentation-3";
import { homeDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, createDir, readTextFile, removeFile, writeTextFile } from "@tauri-apps/api/fs";
import { AbstractVaultLoader } from "./AbstractVaultLoader";
import invariant from "tiny-invariant";

export interface FileSystemLoaderConfig {
  resourceType: "Manifest" | "Collection";
  folderName: string;
  baseDirectory: BaseDirectory;
}

export class FileSystemLoader extends AbstractVaultLoader<ResourceKeyedStorage> {
  type = "file-system";
  config: FileSystemLoaderConfig;

  constructor(config: Partial<FileSystemLoaderConfig> = {}) {
    super({ saveInterval: 1000 });
    const baseDirectory = typeof config.baseDirectory !== "undefined" ? config.baseDirectory : BaseDirectory.Home;
    const folderName = config.folderName || "ManifestEditor";

    this.config = {
      resourceType: "Manifest",
      baseDirectory,
      folderName,
      ...config,
    };
  }

  shouldUpdateWithVault() {
    return true;
  }

  async create(project: EditorProject, data: Manifest): Promise<ResourceKeyedStorage> {
    const file = project.filename;
    if (file) {
      await createDir(await this.getDir(file), {
        dir: this.config.baseDirectory,
        recursive: true,
      });
      await writeTextFile(await this.getFile(file), JSON.stringify(data, null, 2), {
        dir: this.config.baseDirectory,
      });
    }

    return {
      type: "resource-keyed-storage",
      data: {
        id: data.id,
        type: data.type,
        key: file as string,
      },
    };
  }

  async getStorage(storage: ResourceKeyedStorage): Promise<CollectionStorage | ManifestStorage | null> {
    try {
      const item = await readTextFile(await this.getFile(storage.data.key), {
        dir: this.config.baseDirectory,
      });

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

  async saveStorageData(
    manifestStorage: CollectionStorage | ManifestStorage,
    storage: ResourceKeyedStorage
  ): Promise<void> {
    await writeTextFile(await this.getFile(storage.data.key), JSON.stringify(manifestStorage.data, null, 2), {
      dir: this.config.baseDirectory,
    });
  }

  async deleteStorage(storage: ResourceKeyedStorage): Promise<void> {
    this.vaults[storage.data.key] = null;
    await removeFile(await this.getFile(storage.data.key), {
      dir: this.config.baseDirectory,
    });
  }

  getBackendStorage(project: EditorProject): ResourceKeyedStorage {
    // This will never change after creation, but other adapters might?
    return project.storage as ResourceKeyedStorage;
  }

  async getRootDir() {
    return await join(await homeDir(), this.config.folderName);
  }

  async getDir(file: string) {
    return await join(await this.getRootDir(), file);
  }

  async getFile(file: string) {
    return await join(await this.getRootDir(), file, "manifest.json");
  }
}
