import type { TechnicalProperties } from "@iiif/presentation-3";

const required = {
  Collection: ["id", "type"],
  Manifest: ["id", "type"],
  Canvas: ["id", "type"],
  Annotation: ["id", "type"],
  AnnotationPage: ["id", "type"],
  Range: ["id", "type"],
  AnnotationCollection: ["id", "type"],
  ContentResource: ["id", "type"],
  Agent: ["id", "type"],
} as const satisfies TechnicalMap;

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
} as const satisfies TechnicalMap;

const optional = {
  Collection: ["viewingDirection", "behavior"],
  Manifest: ["viewingDirection", "behavior"],
  Canvas: ["height", "width", "duration", "behavior"],
  Annotation: ["behavior", "timeMode"],
  AnnotationPage: ["behavior"],
  Range: ["viewingDirection", "behavior"],
  AnnotationCollection: ["behavior"],
  ContentResource: ["format", "height", "width", "duration", "behavior"],
  Agent: [],
} as const satisfies TechnicalMap;

const annotationOnly = ["motivation"] as const;

const notAllowed = {
  Collection: ["format", "profile", "height", "width", "duration", "timeMode", ...annotationOnly],
  Manifest: ["format", "profile", "height", "width", "duration", "timeMode", ...annotationOnly],
  Canvas: ["format", "profile", "viewingDirection", "timeMode", ...annotationOnly],
  Annotation: ["format", "profile", "height", "width", "duration", "viewingDirection"],
  AnnotationPage: [
    "format",
    "profile",
    "height",
    "width",
    "duration",
    "viewingDirection",
    "timeMode",
    ...annotationOnly,
  ],
  Range: ["format", "profile", "height", "width", "duration", "timeMode", ...annotationOnly],
  AnnotationCollection: [
    "format",
    "profile",
    "height",
    "width",
    "duration",
    "viewingDirection",
    "timeMode",
    ...annotationOnly,
  ],
  ContentResource: ["viewingDirection", "timeMode", ...annotationOnly],
  Agent: [
    "viewingDirection",
    "format",
    "profile",
    "height",
    "width",
    "duration",
    "timeMode",
    "behavior",
    ...annotationOnly,
  ],
} as const satisfies TechnicalMap;

type TechnicalMap = Record<
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Annotation"
  | "AnnotationPage"
  | "Range"
  | "AnnotationCollection"
  | "ContentResource"
  | "Agent",
  readonly (keyof TechnicalProperties)[]
>;

const all = [
  "id",
  "type",
  "format",
  "profile",
  "height",
  "width",
  "duration",
  "viewingDirection",
  "behavior",
  "timeMode",
  "motivation",
] as const;

export const technicalProperties = {
  all,
  required,
  recommended,
  optional,
  notAllowed,
} as const;
