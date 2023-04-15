import { Vault } from "@iiif/vault";
import { ReactNode } from "react";

export interface CreatorContext {
  vault: Vault;
  targetType: string;
  validate: (payload: any) => Promise<boolean> | boolean;
  runCreate: (payload: any) => void;
}

export interface CreatorDefinition {
  // The creation itself
  id: string;
  label: string;
  summary?: string;
  icon?: string;

  create: (payload: any, targetType: string, vault: Vault) => void | Promise<void>;
  validate?: (payload: any, vault: Vault) => void | Promise<void>;

  render: (ctx: CreatorContext) => ReactNode;
  renderCanvas?: (ctx: CreatorContext) => ReactNode | null;
  renderModal?: (ctx: CreatorContext) => ReactNode;

  // What is being created.
  resourceType: string;
  additionalTypes?: string[];
  resourceFields: string[];
  embeddedResources?: string[];
  staticFields?: any[]; // Can't remember what this was for..
  allowModal?: boolean;

  // Where is it valid?
  supports: {
    parentTypes: string;
    parentFields: string[];
    parentFieldMap?: Record<string, string[]>;
    custom: (parent: any, vault: Vault) => boolean;
  };

  sideEffects?: {
    run?: () => void | Promise<void>;
    temporal?: boolean;
    spatial?: boolean;
    replaceSiblings?: boolean;
    canvasInteraction?: boolean;
    // @todo maybe other side-effects?
  };
}
