import { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { createImageUrlAnnotation, CreateImageUrlAnnotationForm } from "./create-image-url-annotation";

export const imageUrlAnnotation: CreatorDefinition = {
  id: "@manifest-editor/image-url-annotation",
  create: createImageUrlAnnotation,
  label: "Image URL",
  dependencies: ["@manifest-editor/image-url-creator"],
  summary: "Add an annotation from Image URL",
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreateImageUrlAnnotationForm {...ctx} />;
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
