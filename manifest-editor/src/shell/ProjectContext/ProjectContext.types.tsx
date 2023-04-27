import { Storage } from "./types/Storage";
import { Publication } from "./types/Publication";
import { Vault } from "@iiif/vault";
import { Preview } from "./types/Preview";

export type ProjectContext = ProjectState & {
  actions: ProjectActions;
  canDelete: boolean;
};

export interface ProjectState {
  current: EditorProject | null;
  allProjects: EditorProject[];
  loadingStatus: null | ProjectsLoadingStatus;
}

export interface ProjectsLoadingStatus {
  loading: boolean;
  loaded: boolean;
  lastLoaded: number;
}

export interface ProjectActions {
  // Navigation, probably hooked up to URL provider.
  createProject(project: EditorProject): void;
  deleteProject(id: string): void;
  switchProject(id: string): void;
  deselectProject(id: string): void;
  forkProject(details: { id: string; name: string; filename?: string }): void;
  load(state: ProjectState): void;
  setLoadingStatus(status: ProjectsLoadingStatus): void;

  saveProject(project: EditorProject): Promise<void> | void;
  updateDetails(details: { name: string; filename?: string }): void;

  // Publishing
  createPublication(publication: Publication): void;
  updatePublication(publication: Publication): void;
  removePublication(id: string): void;

  setPreview(publication: Preview): void;
  removePreview(id: string): void;

  // Settings
  updateSettings(settings: EditorProject["settings"]): void;
  updateThumbnail(url: string): void;

  // Storage
  updateStorage(storage: Storage): void;
}

export type ProjectActionsType = {
  [T in keyof ProjectActions]: {
    type: T;
    payload: Parameters<ProjectActions[T]>[0];
  };
}[keyof ProjectActions];

export interface EditorProject {
  id: string;
  name: string;
  filename?: string;
  thumbnail?: string;
  resource: { id: string; type: "Manifest" } | { id: string; type: "Collection" }; // @todo at the moment, only Manifest
  storage: Storage;
  settings: Record<string, never>;
  publications: Publication[];
  previews: Preview[];
  metadata: {
    created: number;
    modified: number;
  };
}

export interface ProjectBackend {
  saveInterval: number;
  getAllProjects(fresh?: boolean): Promise<EditorProject[]>;
  getLastProject(): Promise<string | null>;
  setLastProject(id: string): Promise<void>;
  canDelete(): boolean;
  createProject(project: EditorProject): Promise<void>;
  updateProject(project: EditorProject): Promise<void>;
  deleteProject(id: string): Promise<void>;
}

export interface ProjectStorage<S extends Storage, DataType = any, Ref extends Storage = any> {
  type: string;
  saveInterval: number;

  // Fetching
  create(project: EditorProject, data: DataType): Promise<Ref | void>;
  getStorage(ref: Ref): Promise<S | null>;
  saveStorage(ref: Ref): Promise<void>;
  deleteStorage(ref: Ref): Promise<void>;

  // Runtime
  getBackendStorage(project: EditorProject): Ref;
  createVaultInstance(project: EditorProject): [Vault, Promise<void>];
  shouldUpdateWithVault(): boolean;
}
