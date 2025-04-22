import { VideoIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { CreateVideoAnnotationForm, createVideoAnnotation } from "./create-video-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/video-annotation": typeof videoAnnotation;
    }
  }
}

export const videoAnnotation = defineCreator({
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
});
