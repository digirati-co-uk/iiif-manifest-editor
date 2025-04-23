import type { StructuralProperties } from "@iiif/presentation-3";

const required = {
  Collection: ["items"],
  Manifest: ["items"],
  Canvas: [],
  Annotation: ["target"],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const satisfies StructuralMap;

const recommended = {
  Collection: [],
  Manifest: [],
  Canvas: ["items"],
  Annotation: ["body"],
  AnnotationPage: ["items"],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const satisfies StructuralMap;

const optional = {
  Collection: ["annotations"],
  Manifest: ["structures", "annotations"],
  Canvas: ["annotations"],
  Annotation: [],
  AnnotationPage: [],
  Range: ["annotations"],
  AnnotationCollection: [],
  ContentResource: ["annotations"],
  Agent: [],
} as const satisfies StructuralMap;

const notAllowed = {
  Collection: ["structures", "target", "body"],
  Manifest: ["target", "body"],
  Canvas: ["structures", "target", "body"],
  Annotation: ["items", "structures", "annotations"],
  AnnotationPage: ["structures", "annotations", "target", "body"],
  Range: ["structures", "target", "body"],
  AnnotationCollection: [
    // Leaving this out, as it's technically valid - just not withing a Presentation 3 context.
    // "items",
    "structures",
    "annotations",
    "target",
    "body",
  ],
  ContentResource: ["items", "structures", "target", "body"],
  Agent: ["items", "structures", "annotations", "target", "body"],
} as const satisfies StructuralMap;

type StructuralMap = Record<
  | "Collection"
  | "Manifest"
  | "Canvas"
  | "Annotation"
  | "AnnotationPage"
  | "Range"
  | "AnnotationCollection"
  | "ContentResource"
  | "Agent",
  readonly (keyof StructuralProperties<unknown> | "body" | "target")[]
>;

const all = ["annotations", "items", "structures"] as const;

export const structuralProperties = {
  all,
  required,
  recommended,
  optional,
  notAllowed,
} as const;
