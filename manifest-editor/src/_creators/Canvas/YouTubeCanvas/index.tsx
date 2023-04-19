import { CreatorDefinition } from "@/creator-api";
import { ThumbnailStripIcon } from "../../../icons/ThumbnailStripIcon";
import { CreatorFunctionContext } from "../../../creator-api";
import { InternationalString } from "@iiif/presentation-3";

export const youTubeCanvas: CreatorDefinition = {
  id: "@manifest-editor/youtube-canvas",
  create: createYouTubeCanvas,
  dependencies: ["@manifest-editor/youtube-body"],
  label: "YouTube canvas",
  summary: "Canvas with a YouTube video",
  icon: <ThumbnailStripIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "duration", "items"],
  supports: {},
};

interface YouTubeCanvasPayload {
  label?: InternationalString;
  youtubeUrl: string;
  height: number;
  width: number;
  duration: number;
}

async function createYouTubeCanvas(data: YouTubeCanvasPayload, ctx: CreatorFunctionContext) {
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" });

  const annotation = await ctx.create(
    "@manifest-editor/youtube-body",
    {
      youtubeUrl: data.youtubeUrl,
    },
    {
      parent: { resource: { id: pageId, type: "AnnotationPage" }, property: "items" },
    }
  );

  const page = ctx.embed({
    id: pageId,
    type: "AnnotationPage",
    items: [annotation],
  });

  return {
    id: canvasId,
    type: "Canvas",
    label: data.label || { en: ["Untitled YouTube canvas"] },
    height: data.height,
    width: data.width,
    duration: data.duration,
    items: [page],
  };
}
