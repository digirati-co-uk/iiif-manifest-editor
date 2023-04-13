import { LinkingProperties } from "@iiif/presentation-3";

const required: LinkingMap = {
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

const recommended: LinkingMap = {
  Collection: [],
  Manifest: [],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: ["homepage", "logo"],
} as const;

const optional: LinkingMap = {
  Collection: ["seeAlso", "service", "homepage", "rendering", "partOf", "services"],
  Manifest: ["seeAlso", "service", "homepage", "rendering", "partOf", "start", "services"],
  Canvas: ["seeAlso", "service", "homepage", "rendering", "partOf"],
  Annotation: ["seeAlso", "service", "homepage", "rendering", "partOf"],
  AnnotationPage: ["seeAlso", "service", "homepage", "rendering", "partOf"],
  Range: ["seeAlso", "service", "homepage", "rendering", "partOf", "start", "supplementary"],
  AnnotationCollection: ["seeAlso", "service", "homepage", "rendering", "partOf"],
  ContentResource: ["seeAlso", "service", "homepage", "rendering", "partOf"],
  Agent: ["seeAlso"],
} as const;

const notAllowed: LinkingMap = {
  Collection: ["supplementary"],
  Manifest: ["start", "supplementary"],
  Canvas: ["start", "supplementary", "services"],
  Annotation: ["start", "supplementary", "services"],
  AnnotationPage: ["start", "supplementary", "services"],
  Range: ["services"],
  AnnotationCollection: ["start", "supplementary", "services"],
  ContentResource: ["start", "supplementary", "services"],
  Agent: ["service", "homepage", "rendering", "partOf", "services"],
} as const;

type LinkingMap = Record<
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Annotation"
  | "AnnotationPage"
  | "Range"
  | "AnnotationCollection"
  | "ContentResource"
  | "Agent",
  readonly (keyof LinkingProperties)[]
>;

const all: readonly (keyof LinkingProperties)[] = [
  "seeAlso",
  "service",
  "services",
  "rendering",
  "partOf",
  "start",
  "supplementary",
  "homepage",
  "logo",
] as const;

export const linkingProperties = {
  all,
  required,
  recommended,
  optional,
  notAllowed,
} as const;
