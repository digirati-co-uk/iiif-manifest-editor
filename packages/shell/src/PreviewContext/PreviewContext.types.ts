import { Vault } from "@iiif/helpers/vault";

export interface Preview {
  id: string;
  type: string;
  data: any;
}

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
  getPreviewLink(): Promise<string | null>;
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

  isPreviewValid(instanceId: string, instance: Preview): boolean | Promise<boolean>;

  createPreview(instanceId: string, resource: { id: string; type: string }, vault: Vault, ctx: any): Promise<Preview>;

  focus(instanceId: string): Promise<void>;

  updatePreview(
    instanceId: string,
    resource: { id: string; type: string },
    vault: Vault,
    ctx: any
  ): Promise<Preview | null>;

  deletePreview(id: string): Promise<void>;
}
