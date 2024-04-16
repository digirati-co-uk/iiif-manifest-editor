import { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { createImageServiceAnnotation, CreateImageServiceAnnotationForm } from "./create-service-annotation";

// @todo combine this with the content resource one.
export const imageServiceAnnotation: CreatorDefinition = {
  id: "@manifest-editor/image-service-annotation",
  create: createImageServiceAnnotation,
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
