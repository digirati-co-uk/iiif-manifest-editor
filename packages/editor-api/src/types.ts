import { Reference, SpecificResource } from "@iiif/parser";
import type { Vault4 } from "@iiif/helpers/vault-4";

export interface EditorConfig {
  vault: Vault4;
  reference: Reference;
  context: {
    resource: SpecificResource;
    parent?: Reference;
    parentProperty?: string;
    index?: number;
  };
  tracker: TrackerState;
  validators: Validator[];
}

export interface TrackerState {
  key: string;
  observed: string[];
  start(onChange: () => void): () => void;
  subscribe(cb: (entity: any) => void): () => void;
  track(key: string): void;
  reset(): void;
}

export interface Validator {
  types: string[];
  properties: string[];
  message: string;
  error?: boolean;
  warning?: boolean;
  valid: (resource: any, vault: Vault4, context: any) => boolean;
}

export interface PropertyValidationResponse {
  isError: boolean;
  isWarning: boolean;
  warnings: string[];
  errors: string[];
}

export interface EntityValidationResponse {
  isError: boolean;
  isWarning: boolean;
  problems: Array<{
    isError: boolean;
    isWarning: boolean;
    message: string;
    properties: string[];
  }>;
}
