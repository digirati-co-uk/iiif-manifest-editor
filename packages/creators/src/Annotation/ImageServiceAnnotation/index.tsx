import { IIIFLogo } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import {
  CreateImageServiceAnnotationForm,
  type CreateImageServiceAnnotationPayload,
  createImageServiceAnnotation,
} from "./create-service-annotation";

// @todo combine this with the content resource one.
export const imageServiceAnnotation: CreatorDefinition<CreateImageServiceAnnotationPayload> =
  {
    id: "@manifest-editor/image-service-annotation",
    create: createImageServiceAnnotation,
    label: "IIIF Image",
    dependencies: ["@manifest-editor/image-service-creator"],
    summary: "IIIF Image service",
    tags: ["image", "image-service"],
    icon: <IIIFLogo style={{ padding: 10 }} />,
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
    sideEffects: [
      resizeToFitService,
      resizeResourceToEmptyCanvas,
      repositionMultipleImages,
    ],
    staticFields: {
      type: "Annotation",
    },
  };
