import { CreatorDefinition } from "@/creator-api";
import { TextFormatIcon } from "@/icons/TextFormatIcon";
import { CreateImageServiceAnnotationForm, createImageSericeAnnotation } from "./create-service-annotation";
import { resizeResourceToEmptyCanvas } from "@/_creators/side-effects/resize-resource-to-empty-canvas";
import { repositionMultipleImages } from "@/_creators/side-effects/reposition-multiple-images";
import { resizeToFitService } from "@/_creators/side-effects/resize-to-fit-service";

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
  additionalTypes: ["Canvas"],
  supports: {
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  sideEffects: [resizeToFitService, resizeResourceToEmptyCanvas, repositionMultipleImages],
  staticFields: {
    type: "Annotation",
  },
};
