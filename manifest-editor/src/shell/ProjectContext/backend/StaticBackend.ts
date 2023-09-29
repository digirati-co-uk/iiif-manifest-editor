import { EditorProject, ProjectBackend } from "@/shell";

export class StaticStorageBackend implements ProjectBackend {
  project: Map<string, EditorProject> = new Map();
  saveInterval = 5000;
  projects: EditorProject[];
  constructor(projects: Array<EditorProject>) {
    this.projects = projects;
  }

  static create(ref: { id: string; type: string }, storage: any) {
    return new StaticStorageBackend([
      {
        id: "temporary",
        name: "Untitled project",
        storage: storage,
        metadata: { created: Date.now(), modified: Date.now() },
        resource: ref as any,
        settings: {},
        filename: `temp.json`,
        previews: [],
        publications: [],
      },
    ]);
  }
  canDelete(): boolean {
    return false;
  }

  canCreate(): boolean {
    return false;
  }
  async createProject(project: EditorProject): Promise<void> {
    throw new Error("Cannot create project");
  }

  async deleteProject(id: string): Promise<void> {
    throw new Error("Cannot delete project");
  }

  async getProject(id: string): Promise<EditorProject> {
    return this.project.get(id) as EditorProject;
  }

  async getProjects(): Promise<EditorProject[]> {
    return Array.from(this.project.values());
  }

  async updateProject(project: EditorProject): Promise<void> {
    //
  }
  async getLastProject(): Promise<string | null> {
    return this.projects[0]?.id || null;
  }

  async setLastProject(id: string): Promise<void> {
    //
  }

  async getAllProjects(fresh?: boolean): Promise<EditorProject[]> {
    return this.projects;
  }
}
