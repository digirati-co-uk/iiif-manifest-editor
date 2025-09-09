import type { Vault } from "@iiif/helpers/vault";
import type {
  Annotation,
  DescriptiveProperties,
  LinkingProperties,
  NavPlaceExtension,
  Reference,
  SpecificResource,
  StructuralProperties,
  TechnicalProperties,
} from "@iiif/presentation-3";
import type {
  resources,
  technicalProperties,
} from "@manifest-editor/editor-api";
import type { ReactNode } from "react";
import type { CreatorInstance } from "./CreatorInstance";
import type { CreatorResource } from "./CreatorResource";
import type { ReferencedResource } from "./ReferencedResource";
import type {
  CreatorDefinitionFilterByParent,
  ExtractCreatorGenerics,
  IIIFManifestEditor,
} from "./creator-register";

export interface CreatorContext<T = any> {
  vault: Vault;
  options: CreatorOptions;
  validate: (payload: T) => Promise<boolean> | boolean;
  runCreate: (payload: T) => void;
}

export type ResolvedCreatorReturn<T extends CreatorDefinition> =
  Awaited<ExtractCreatorGenerics<T>["CreateReturnType"]> extends any[]
    ? CreatorResource[]
    : CreatorResource;

export interface CreatorFunctionContext {
  vault: Vault;
  options: CreatorOptions;
  ref(idOrRef: string | Reference): ReferencedResource;
  embed(data: any): CreatorResource;

  create(
    definition: string,
    payload: any,
    options?: Partial<CreatorOptions>,
  ): Promise<CreatorResource | CreatorResource[]>;
  create<Definition extends CreatorDefinition = any>(
    definition: Definition["id"],
    payload: GetCreatorPayload<Definition>,
    options?: Partial<CreatorOptions>,
  ): Promise<ResolvedCreatorReturn<Definition>>;

  generateId(type: string, parent?: Reference | ReferencedResource): string;
  getParent(): Reference | undefined;
  getTarget(): SpecificResource | Reference | undefined;
  getParentResource(): SpecificResource | undefined;
  getPreviewVault(): Vault;
}

export type GetCreatorPayload<T extends CreatorDefinition> =
  T extends CreatorDefinition<infer Payload> ? Payload : never;

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
  rootId?: string;
}

export type AllAvailableParentTypes = keyof typeof resources.supported;

type ManifestFields = typeof resources.supported.Manifest.all;

export type GetSupportedResourceFields<
  Resource extends AllAvailableParentTypes,
> = {} & (typeof resources.supported)[Resource]["allowed"][number];

export type AllProperties =
  | ({} & keyof LinkingProperties)
  | ({} & keyof StructuralProperties<any>)
  | ({} & keyof TechnicalProperties)
  | ({} & keyof DescriptiveProperties)
  | ({} & keyof Annotation)
  | ({} & keyof NavPlaceExtension);

export type AllParentTypes = [
  "Collection",
  "Manifest",
  "Canvas",
  "Annotation",
  "AnnotationPage",
  "Range",
  "AnnotationCollection",
  "ContentResource",
  "Agent",
];

export interface SpecificCreatorDefinition<
  //
  Payload = any,
  ID = Readonly<string>,
  ResourceType extends AllAvailableParentTypes = never,
  AdditionalResourceTypes extends Array<AllAvailableParentTypes> = [],
  AllResourceTypes = [ResourceType, ...AdditionalResourceTypes],
  SupportsParentTypes extends Array<AllAvailableParentTypes> = AllParentTypes,
  SupportsParentFields extends Array<AllProperties> = [],
  CreateReturnType = any | Promise<any> | any[] | Promise<any[]>,
> {
  // The creation itself
  readonly id: ID;
  label: string;
  summary?: string;
  icon?: any;
  dependencies?: string[];
  tags?: string[];

  create: (payload: Payload, ctx: CreatorInstance) => CreateReturnType;
  validate?: (payload: Payload, vault: Vault) => void | Promise<void>;

  render?: (ctx: CreatorContext<Payload>) => ReactNode;
  renderCanvas?: (ctx: CreatorContext<Payload>) => ReactNode | null;
  renderModal?: (ctx: CreatorContext<Payload>) => ReactNode;

  // What is being created.
  resourceType: ResourceType;
  additionalTypes?: AdditionalResourceTypes;
  actionButton?: string;
  resourceFields: string[];
  embeddedResources?: string[];
  // This is completely static values. (e.g. {type: 'Image'})
  staticFields?: Record<string, any>;
  allowModal?: boolean;
  hiddenModal?: boolean;

  // Where is it valid?
  supports: {
    initialData?: boolean;
    parentTypes?: SupportsParentTypes;
    parentFields?: SupportsParentFields;
    parentFieldMap?: Record<string, string[]>;
    custom?: (parent: CreatorParent, vault: Vault) => boolean;
    // Edge-case for painting annotations.
    disallowPainting?: boolean;
    onlyPainting?: boolean;
  };

  sideEffects?: Array<CreatorSideEffect>;
}

// Keep this for compatibility.
export type CreatorDefinition<Payload = any> = SpecificCreatorDefinition<
  Payload,
  any,
  any,
  any,
  any,
  any,
  any
>;

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
