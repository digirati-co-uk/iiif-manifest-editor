import { CreatorDefinition } from "@/creator-api";
import { ThumbnailStripIcon } from "../../../icons/ThumbnailStripIcon";
import { CreatorFunctionContext } from "../../../creator-api";
import { InternationalString } from "@iiif/presentation-3";
import { YouTubeForm } from "@/_creators/ContentResource/YouTubeCreator/create-youtube-body";

export const youTubeAnnotation: CreatorDefinition = {
  id: "@manifest-editor/youtube-annotation",
  create: createYouTubeAnnotation,
  dependencies: ["@manifest-editor/youtube-body"],
  label: "YouTube annotation",
  summary: "Annotation with a YouTube video",
  icon: <ThumbnailStripIcon />,
  render: (ctx) => <YouTubeForm {...ctx} />,
  resourceType: "Annotation",
  resourceFields: ["id", "type", "body"],
  supports: {},
};

interface YouTubeAnnotationPayload {
  label?: InternationalString;
  youtubeUrl: string;
  height: number;
  width: number;
  duration: number;
}

async function createYouTubeAnnotation(data: YouTubeAnnotationPayload, ctx: CreatorFunctionContext) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };

  const body = await ctx.create(
    "@manifest-editor/youtube-body",
    {
      youtubeUrl: data.youtubeUrl,
    },
    {
      parent: { resource: annotation, property: "body" },
    }
  );

  return ctx.embed({
    ...annotation,
    motivation: "painting",
    body: [body],
    target: ctx.getTarget(),
  });
}
