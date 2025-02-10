import type { Reference, SpecificResource } from "@iiif/presentation-3";
import { CreatableResource } from "@manifest-editor/creator-api";

export interface EditableResource {
  parent?: Reference;
  property?: string;
  index?: number;
  resource: SpecificResource;
  onlyReference?: boolean;
}

export interface EditingStackState {
  current: EditableResource | null;
  stack: Array<EditableResource>;
  create: { resource: CreatableResource; options: any } | null;
}

export interface EditingStackActions {
  edit(resource: EditableResource | null, reset?: boolean): void;
  updateCurrent(resource: Partial<EditableResource>): void;
  close(): void;
  back(): void;
  create(resource: CreatableResource, options?: any): () => void;
}

export type EditingStackActionCreators =
  | {
    type: "edit";
    payload: { resource: EditableResource | null; reset?: boolean };
  }
  | { type: "updateCurrent"; payload: { resource: EditableResource } }
  | { type: "syncRemoval"; payload: { resource: EditableResource } }
  | { type: "back" }
  | {
    type: "create";
    payload: { resource: CreatableResource | null; options?: any };
  }
  | { type: "close" };
