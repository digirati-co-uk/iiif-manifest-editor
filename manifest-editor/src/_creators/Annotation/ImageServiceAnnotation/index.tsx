import { CreatorDefinition } from "@/creator-api";
import { TextFormatIcon } from "@/icons/TextFormatIcon";
import { CreateImageServiceAnnotationForm, createImageSericeAnnotation } from "./create-service-annotation";
import { resizeResourceToEmptyCanvas } from "@/_creators/side-effects/resize-resource-to-empty-canvas";

// @todo combine this with the content resource one.
export const imageServiceAnnotation: CreatorDefinition = {
  id: "@manifest-editor/image-service-annotation",
  create: createImageSericeAnnotation,
  label: "Image Service",
  dependencies: ["@manifest-editor/image-service-creator"],
  summary: "Add an annotation from Image Service",
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreateImageServiceAnnotationForm {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  supports: {
    parentTypes: ["AnnotationPage"],
    parentFields: ["items"],
  },
  sideEffects: [resizeResourceToEmptyCanvas],
  staticFields: {
    type: "Annotation",
  },
};
