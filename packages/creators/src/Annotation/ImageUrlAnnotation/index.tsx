import { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { createImageUrlAnnotation, CreateImageUrlAnnotationForm } from "./create-image-url-annotation";
import { AddImageIcon } from "@manifest-editor/components";

export const imageUrlAnnotation: CreatorDefinition = {
  id: "@manifest-editor/image-url-annotation",
  create: createImageUrlAnnotation,
  label: "Image",
  dependencies: ["@manifest-editor/image-url-creator"],
  summary: "Image from URL",
  tags: ["image"],
  icon: <AddImageIcon />,
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
