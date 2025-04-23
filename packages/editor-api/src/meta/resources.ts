import { descriptiveProperties } from "./descriptive";
import { extensionProperties } from "./extensions";
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
] as const;

export type AllResourceTypes = (typeof all)[number];

function getSupported<const Type extends AllResourceTypes>(type: Type) {
  const required = [
    ...(technicalProperties.required[type] || []),
    ...(descriptiveProperties.required[type] || []),
    ...(linkingProperties.required[type] || []),
    ...(structuralProperties.required[type] || []),
    ...(extensionProperties.required[type] || []),
  ];
  const recommended = [
    ...(technicalProperties.recommended[type] || []),
    ...(descriptiveProperties.recommended[type] || []),
    ...(linkingProperties.recommended[type] || []),
    ...(structuralProperties.recommended[type] || []),
    ...(extensionProperties.recommended[type] || []),
  ];
  const notAllowed = [
    ...(technicalProperties.notAllowed[type] || []),
    ...(descriptiveProperties.notAllowed[type] || []),
    ...(linkingProperties.notAllowed[type] || []),
    ...(structuralProperties.notAllowed[type] || []),
    ...(extensionProperties.notAllowed[type] || []),
  ];
  const optional = [
    ...(technicalProperties.optional[type] || []),
    ...(descriptiveProperties.optional[type] || []),
    ...(linkingProperties.optional[type] || []),
    ...(structuralProperties.optional[type] || []),
    ...(extensionProperties.optional[type] || []),
  ];

  const allowed = [...required, ...recommended, ...optional];

  const all = [...allowed, ...notAllowed];

  return { all, allowed, required, recommended, notAllowed, optional };
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
