import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import { FormEvent } from "react";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { Input, InputContainer, InputLabel } from "@/editors/Input";
import { Button } from "@/atoms/Button";
import { InternationalString } from "@iiif/presentation-3";

const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?vi?=|&vi?=))([^#&?]*).*/;

export interface CreateYouTubeBodyPayload {
  youtubeUrl: string;
  label?: InternationalString;
  height?: number;
  width?: number;
  duration: number;
}

export function getYouTubeId(url: string) {
  const id = (url || "").match(ytRegex);
  return id ? id[1] : null;
}

export function validateYouTube(data: CreateYouTubeBodyPayload) {
  return !!getYouTubeId(data.youtubeUrl);
}

export async function createYoutubeBody(data: CreateYouTubeBodyPayload, ctx: CreatorFunctionContext) {
  const id = getYouTubeId(data.youtubeUrl);
  const body = ctx.embed({
    id: `https://www.youtube.com/watch?v=${id}`,
    type: "Video",
    service: [
      {
        profile: "http://digirati.com/objectifier",
        params: {
          data: `https://www.youtube.com/embed/${id}`,
        },
      },
      {
        id: `https://www.youtube.com/watch?v=${id}`,
        profile: "https://www.youtube.com",
      },
    ],
  });

  if (ctx.options.targetType === "Canvas") {
    const canvasId = ctx.generateId("canvas");
    const pageId = ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" });

    const annotation = await ctx.embed({
      id: ctx.generateId("annotation", { id: pageId, type: "AnnotationPage" }),
      type: "Annotation",
      motivation: "painting",
      body: [body],
      target: { type: "SpecificResource", source: { id: canvasId, type: "Canvas" } },
    });

    const page = ctx.embed({
      id: pageId,
      type: "AnnotationPage",
      items: [annotation],
    });

    return ctx.embed({
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: ["Untitled YouTube canvas"] },
      height: data.height || 1000,
      width: data.width || 1000,
      duration: data.duration || 1,
      items: [page],
    });
  }

  if (ctx.options.targetType === "Annotation" || ctx.options.targetType === "Canvas") {
    return ctx.embed({
      id: ctx.generateId("annotation"),
      type: "Annotation",
      motivation: "painting",
      body: [body],
      target: ctx.getTarget(),
    });
  }

  return body;
}

export function YouTubeForm(props: CreatorContext) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.youtubeUrl) {
      props.runCreate({ youtubeUrl: formData.youtubeUrl });
    }
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <InputContainer wide>
          <InputLabel htmlFor="id">Link to YouTube</InputLabel>
          <Input id="youtubeUrl" name="youtubeUrl" defaultValue="" />
        </InputContainer>

        <Button type="submit">Create</Button>
      </form>
    </PaddedSidebarContainer>
  );
}
