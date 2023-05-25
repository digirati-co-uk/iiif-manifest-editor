import { NavPlaceExtension, TextGranularityExtension } from "@iiif/presentation-3";

export type ExtensionProperties = TextGranularityExtension & NavPlaceExtension;

const required: ExtensionsMap = {
  Collection: [],
  Manifest: [],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const;

const recommended: ExtensionsMap = {
  Collection: [],
  Manifest: [],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const;

const optional: ExtensionsMap = {
  Collection: ["navPlace"],
  Manifest: ["navPlace"],
  Canvas: ["navPlace"],
  Annotation: ["textGranularity"],
  AnnotationPage: [],
  Range: ["navPlace"],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const;

const notAllowed: ExtensionsMap = {
  Collection: ["textGranularity"],
  Manifest: ["textGranularity"],
  Canvas: ["textGranularity"],
  Annotation: ["textGranularity", "navPlace"],
  AnnotationPage: ["textGranularity", "navPlace"],
  Range: ["textGranularity"],
  AnnotationCollection: ["textGranularity", "navPlace"],
  ContentResource: ["textGranularity", "navPlace"],
  Agent: ["textGranularity", "navPlace"],
} as const;

type ExtensionsMap = Record<
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Annotation"
  | "AnnotationPage"
  | "Range"
  | "AnnotationCollection"
  | "ContentResource"
  | "Agent",
  readonly (keyof ExtensionProperties)[]
>;

const all: readonly (keyof ExtensionProperties)[] = ["navPlace", "textGranularity"];

export const extensionProperties = {
  all,
  required,
  recommended,
  optional,
  notAllowed,
} as const;
