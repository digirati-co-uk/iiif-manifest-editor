import { DescriptiveProperties } from "@iiif/presentation-3";

const required: DescriptiveMap = {
  Collection: ["label"],
  Manifest: ["label"],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: ["label"],
} as const;

const recommended: DescriptiveMap = {
  Collection: ["metadata", "summary", "provider", "thumbnail"],
  Manifest: ["metadata", "summary", "provider", "thumbnail"],
  Canvas: ["label"],
  Annotation: [],
  AnnotationPage: [],
  Range: ["label"],
  AnnotationCollection: ["label"],
  ContentResource: ["label"],
  Agent: [],
} as const;

const optional: DescriptiveMap = {
  Collection: ["requiredStatement", "rights", "navDate", "placeholderCanvas", "accompanyingCanvas"],
  Manifest: ["requiredStatement", "rights", "navDate", "placeholderCanvas", "accompanyingCanvas"],
  Canvas: [
    "metadata",
    "summary",
    "requiredStatement",
    "rights",
    "navDate",
    "provider",
    "thumbnail",
    "placeholderCanvas",
    "accompanyingCanvas",
  ],
  Annotation: ["label", "metadata", "summary", "requiredStatement", "rights", "provider", "thumbnail"],
  AnnotationPage: ["label", "metadata", "summary", "requiredStatement", "rights", "provider", "thumbnail"],
  Range: [
    "metadata",
    "summary",
    "requiredStatement",
    "rights",
    "navDate",
    "provider",
    "thumbnail",
    "placeholderCanvas",
    "accompanyingCanvas",
  ],
  AnnotationCollection: ["metadata", "summary", "requiredStatement", "rights", "provider", "thumbnail"],
  ContentResource: ["label", "metadata", "summary", "requiredStatement", "rights", "provider", "thumbnail"],
  Agent: [],
} as const;

const notAllowed: DescriptiveMap = {
  Collection: ["language"],
  Manifest: ["language"],
  Canvas: ["language"],
  Annotation: ["navDate", "language", "placeholderCanvas", "accompanyingCanvas"],
  AnnotationPage: ["navDate", "language", "placeholderCanvas", "accompanyingCanvas"],
  Range: ["language"],
  AnnotationCollection: ["navDate", "placeholderCanvas", "accompanyingCanvas"],
  ContentResource: ["navDate", "placeholderCanvas", "accompanyingCanvas"],
  Agent: [
    "provider",
    "language",
    "metadata",
    "summary",
    "thumbnail",
    "requiredStatement",
    "rights",
    "navDate",
    "placeholderCanvas",
    "accompanyingCanvas",
  ],
} as const;

type DescriptiveMap = Record<
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Annotation"
  | "AnnotationPage"
  | "Range"
  | "AnnotationCollection"
  | "ContentResource"
  | "Agent",
  readonly (keyof DescriptiveProperties)[]
>;

const all: readonly (keyof DescriptiveProperties)[] = [
  "label",
  "summary",
  "metadata",
  "requiredStatement",
  "rights",
  "navDate",
  "language",
  "thumbnail",
  "provider",
  "placeholderCanvas",
  "accompanyingCanvas",
];

export const descriptiveProperties = {
  all,
  required,
  recommended,
  optional,
  notAllowed,
} as const;
