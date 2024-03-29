import { EditorProject } from "../ProjectContext/ProjectContext.types";
import { Vault } from "@iiif/helpers/vault";
import { Preview } from "../ProjectContext/types/Preview";

export type PreviewContext = PreviewState & {
  handlers: Array<PreviewHandler>;
  actions: PreviewActions;
  configs: Array<PreviewConfiguration>;
};

export interface PreviewState {
  selected: string | null;
  active: string[];
}

export interface PreviewActions {
  activatePreview(id: string): void;
  updatePreviews(): void;
  selectPreview(id: string): void;
  deletePreview(id: string): void;
  focusPreview(id: string): void;
}

export type PreviewActionsType = {
  [T in keyof PreviewActions]: {
    type: T;
    payload: Parameters<PreviewActions[T]>[0];
  };
}[keyof PreviewActions];

export interface PreviewConfiguration<Config = any> {
  id: string;
  type: string;
  label: string;
  config: Config;
}

export interface PreviewHandler {
  id: string;
  label: string;
  type: string;
  focusable: boolean;

  getRequires(): string[];

  getProvides(): string[];

  isPreviewValid(project: EditorProject): boolean;

  createPreview(project: EditorProject, vault: Vault, ctx: any): Promise<Preview>;

  focus(project: EditorProject): Promise<void>;

  updatePreview(project: EditorProject, vault: Vault, ctx: any): Promise<Preview | null>;

  deletePreview(id: string): Promise<void>;
}
