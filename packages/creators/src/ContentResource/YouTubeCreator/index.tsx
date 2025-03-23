import { YouTubeIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import {
  type CreateYouTubeBodyPayload,
  YouTubeForm,
  createYoutubeBody,
} from "./create-youtube-body";

export const youTubeBodyCreator: CreatorDefinition<CreateYouTubeBodyPayload> = {
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
