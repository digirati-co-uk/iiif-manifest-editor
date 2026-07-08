import {
  canvasStructuralProperties,
  manifestStructuralProperties,
  rangeStructuralProperties,
} from "./StructuralProperties";
import { imageEditor } from "./ImageEditor";
import { mediaEditor } from "./MediaEditor";
import { choicePaintingAnnotationEditor } from "./ChoicePaintingAnnotationEditor";
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
import { partOfReferenceEditor } from "./PartOfReferenceEditor";

export const allEditors = [
  // First tab ones.
  imageEditor,
  choicePaintingAnnotationEditor,
  mediaEditor,
  htmlBodyEditor,
  overviewCanvasEditor,
  rangeStructuralProperties,
  inlineAnnotationPageEditor,
  partOfReferenceEditor,
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
  choicePaintingAnnotationEditor,
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
  partOfReferenceEditor,
  fallbackAnnotationEditor,
};
