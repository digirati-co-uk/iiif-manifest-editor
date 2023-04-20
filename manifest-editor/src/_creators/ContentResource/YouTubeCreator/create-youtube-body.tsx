import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import { FormEvent } from "react";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { Input, InputContainer, InputLabel } from "@/editors/Input";
import { Button } from "@/atoms/Button";

const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?vi?=|&vi?=))([^#&?]*).*/;

export interface CreateYouTubeBodyPayload {
  youtubeUrl: string;
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
  return ctx.embed({
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
