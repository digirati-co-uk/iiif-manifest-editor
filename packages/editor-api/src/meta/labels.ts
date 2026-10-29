import type { DisplayLabel } from "./display";
import type { AllResourceTypes } from "./resources";

/** UI labels only; keys are unchanged IIIF property identifiers. */
export const propertyLabels = {
  label: { label: "Label", labelMessage: { namespace: "editor-api", key: "fields.label" } },
  metadata: { label: "Metadata", labelMessage: { namespace: "editor-api", key: "fields.metadata" } },
  summary: { label: "Summary", labelMessage: { namespace: "editor-api", key: "fields.summary" } },
  requiredStatement: {
    label: "Required statement",
    labelMessage: { namespace: "editor-api", key: "fields.requiredStatement" },
  },
  rights: { label: "Rights", labelMessage: { namespace: "editor-api", key: "fields.rights" } },
  provider: { label: "Provider", labelMessage: { namespace: "editor-api", key: "fields.provider" } },
  thumbnail: { label: "Thumbnail", labelMessage: { namespace: "editor-api", key: "fields.thumbnail" } },
  navDate: { label: "Navigation date", labelMessage: { namespace: "editor-api", key: "fields.navDate" } },
  placeholderCanvas: {
    label: "Placeholder canvas",
    labelMessage: { namespace: "editor-api", key: "fields.placeholderCanvas" },
  },
  accompanyingCanvas: {
    label: "Accompanying canvas",
    labelMessage: { namespace: "editor-api", key: "fields.accompanyingCanvas" },
  },
  language: { label: "Language", labelMessage: { namespace: "editor-api", key: "fields.language" } },
  id: { label: "Identifier", labelMessage: { namespace: "editor-api", key: "fields.id" } },
  type: { label: "Type", labelMessage: { namespace: "editor-api", key: "fields.type" } },
  format: { label: "Format", labelMessage: { namespace: "editor-api", key: "fields.format" } },
  profile: { label: "Profile", labelMessage: { namespace: "editor-api", key: "fields.profile" } },
  height: { label: "Height", labelMessage: { namespace: "editor-api", key: "fields.height" } },
  width: { label: "Width", labelMessage: { namespace: "editor-api", key: "fields.width" } },
  duration: { label: "Duration", labelMessage: { namespace: "editor-api", key: "fields.duration" } },
  viewingDirection: {
    label: "Viewing direction",
    labelMessage: { namespace: "editor-api", key: "fields.viewingDirection" },
  },
  behavior: { label: "Behavior", labelMessage: { namespace: "editor-api", key: "fields.behavior" } },
  timeMode: { label: "Time mode", labelMessage: { namespace: "editor-api", key: "fields.timeMode" } },
  motivation: { label: "Motivation", labelMessage: { namespace: "editor-api", key: "fields.motivation" } },
  homepage: { label: "Homepage", labelMessage: { namespace: "editor-api", key: "fields.homepage" } },
  logo: { label: "Logo", labelMessage: { namespace: "editor-api", key: "fields.logo" } },
  rendering: {
    label: "Alternative representation",
    labelMessage: { namespace: "editor-api", key: "fields.rendering" },
  },
  service: { label: "Service", labelMessage: { namespace: "editor-api", key: "fields.service" } },
  services: { label: "Services", labelMessage: { namespace: "editor-api", key: "fields.services" } },
  seeAlso: { label: "Related description", labelMessage: { namespace: "editor-api", key: "fields.seeAlso" } },
  partOf: { label: "Part of", labelMessage: { namespace: "editor-api", key: "fields.partOf" } },
  start: { label: "Starting canvas", labelMessage: { namespace: "editor-api", key: "fields.start" } },
  supplementary: {
    label: "Supplementary content",
    labelMessage: { namespace: "editor-api", key: "fields.supplementary" },
  },
  items: { label: "Items", labelMessage: { namespace: "editor-api", key: "fields.items" } },
  structures: { label: "Structures", labelMessage: { namespace: "editor-api", key: "fields.structures" } },
  annotations: { label: "Annotations", labelMessage: { namespace: "editor-api", key: "fields.annotations" } },
  target: { label: "Target", labelMessage: { namespace: "editor-api", key: "fields.target" } },
  body: { label: "Body", labelMessage: { namespace: "editor-api", key: "fields.body" } },
  navPlace: { label: "Navigation location", labelMessage: { namespace: "editor-api", key: "fields.navPlace" } },
  textGranularity: {
    label: "Text granularity",
    labelMessage: { namespace: "editor-api", key: "fields.textGranularity" },
  },
  value: { label: "Value", labelMessage: { namespace: "editor-api", key: "fields.value" } },
} satisfies Record<string, DisplayLabel>;

export type DisplayProperty = keyof typeof propertyLabels;

/** System type names, never labels belonging to an authored resource. */
export const resourceLabels = {
  Collection: { label: "Collection", labelMessage: { namespace: "editor-api", key: "resources.collection" } },
  Manifest: { label: "Manifest", labelMessage: { namespace: "editor-api", key: "resources.manifest" } },
  Canvas: { label: "Canvas", labelMessage: { namespace: "editor-api", key: "resources.canvas" } },
  Annotation: { label: "Annotation", labelMessage: { namespace: "editor-api", key: "resources.annotation" } },
  AnnotationPage: {
    label: "Annotation page",
    labelMessage: { namespace: "editor-api", key: "resources.annotationPage" },
  },
  Range: { label: "Range", labelMessage: { namespace: "editor-api", key: "resources.range" } },
  AnnotationCollection: {
    label: "Annotation collection",
    labelMessage: { namespace: "editor-api", key: "resources.annotationCollection" },
  },
  ContentResource: {
    label: "Content resource",
    labelMessage: { namespace: "editor-api", key: "resources.contentResource" },
  },
  Agent: { label: "Agent", labelMessage: { namespace: "editor-api", key: "resources.agent" } },
} satisfies Record<AllResourceTypes, DisplayLabel>;
