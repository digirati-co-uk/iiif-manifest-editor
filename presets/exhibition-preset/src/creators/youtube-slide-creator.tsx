import { emptyCanvas } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import { type CreatorFunctionContext, defineCreator } from "@manifest-editor/creator-api";
import { youTubeBodyCreator } from "@manifest-editor/creators";
import { getYouTubeId } from "@manifest-editor/editors";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/youtube-creator": typeof youtubeSlideCreator;
    }
  }
}

export const youtubeSlideCreator = defineCreator({
  ...youTubeBodyCreator,
  id: "@exhibitions/youtube-creator",
  create: createYoutube,
  tags: ["video", "exhibition-slide"],
  label: "YouTube",
  summary: "A YouTube for an exhibition",
});

interface YouTubeCreatePayload {
  youtubeUrl: string;
  label?: InternationalString;
  height?: number;
  width?: number;
  duration: number;
}

async function createYoutube(data: YouTubeCreatePayload, ctx: CreatorFunctionContext) {
  const ytId = getYouTubeId(data.youtubeUrl);
  const canvasId = ctx.generateId("canvas");
  const pageId = ctx.generateId("annotation-page", {
    id: canvasId,
    type: "Canvas",
  });

  const annotation = await ctx.create("@manifest-editor/youtube", data, {
    target: {
      id: canvasId,
      type: "Canvas",
    },
    targetType: "Annotation",
    parent: {
      resource: { id: pageId, type: "AnnotationPage" },
      property: "items",
    },
  });

  const page = ctx.embed({
    id: pageId,
    type: "AnnotationPage",
    items: [annotation],
  });

  const thumbnail = ctx.embed({
    id: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    type: "Image",
    format: "image/jpeg",
    width: 640,
    height: 360,
  });

  // Add thumbnail?

  return ctx.embed({
    ...emptyCanvas, // bug with placeholder canvas.
    id: canvasId,
    type: "Canvas",
    behavior: ["w-12", "h-8"],
    label: data.label || { en: ["Untitled YouTube Video"] },
    height: data.height || 1080,
    width: data.width || 1920,
    thumbnail: [thumbnail],
    items: [page],
  });
}
