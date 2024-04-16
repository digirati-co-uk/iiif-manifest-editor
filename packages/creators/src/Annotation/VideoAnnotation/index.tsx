import { CreatorDefinition } from "@manifest-editor/creator-api";
import { createVideoAnnotation, CreateVideoAnnotationForm } from "./create-video-annotation";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";

export const videoAnnotation: CreatorDefinition = {
  id: "@manifest-editor/video-annotation",
  create: createVideoAnnotation,
  label: "Video Annotation",
  summary: "Add Video annotation (mp4)",
  icon: <TextFormatIcon />,
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
