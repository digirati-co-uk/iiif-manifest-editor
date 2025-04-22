import { YouTubeIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { YouTubeForm, createYoutubeBody } from "./create-youtube-body";

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
  summary: "Embed YouTube",
  icon: <YouTubeIcon />,
  resourceType: "ContentResource",
  additionalTypes: ["Canvas", "Annotation"],
  resourceFields: ["id", "type", "service"],
  render: (ctx) => <YouTubeForm {...ctx} />,
  supports: {
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
