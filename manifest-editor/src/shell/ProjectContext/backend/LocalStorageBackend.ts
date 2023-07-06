import { EditorProject, ProjectBackend } from "../ProjectContext.types";
import * as localforage from "localforage";

export class LocalStorageBackend implements ProjectBackend {
  namespace: string;
  saveInterval: number;
  storage: LocalForage;
  constructor(settings?: { namespace?: string }) {
    this.namespace = settings?.namespace || "default-v1.1";
    this.saveInterval = 5000;
    this.storage = localforage.createInstance({
      name: "manifest-editor-projects",
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.storage.removeItem(`${this.namespace}/projects/${id}`);
  }

  async createProject(project: EditorProject): Promise<void> {
    const index = await this.getProjectIndex();

    await this.storage.setItem(`${this.namespace}/projects/${project.id}`, JSON.stringify(project));

    if (index.indexOf(project.id) === -1) {
      index.push(project.id);
      await this.saveProjectIndex(index);
    }
  }

  canDelete() {
    return true;
  }

  async getAllProjects(): Promise<EditorProject[]> {
    try {
      const index = await this.getProjectIndex();
      const projects = [];
      for (const item of index) {
        if (item === "_index") {
          continue;
        }
        const loaded = await this.storage.getItem<any>(`${this.namespace}/projects/${item}`);
        if (loaded) {
          try {
            projects.push(JSON.parse(loaded));
          } catch (e) {
            // Silent on individual items?
          }
        }
      }

      return projects;
    } catch (e) {
      console.error("Error loading from localstorage", e);
      return [];
    }
  }

  async getLastProject(): Promise<string | null> {
    return this.storage.getItem(`${this.namespace}/last`);
  }

  async setLastProject(id: string): Promise<void> {
    await this.storage.setItem(`${this.namespace}/last`, id);
  }

  async updateProject(project: EditorProject): Promise<void> {
    await this.storage.setItem(`${this.namespace}/projects/${project.id}`, JSON.stringify(project));
  }

  private async saveProjectIndex(index: string[]): Promise<void> {
    await this.storage.setItem(`${this.namespace}/_index`, JSON.stringify(index));
  }

  private async getProjectIndex(): Promise<string[]> {
    const json = await this.storage.getItem<string>(`${this.namespace}/_index`);
    if (!json) {
      return [];
    }
    const index = JSON.parse(json);

    if (!Array.isArray(index)) {
      return [];
    }

    return index;
  }
}
