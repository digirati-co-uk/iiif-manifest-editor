import { EditorProject, ProjectBackend } from "../ProjectContext.types";

export class LocalStorageBackend implements ProjectBackend {
  namespace: string;
  saveInterval: number;

  constructor(settings?: { namespace?: string }) {
    this.namespace = settings?.namespace || "default";
    this.saveInterval = 5000;
  }

  async deleteProject(id: string): Promise<void> {
    await localStorage.removeItem(`${this.namespace}/projects/${id}`);
  }

  async createProject(project: EditorProject): Promise<void> {
    const index = await this.getProjectIndex();

    await localStorage.setItem(`${this.namespace}/projects/${project.id}`, JSON.stringify(project));

    if (index.indexOf(project.id) === -1) {
      index.push(project.id);
      await this.saveProjectIndex(index);
    }
  }

  async getAllProjects(): Promise<EditorProject[]> {
    try {
      const index = await this.getProjectIndex();
      const projects = [];
      for (const item of index) {
        if (item === "_index") {
          continue;
        }
        const loaded = await localStorage.getItem(`${this.namespace}/projects/${item}`);
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
    return localStorage.getItem(`${this.namespace}/last`);
  }

  async setLastProject(id: string): Promise<void> {
    localStorage.setItem(`${this.namespace}/last`, id);
  }

  async updateProject(project: EditorProject): Promise<void> {
    await localStorage.setItem(`${this.namespace}/projects/${project.id}`, JSON.stringify(project));
  }

  private async saveProjectIndex(index: string[]): Promise<void> {
    await localStorage.setItem(`${this.namespace}/_index`, JSON.stringify(index));
  }

  private async getProjectIndex(): Promise<string[]> {
    const json = await localStorage.getItem(`${this.namespace}/_index`);
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
