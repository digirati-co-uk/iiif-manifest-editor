import type { NavPlaceExtension, TextGranularityExtension } from "@iiif/presentation-3";

export type ExtensionProperties = TextGranularityExtension & NavPlaceExtension;

const required = {
  Collection: [],
  Manifest: [],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const satisfies ExtensionsMap;

const recommended = {
  Collection: [],
  Manifest: [],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const satisfies ExtensionsMap;

const optional = {
  Collection: ["navPlace"],
  Manifest: ["navPlace"],
  Canvas: ["navPlace"],
  Annotation: ["textGranularity"],
  AnnotationPage: [],
  Range: ["navPlace"],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const satisfies ExtensionsMap;

const notAllowed = {
  Collection: ["textGranularity"],
  Manifest: ["textGranularity"],
  Canvas: ["textGranularity"],
  Annotation: ["navPlace"],
  AnnotationPage: ["textGranularity", "navPlace"],
  Range: ["textGranularity"],
  AnnotationCollection: ["textGranularity", "navPlace"],
  ContentResource: ["textGranularity", "navPlace"],
  Agent: ["textGranularity", "navPlace"],
} as const satisfies ExtensionsMap;

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
