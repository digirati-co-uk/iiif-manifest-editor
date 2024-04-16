import {
  canvasStructuralProperties,
  manifestStructuralProperties,
  rangeStructuralProperties,
} from "./StructuralProperties";
import { imageEditor } from "./ImageEditor";
import { mediaEditor } from "./MediaEditor";
import { htmlBodyEditor } from "./HTMLBodyEditor";
import { overviewCanvasEditor } from "./OverviewCanvasEditor";
import { combinedProperties } from "./CombinedEditor";
import { metadata } from "./Metadata";
import { technicalProperties } from "./TechnicalProperties";
import { linkingProperties } from "./LinkingProperties";
import { inlineAnnotationPageEditor } from "./InlineAnnotationPageEditor";
import { descriptiveProperties } from "./DescriptiveProperties";
import { fallbackAnnotationEditor } from "./FallbackAnnotationEditor";
import { navPlaceEditor } from "./NavPlaceEditor";

export const allEditors = [
  // First tab ones.
  imageEditor,
  mediaEditor,
  htmlBodyEditor,
  overviewCanvasEditor,
  rangeStructuralProperties,
  inlineAnnotationPageEditor,
  combinedProperties,
  // This isn't working for annotations without bodies.
  // fallbackAnnotationEditor,

  // Generic
  descriptiveProperties,
  metadata,
  technicalProperties,
  linkingProperties,
  manifestStructuralProperties,
  canvasStructuralProperties,
  navPlaceEditor,
];

export {
  imageEditor,
  mediaEditor,
  htmlBodyEditor,
  overviewCanvasEditor,
  rangeStructuralProperties,
  inlineAnnotationPageEditor,
  combinedProperties,
  descriptiveProperties,
  metadata,
  technicalProperties,
  linkingProperties,
  manifestStructuralProperties,
  canvasStructuralProperties,
  navPlaceEditor,
  fallbackAnnotationEditor,
};
