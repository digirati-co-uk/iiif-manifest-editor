import { YouTubeIcon } from "@manifest-editor/components";
import { createYoutubeBody, YouTubeForm } from "./create-youtube-body";
import { CreatorDefinition } from "@manifest-editor/creator-api";

export const youTubeBodyCreator: CreatorDefinition = {
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
};
