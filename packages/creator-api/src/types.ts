import type { Vault } from "@iiif/helpers/vault";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { ReactNode } from "react";
import type { CreatorInstance } from "./CreatorInstance";
import type { CreatorResource } from "./CreatorResource";
import type { ReferencedResource } from "./ReferencedResource";

export interface CreatorContext<T = any> {
  vault: Vault;
  options: CreatorOptions;
  validate: (payload: T) => Promise<boolean> | boolean;
  runCreate: (payload: T) => void;
}

export interface CreatorFunctionContext {
  options: CreatorOptions;
  ref(idOrRef: string | Reference): ReferencedResource;
  embed(data: any): CreatorResource;
  create(
    definition: string,
    payload: any,
    options?: Partial<CreatorOptions>,
  ): Promise<CreatorResource>;
  generateId(type: string, parent?: Reference | ReferencedResource): string;
  getParent(): Reference | undefined;
  getTarget(): SpecificResource | Reference | undefined;
  getParentResource(): SpecificResource | undefined;
  getPreviewVault(): Vault;
}

interface CreatorParent {
  resource: Reference;
  property: string;
  atIndex?: number;
}
export interface CreatorOptions {
  targetType: string;
  target?: Reference;
  parent?: CreatorParent;
  initialData?: any;
}

export interface CreatorDefinition {
  // The creation itself
  id: string;
  label: string;
  summary?: string;
  icon?: any;
  dependencies?: string[];
  tags?: string[];

  create: (payload: any, ctx: CreatorInstance) => any | Promise<any>;
  validate?: (payload: any, vault: Vault) => void | Promise<void>;

  render?: (ctx: CreatorContext) => ReactNode;
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
  hiddenModal?: boolean;

  // Where is it valid?
  supports: {
    initialData?: boolean;
    parentTypes?: string[];
    parentFields?: string[];
    parentFieldMap?: Record<string, string[]>;
    custom?: (parent: CreatorParent, vault: Vault) => boolean;
    // Edge-case for painting annotations.
    disallowPainting?: boolean;
  };

  sideEffects?: Array<CreatorSideEffect>;
}

export interface CreatorSideEffect {
  run?: (
    result: any,
    ctx: { options: CreatorOptions; vault: Vault },
  ) => void | Promise<void>;
  temporal?: boolean;
  spatial?: boolean;
  replaceSiblings?: boolean;
  canvasInteraction?: boolean;
  // @todo maybe other side-effects?
}

export interface CreatableResource {
  type: string;
  parent?: Reference;
  property?: string;
  index?: number;
  onlyReference?: boolean;
  target?: Reference;
  initialData?: any;
  isPainting?: boolean;
  filter?: string;
  initialCreator?: string;
}
