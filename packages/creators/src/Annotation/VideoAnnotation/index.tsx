import { VideoIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { getContentType, isHttpUrl, matchesExtension } from "../../resource-probes";
import {
  CreateVideoAnnotationForm,
  createVideoAnnotation,
} from "./create-video-annotation";

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
  async supportsResource(value, helpers) {
    if (!isHttpUrl(value)) return false;
    const contentType = await getContentType(value, helpers);
    if (contentType.startsWith("video/") || matchesExtension(value, [".mp4", ".m4v", ".webm", ".mov"])) {
      return { initialData: { url: value } };
    }
    return false;
  },
  supports: {
    onlyPainting: true,
    initialData: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
});
