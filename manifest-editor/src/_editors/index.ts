import {
  canvasStructuralProperties,
  manifestStructuralProperties,
  rangeStructuralProperties,
} from "@/_editors/StructuralProperties";
import { imageEditor } from "@/_editors/ImageEditor";
import { mediaEditor } from "@/_editors/MediaEditor";
import { htmlBodyEditor } from "@/_editors/HTMLBodyEditor";
import { overviewCanvasEditor } from "@/_editors/OverviewCanvasEditor";
import { combinedProperties } from "@/_editors/CombinedEditor";
import { metadata } from "@/_editors/Metadata";
import { technicalProperties } from "@/_editors/TechnicalProperties";
import { linkingProperties } from "@/_editors/LinkingProperties";
import { inlineAnnotationPageEditor } from "@/_editors/InlineAnnotationPageEditor";
import { descriptiveProperties } from "@/_editors/DescriptiveProperties";
import { fallbackAnnotationEditor } from "./FallbackAnnotationEditor";
import { navPlaceEditor } from "@/_editors/NavPlaceEditor";

export const allEditors = [
  // First tab ones.
  imageEditor,
  mediaEditor,
  htmlBodyEditor,
  overviewCanvasEditor,
  rangeStructuralProperties,
  inlineAnnotationPageEditor,
  combinedProperties,
  fallbackAnnotationEditor,

  // Generic
  descriptiveProperties,
  metadata,
  technicalProperties,
  linkingProperties,
  manifestStructuralProperties,
  canvasStructuralProperties,
  navPlaceEditor,
];
