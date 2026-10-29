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
import type { resources, technicalProperties } from "@manifest-editor/editor-api";
import type { EditorI18n, MessageReference } from "@manifest-editor/i18n";
import type { ReactNode } from "react";
import type { CreatorInstance } from "./CreatorInstance";
import type { CreatorResource } from "./CreatorResource";
import type { ReferencedResource } from "./ReferencedResource";
import type { CreatorDefinitionFilterByParent, ExtractCreatorGenerics, IIIFManifestEditor } from "./creator-register";

export interface CreatorContext<T = any> {
  /** Optional editor-instance formatter for form feedback; never use for authored IIIF values.
   * Hosts supply this at render time. Do not persist or send it through a worker.
   */
  i18n?: Pick<EditorI18n, "resolveMessage">;
  vault: Vault;
  options: CreatorOptions;
  config?: Record<string, unknown>;
  validate: (payload: T) => Promise<boolean> | boolean;
  runCreate: (payload: T) => void;
}

export type ResolvedCreatorReturn<T extends CreatorDefinition> =
  Awaited<ExtractCreatorGenerics<T>["CreateReturnType"]> extends any[] ? CreatorResource[] : CreatorResource;

export interface CreatorFunctionContext {
  vault: Vault;
  options: CreatorOptions;
  config: Record<string, unknown>;
  ref(idOrRef: string | Reference): ReferencedResource;
  embed(data: any): CreatorResource;

  create(
    definition: string,
    payload: any,
    options?: Partial<CreatorOptions>
  ): Promise<CreatorResource | CreatorResource[]>;
  create<Definition extends CreatorDefinition = any>(
    definition: Definition["id"],
    payload: GetCreatorPayload<Definition>,
    options?: Partial<CreatorOptions>
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
/** A fitting hint, independent of an annotation's exact selector. */
export interface PlaceholderPosition {
  canvasId: string;
  bounds: import("@manifest-editor/editor-api").Rectangle;
  placeholderId?: string;
}

export interface CreatorOptions {
  placeholderPosition?: PlaceholderPosition;
  targetType: string;
  target?: Reference;
  parent?: CreatorParent;
  initialData?: any;
  rootId?: string;
}

export type CreatorConfig = Record<string, Record<string, unknown>>;

/** Deferred UI text only. Plain references are safe in module-level definitions.
 * Resolve at display time with the corresponding legacy string as fallback.
 * Help and placeholders are optional metadata for custom forms, not payload defaults.
 */
export interface CreatorDisplayMessages {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
  helpMessage?: MessageReference;
  placeholderMessage?: MessageReference;
}

/** Serialisable feedback, separate from Error instances and IIIF resource data. */
export interface CreatorValidationMessage {
  /** Stable machine-readable code; never translated. */
  readonly code?: string;
  /** Optional payload/config field ID; never translated. */
  readonly field?: string;
  readonly message: MessageReference;
}

/** Input to the opt-in error mapper; this context itself is not worker transport. */
export interface CreatorValidationContext<Payload = any> {
  readonly payload: Payload;
  readonly vault: Vault;
}

export type CreatorConfigField = CreatorDisplayMessages & {
  id: string;
  type: "checkbox";
  label: string;
  summary?: string;
  defaultValue?: boolean;
};

export interface CreatorConfiguration {
  fields: CreatorConfigField[];
}

export interface CreatorResourceProbeHelpers {
  json(url: string): Promise<any>;
  text(url: string): Promise<string>;
  head(url: string): Promise<Response>;
  contentType(url: string): Promise<string>;
}

export type CreatorResourceProbeResult =
  | boolean
  | {
      initialData?: Record<string, any>;
      label?: string;
    };

export type AllAvailableParentTypes = keyof typeof resources.supported;

type ManifestFields = typeof resources.supported.Manifest.all;

export type GetSupportedResourceFields<Resource extends AllAvailableParentTypes> =
  {} & (typeof resources.supported)[Resource]["allowed"][number];

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
> extends CreatorDisplayMessages {
  // The creation itself
  readonly id: ID;
  label: string;
  summary?: string;
  /** Hide the form help icon when the creator supplies its own browsing interface. */
  hideSummary?: boolean;
  icon?: any;
  dependencies?: string[];
  tags?: string[];
  configuration?: CreatorConfiguration;
  readonly configKey?: string;

  create: (payload: Payload, ctx: CreatorInstance) => CreateReturnType;
  validate?: (payload: Payload, vault: Vault) => void | Promise<void>;
  /** Map a known validation/creation failure for display without replacing the error.
   * Consumers opt in at their existing catch boundary; undefined uses their normal
   * fallback. The creator runtime does not call this or change validation semantics.
   */
  validationErrorMessage?: (
    error: unknown,
    context: CreatorValidationContext<Payload>
  ) => CreatorValidationMessage | undefined;
  supportsResource?: (
    value: string,
    helpers: CreatorResourceProbeHelpers,
    ctx: { vault: Vault; resource: CreatableResource }
  ) => CreatorResourceProbeResult | Promise<CreatorResourceProbeResult>;

  render?: (ctx: CreatorContext<Payload>) => ReactNode;
  renderCanvas?: (ctx: CreatorContext<Payload>) => ReactNode | null;
  renderModal?: (ctx: CreatorContext<Payload>) => ReactNode;

  // What is being created.
  resourceType: ResourceType;
  additionalTypes?: AdditionalResourceTypes;
  actionButton?: string;
  actionButtonMessage?: MessageReference;
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
export type CreatorDefinition<Payload = any> = SpecificCreatorDefinition<Payload, any, any, any, any, any, any>;

export interface CreatorSideEffect {
  run?: (result: any, ctx: { options: CreatorOptions; vault: Vault }) => void | Promise<void>;
  temporal?: boolean;
  spatial?: boolean;
  replaceSiblings?: boolean;
  canvasInteraction?: boolean;
  // @todo maybe other side-effects?
}

export interface CreatableResource {
  placeholderPosition?: PlaceholderPosition;
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
