import { VideoIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import {
  CreateVideoAnnotationForm,
  type CreateVideoAnnotationPayload,
  createVideoAnnotation,
} from "./create-video-annotation";

export const videoAnnotation: CreatorDefinition<CreateVideoAnnotationPayload> =
  {
    id: "@manifest-editor/video-annotation",
    create: createVideoAnnotation,
    label: "Video",
    summary: "Video annotation",
    icon: <VideoIcon />,
    render(ctx) {
      return <CreateVideoAnnotationForm {...ctx} />;
    },
    resourceType: "Annotation",
    resourceFields: ["id", "type", "motivation", "body", "target"],
    additionalTypes: ["Canvas"],
    supports: {
      initialData: true,
      parentTypes: ["AnnotationPage", "Manifest"],
      parentFields: ["items"],
    },
    staticFields: {
      type: "Annotation",
    },
  };
