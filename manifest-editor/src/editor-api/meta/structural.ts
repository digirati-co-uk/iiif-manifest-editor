import { StructuralProperties } from "@iiif/presentation-3";

const required: StructuralMap = {
  Collection: ["items"],
  Manifest: ["items"],
  Canvas: [],
  Annotation: [],
  AnnotationPage: [],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const;

const recommended: StructuralMap = {
  Collection: [],
  Manifest: [],
  Canvas: ["items"],
  Annotation: [],
  AnnotationPage: ["items"],
  Range: [],
  AnnotationCollection: [],
  ContentResource: [],
  Agent: [],
} as const;

const optional: StructuralMap = {
  Collection: ["annotations"],
  Manifest: ["structures", "annotations"],
  Canvas: ["annotations"],
  Annotation: [],
  AnnotationPage: [],
  Range: ["annotations"],
  AnnotationCollection: [],
  ContentResource: ["annotations"],
  Agent: [],
} as const;

const notAllowed: StructuralMap = {
  Collection: ["structures"],
  Manifest: [],
  Canvas: ["structures"],
  Annotation: ["items", "structures", "annotations"],
  AnnotationPage: ["structures", "annotations"],
  Range: ["structures"],
  AnnotationCollection: [
    // Leaving this out, as it's technically valid - just not withing a Presentation 3 context.
    // "items",
    "structures",
    "annotations",
  ],
  ContentResource: ["items", "structures"],
  Agent: ["items", "structures", "annotations"],
} as const;

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
  readonly (keyof StructuralProperties<unknown>)[]
>;

const all: readonly (keyof StructuralProperties<unknown>)[] = ["annotations", "items", "structures"] as const;

export const structuralProperties = {
  all,
  required,
  recommended,
  optional,
  notAllowed,
} as const;
