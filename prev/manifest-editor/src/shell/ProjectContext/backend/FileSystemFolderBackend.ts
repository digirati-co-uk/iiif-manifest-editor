import { EditorProject, ProjectBackend } from "../ProjectContext.types";
import { BaseDirectory, readDir, createDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import invariant from "tiny-invariant";
import { join, homeDir } from "@tauri-apps/api/path";

export interface FileSystemFolderBackendConfig {
  folderName: string;
  baseDirectory: BaseDirectory;
  lastItemKey: string;
}

export class FileSystemFolderBackend implements ProjectBackend {
  config: FileSystemFolderBackendConfig;
  projects: EditorProject[] | null = null;
  saveInterval = 5000;

  constructor(config: Partial<FileSystemFolderBackendConfig> = {}) {
    const baseDirectory = typeof config.baseDirectory !== "undefined" ? config.baseDirectory : BaseDirectory.Home;
    const folderName = config.folderName || "ManifestEditor";
    const lastItemKey = `file-system-storage/${baseDirectory}/${folderName}`;

    this.config = {
      baseDirectory,
      folderName,
      lastItemKey,
      ...config,
    };
  }

  async createProject(project: EditorProject): Promise<void> {
    if (!this.projects) {
      await this.getAllProjects(true);
      if (!this.projects) {
        // Last resort, this should never happen.
        this.projects = [];
      }
    }

    this.projects.push(project);

    const file = project.filename;
    if (file) {
      await createDir(await this.getDir(file), {
        dir: this.config.baseDirectory,
        recursive: true,
      });

      await writeTextFile(await this.getFile(file), JSON.stringify(project, null, 2), {
        dir: this.config.baseDirectory,
      });
    }
  }

  async getRootDir() {
    return await join(await homeDir(), this.config.folderName);
  }

  async getDir(file: string) {
    return await join(await this.getRootDir(), file);
  }

  async getFile(file: string) {
    return await join(await this.getRootDir(), file, "project.json");
  }

  async updateProject(project: EditorProject): Promise<void> {
    const file = project.filename;

    invariant(file);

    await writeTextFile(await this.getFile(file), JSON.stringify(project, null, 2), {
      dir: this.config.baseDirectory,
    });
  }

  canDelete() {
    return false;
  }

  async deleteProject(id: string): Promise<void> {
    // @todo maybe leave this?
  }

  async setLastProject(id: string): Promise<void> {
    await localStorage.setItem(this.config.lastItemKey, id);
  }

  async getLastProject(): Promise<string | null> {
    return localStorage.getItem(this.config.lastItemKey);
  }

  async getAllProjects(fresh?: boolean): Promise<EditorProject[]> {
    if (this.projects && !fresh) {
      return this.projects;
    }

    await createDir(await this.getRootDir(), {
      dir: this.config.baseDirectory,
      recursive: true,
    });

    const projects: EditorProject[] = [];
    const entries = await readDir(await this.getRootDir(), {
      dir: this.config.baseDirectory,
      recursive: true,
    });

    for (const entry of entries) {
      // For a project to be valid, we need to find: manifest-editor.json
      try {
        const projectJson = entry.children?.find((s) => s.name === "project.json");

        if (projectJson) {
          const contents = await readTextFile(projectJson.path, { dir: this.config.baseDirectory });
          const project = JSON.parse(contents) as EditorProject;

          invariant(
            project &&
              project.id &&
              project.resource &&
              project.resource.id &&
              project.resource.type &&
              project.storage,
            "Invalid project"
          );

          projects.push(project);
        }
      } catch (e) {
        // ignore if not, maybe show error in the future?
        console.log(e);
      }
    }

    this.projects = projects;

    return projects;
  }
}
