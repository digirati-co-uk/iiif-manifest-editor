import { CreatorDefinition } from "@/creator-api";
import { createYoutubeBody, YouTubeForm } from "./create-youtube-body";
import { TextFormatIcon } from "@/icons/TextFormatIcon";

export const youTubeBodyCreator: CreatorDefinition = {
  id: "@manifest-editor/youtube",
  create: createYoutubeBody,
  label: "YouTube",
  summary: "Add embedded YouTube video",
  icon: <TextFormatIcon />,
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
