import { CreatorDefinition } from "@/creator-api";
import { TextFormatIcon } from "@/icons/TextFormatIcon";
import { CreateImageUrlAnnotationForm, createImageUrlAnnotation } from "./create-image-url-annotation";
import { resizeResourceToEmptyCanvas } from "@/_creators/side-effects/resize-resource-to-empty-canvas";
import { repositionMultipleImages } from "@/_creators/side-effects/reposition-multiple-images";
import { resizeToFitService } from "@/_creators/side-effects/resize-to-fit-service";

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
