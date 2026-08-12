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
import { model3DEditor } from "./Model3DEditor";
import { cameraEditor, lightEditor } from "./SceneComponentEditor";
import { overviewSceneEditor } from "./OverviewSceneEditor";
import { activationStateEditor } from "./ActivationStateEditor";

export const allEditors = [
  // First tab ones.
  activationStateEditor,
  imageEditor,
  model3DEditor,
  cameraEditor,
  lightEditor,
  choicePaintingAnnotationEditor,
  mediaEditor,
  htmlBodyEditor,
  overviewCanvasEditor,
  overviewSceneEditor,
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
  activationStateEditor,
  imageEditor,
  model3DEditor,
  cameraEditor,
  lightEditor,
  choicePaintingAnnotationEditor,
  mediaEditor,
  htmlBodyEditor,
  overviewCanvasEditor,
  overviewSceneEditor,
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
