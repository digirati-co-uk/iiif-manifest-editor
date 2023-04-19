import { CreatorDefinition } from "@/creator-api";
import { createYoutubeBody } from "./create-youtube-body";
import { TextFormatIcon } from "@/icons/TextFormatIcon";

export const youTubeBodyCreator: CreatorDefinition = {
  id: "@manifest-editor/youtube-body",
  create: createYoutubeBody,
  label: "YouTube",
  summary: "Add embedded YouTube video ",
  icon: <TextFormatIcon />,
  resourceType: "ContentResource",
  resourceFields: ["id", "type", "service"],
  supports: {
    parentTypes: ["Annotation"],
    parentFieldMap: {
      Annotation: ["body"],
    },
  },
  staticFields: {
    type: "Video",
  },
};
