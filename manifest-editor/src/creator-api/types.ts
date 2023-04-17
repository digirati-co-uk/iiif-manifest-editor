import { Vault } from "@iiif/vault";
import { ReactNode } from "react";
import { CreatorInstance } from "./CreatorInstance";
import { Reference } from "@iiif/presentation-3";
import { ReferencedResource } from "./ReferencedResource";
import { CreatorResource } from "./CreatorResource";

export interface CreatorContext {
  vault: Vault;
  options: CreatorOptions;
  validate: (payload: any) => Promise<boolean> | boolean;
  runCreate: (payload: any) => void;
}

export interface CreatorFunctionContext {
  ref(idOrRef: string | Reference): ReferencedResource;
  embed(data: any): CreatorResource;
  create(definition: string, payload: any, options?: Partial<CreatorOptions>): Promise<CreatorResource>;
}

interface CreatorParent {
  resource: Reference;
  property: string;
  atIndex?: number;
}
export interface CreatorOptions {
  targetType: string;
  parent?: CreatorParent;
}

export interface CreatorDefinition {
  // The creation itself
  id: string;
  label: string;
  summary?: string;
  icon?: any;

  create: (payload: any, ctx: CreatorInstance) => any | Promise<any>;
  validate?: (payload: any, vault: Vault) => void | Promise<void>;

  render: (ctx: CreatorContext) => ReactNode;
  renderCanvas?: (ctx: CreatorContext) => ReactNode | null;
  renderModal?: (ctx: CreatorContext) => ReactNode;

  // What is being created.
  resourceType: string;
  additionalTypes?: string[];
  resourceFields: string[];
  embeddedResources?: string[];
  // This is completely static values. (e.g. {type: 'Image'})
  staticFields?: Record<string, any>;
  allowModal?: boolean;

  // Where is it valid?
  supports: {
    parentTypes?: string[];
    parentFields?: string[];
    parentFieldMap?: Record<string, string[]>;
    custom?: (parent: CreatorParent, vault: Vault) => boolean;
  };

  sideEffects?: {
    run?: (result: any, ctx: any) => void | Promise<void>;
    temporal?: boolean;
    spatial?: boolean;
    replaceSiblings?: boolean;
    canvasInteraction?: boolean;
    // @todo maybe other side-effects?
  };
}
