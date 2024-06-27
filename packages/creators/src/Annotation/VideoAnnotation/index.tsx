import { CreatorDefinition } from "@manifest-editor/creator-api";
import { createVideoAnnotation, CreateVideoAnnotationForm } from "./create-video-annotation";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { VideoIcon } from "@manifest-editor/components";

export const videoAnnotation: CreatorDefinition = {
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
