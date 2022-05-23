import { Source } from "./types/Source";
import { Storage } from "./types/Storage";
import { Publication } from "./types/Publication";
import { Reference } from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";
import { Preview } from "./types/Preview";

export type ProjectContext = ProjectState & {
  actions: ProjectActions;
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

  createPreview(publication: Preview): void;
  updatePreview(publication: Preview): void;
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
  resource: { id: string; type: "Manifest" }; // @todo at the moment, only Manifest
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
  getAllProjects(): Promise<EditorProject[]>;
  getLastProject(): Promise<string | null>;
  setLastProject(id: string): Promise<void>;
  createProject(project: EditorProject): Promise<void>;
  updateProject(project: EditorProject): Promise<void>;
  deleteProject(id: string): Promise<void>;
}

export interface ProjectStorage<S extends Storage> {
  type: string;
  saveInterval: number;

  // Fetching
  getStorage(id: string): Promise<S | null>;
  updateStorage(id: string, storage: S): Promise<void>;
  deleteStorage(id: string): Promise<void>;

  // Runtime
  getLatestStorage(project: EditorProject): S;
  createVaultInstance(project: EditorProject): [Vault, Promise<void>];
  shouldUpdateWithVault(): boolean;
}
