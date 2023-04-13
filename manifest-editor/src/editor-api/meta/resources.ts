import { descriptiveProperties } from "./descriptive";
import { linkingProperties } from "./linking";
import { structuralProperties } from "./structural";
import { technicalProperties } from "./technical";

const all = [
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

function getSupported(type: string) {
  const required = [
    ...(technicalProperties.required[(type || "ContentResource") as "Manifest"] || []),
    ...(descriptiveProperties.required[(type || "ContentResource") as "Manifest"] || []),
    ...(linkingProperties.required[(type || "ContentResource") as "Manifest"] || []),
    ...(structuralProperties.required[(type || "ContentResource") as "Manifest"] || []),
  ];
  const recommended = [
    ...(technicalProperties.recommended[(type || "ContentResource") as "Manifest"] || []),
    ...(descriptiveProperties.recommended[(type || "ContentResource") as "Manifest"] || []),
    ...(linkingProperties.recommended[(type || "ContentResource") as "Manifest"] || []),
    ...(structuralProperties.recommended[(type || "ContentResource") as "Manifest"] || []),
  ];
  const notAllowed = [
    ...(technicalProperties.notAllowed[(type || "ContentResource") as "Manifest"] || []),
    ...(descriptiveProperties.notAllowed[(type || "ContentResource") as "Manifest"] || []),
    ...(linkingProperties.notAllowed[(type || "ContentResource") as "Manifest"] || []),
    ...(structuralProperties.notAllowed[(type || "ContentResource") as "Manifest"] || []),
  ];
  const optional = [
    ...(technicalProperties.optional[(type || "ContentResource") as "Manifest"] || []),
    ...(descriptiveProperties.optional[(type || "ContentResource") as "Manifest"] || []),
    ...(linkingProperties.optional[(type || "ContentResource") as "Manifest"] || []),
    ...(structuralProperties.optional[(type || "ContentResource") as "Manifest"] || []),
  ];

  const allowed = [...required, ...recommended, ...optional];

  return { allowed, required, recommended, notAllowed, optional };
}

const Collection = getSupported("Collection");
const Manifest = getSupported("Manifest");
const Canvas = getSupported("Canvas");
const Annotation = getSupported("Annotation");
const AnnotationPage = getSupported("AnnotationPage");
const Range = getSupported("Range");
const AnnotationCollection = getSupported("AnnotationCollection");
const ContentResource = getSupported("ContentResource");
const Agent = getSupported("Agent");

export const resources = {
  all,
  getSupported,
  supported: {
    Collection,
    Manifest,
    Canvas,
    Annotation,
    AnnotationPage,
    Range,
    AnnotationCollection,
    ContentResource,
    Agent,
  },
};
