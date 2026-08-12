import { EmptyCanvasIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { getContentType, isHttpUrl, matchesExtension } from "../../resource-probes";
import { annotationPageIsInScene } from "../../Scene/annotation-page-is-in-scene";
import { createModelAnnotation, ModelAnnotationCreatorForm } from "./create-model-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/model-annotation": typeof modelAnnotation;
    }
  }
}

export const modelAnnotation = defineCreator({
  id: "@manifest-editor/model-annotation",
  create: createModelAnnotation,
  label: "3D model",
  summary: "GLB or glTF model",
  icon: <EmptyCanvasIcon />,
  render: (ctx) => <ModelAnnotationCreatorForm {...ctx} />,
  resourceType: "Annotation",
  additionalTypes: ["Canvas"],
  resourceFields: ["id", "type", "motivation", "body", "target"],
  async supportsResource(value, helpers) {
    if (!isHttpUrl(value)) return false;
    const contentType = await getContentType(value, helpers);
    if (contentType.startsWith("model/gltf") || matchesExtension(value, [".glb", ".gltf"])) {
      return { initialData: { url: value, format: contentType || undefined } };
    }
    return false;
  },
  supports: {
    initialData: true,
    onlyPainting: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
    custom: (parent, vault) => parent.resource.type === "Manifest" || annotationPageIsInScene(parent, vault),
  },
  staticFields: { type: "Annotation" },
});
