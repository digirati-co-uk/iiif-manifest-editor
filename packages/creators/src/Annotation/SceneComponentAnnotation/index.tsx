import { EmptyCanvasIcon } from "@manifest-editor/components";
import { type CreatorContext, defineCreator } from "@manifest-editor/creator-api";
import { annotationPageIsInScene } from "../../Scene/annotation-page-is-in-scene";
import {
  createSceneComponentAnnotation,
  type CreateSceneComponentPayload,
  SceneComponentCreatorForm,
} from "./create-scene-component-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/camera-annotation": typeof cameraAnnotation;
      "@manifest-editor/light-annotation": typeof lightAnnotation;
    }
  }
}

const common = {
  create: createSceneComponentAnnotation,
  icon: <EmptyCanvasIcon />,
  resourceType: "Annotation" as const,
  resourceFields: ["id", "type", "motivation", "body", "target"],
  supports: {
    onlyPainting: true,
    parentTypes: ["AnnotationPage"] as const,
    parentFields: ["items"] as const,
    custom: annotationPageIsInScene,
  },
  staticFields: { type: "Annotation" },
};

export const cameraAnnotation = defineCreator({
  ...common,
  id: "@manifest-editor/camera-annotation",
  label: "Camera",
  summary: "Perspective or orthographic camera",
  render: (ctx: CreatorContext<CreateSceneComponentPayload>) => <SceneComponentCreatorForm {...ctx} kind="camera" />,
} as any);

export const lightAnnotation = defineCreator({
  ...common,
  id: "@manifest-editor/light-annotation",
  label: "Light",
  summary: "Ambient, directional, point, or spot light",
  render: (ctx: CreatorContext<CreateSceneComponentPayload>) => <SceneComponentCreatorForm {...ctx} kind="light" />,
} as any);
