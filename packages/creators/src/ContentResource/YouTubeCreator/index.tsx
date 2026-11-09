import { YouTubeIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { YouTubeForm, createYoutubeBody, getYouTubeId } from "./create-youtube-body";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/youtube": typeof youTubeBodyCreator;
    }
  }
}

export const youTubeBodyCreator = defineCreator({
  id: "@manifest-editor/youtube",
  create: createYoutubeBody,
  label: "YouTube",
  labelMessage: { namespace: "creators", key: "definitions.youtube.label" },
  summary: "Embed a video using its YouTube link.",
  summaryMessage: { namespace: "creators", key: "definitions.youtube.summary" },
  icon: <YouTubeIcon />,
  resourceType: "ContentResource",
  additionalTypes: ["Canvas", "Annotation"],
  resourceFields: ["id", "type", "service"],
  supportsResource(value) {
    return getYouTubeId(value) ? { initialData: { youtubeUrl: value } } : false;
  },
  render: (ctx) => <YouTubeForm {...ctx} />,
  supports: {
    initialData: true,
    onlyPainting: true,
    parentTypes: ["Annotation", "Manifest", "AnnotationPage"],
    parentFieldMap: {
      Annotation: ["body"],
      Manifest: ["items"],
      AnnotationPage: ["items"],
    },
  },
  staticFields: {
    type: "Video",
  },
});
