import type { Vault } from "@iiif/helpers/vault";
import type { Creator, CreatorDefinition } from "@manifest-editor/creator-api";
import type { InternationalString } from "@iiif/presentation-3";

export type ToolMode = "manifest" | "exhibition";
export type ResourceType = string;

export interface ResourceRef {
  id: string;
  type: ResourceType;
}

export interface PropertyPatch {
  property: string;
  value: unknown;
}

export type MetadataPatch =
  | {
      type: "add";
      label: InternationalString;
      value: InternationalString;
      beforeIndex?: number;
    }
  | {
      type: "update";
      index: number;
      label: InternationalString;
      value: InternationalString;
    }
  | {
      type: "delete";
      index: number;
    }
  | {
      type: "reorder";
      startIndex: number;
      endIndex: number;
    };

export type SelectorInput =
  | {
      type: "whole_canvas";
    }
  | {
      type: "xywh";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "svg";
      value: string;
    };

export interface CreateResourceInput {
  parent: ResourceRef;
  property: string;
  targetType: string;
  payload?: Record<string, unknown>;
  creatorId?: string;
  filter?: string;
  index?: number;
  target?: ResourceRef;
  initialData?: Record<string, unknown>;
  isPainting?: boolean;
  onlyReference?: boolean;
}

export type ManifestEditorToolErrorCode =
  | "NOT_FOUND"
  | "NOT_ALLOWED"
  | "AMBIGUOUS_MATCH"
  | "UNSUPPORTED_CREATOR"
  | "INVALID_SELECTOR"
  | "INVALID_PARENT"
  | "INVALID_INPUT";

export interface ManifestEditorToolError {
  code: ManifestEditorToolErrorCode;
  message: string;
  details?: unknown;
}

export interface ManifestEditorToolSuccessResult<T = unknown> {
  ok: true;
  toolName: string;
  changedRefs: ResourceRef[];
  createdRefs: ResourceRef[];
  summary: string;
  warnings: string[];
  data?: T;
}

export interface ManifestEditorToolFailureResult {
  ok: false;
  toolName: string;
  changedRefs: ResourceRef[];
  createdRefs: ResourceRef[];
  summary: string;
  warnings: string[];
  error: ManifestEditorToolError;
}

export type ManifestEditorToolResult<T = unknown> =
  | ManifestEditorToolSuccessResult<T>
  | ManifestEditorToolFailureResult;

export type ManifestEditorToolJsonSchema = Record<string, unknown>;

export interface ManifestEditorToolDefinition<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  inputSchema: ManifestEditorToolJsonSchema;
  modes?: ToolMode[];
  execute: (
    runtime: ManifestEditorToolRuntime,
    input: Input,
  ) =>
    | ManifestEditorToolSuccessResult<Output>
    | Promise<ManifestEditorToolSuccessResult<Output>>;
}

export interface ManifestEditorToolChangeEvent {
  toolName: string;
  input: unknown;
  result: ManifestEditorToolSuccessResult;
}

export interface ManifestEditorToolRuntimeOptions {
  vault: Vault;
  rootResource: ResourceRef;
  creators: CreatorDefinition[];
  mode?: ToolMode;
  onChange?: (event: ManifestEditorToolChangeEvent) => void;
}

export interface ManifestEditorToolRuntime {
  vault: Vault;
  rootResource: ResourceRef;
  creators: CreatorDefinition[];
  mode: ToolMode;
  creator: Creator;
  previewVault: Vault;
  registry: ManifestEditorToolDefinition[];
  onChange?: (event: ManifestEditorToolChangeEvent) => void;
}

export interface ManifestEditorToolPublicDefinition {
  name: string;
  description: string;
  inputSchema: ManifestEditorToolJsonSchema;
}
