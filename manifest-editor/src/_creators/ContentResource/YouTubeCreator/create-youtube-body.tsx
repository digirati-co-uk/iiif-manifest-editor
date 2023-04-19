import { CreatorFunctionContext } from "@/creator-api/types";

const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?vi?=|&vi?=))([^#&?]*).*/;

export interface CreateYouTubeBodyPayload {
  youtubeUrl: string;
}

function getId(url: string) {
  const id = (url || "").match(ytRegex);
  return id ? id[1] : null;
}

export function validateYouTube(data: CreateYouTubeBodyPayload) {
  return !!getId(data.youtubeUrl);
}

export async function createYoutubeBody(data: CreateYouTubeBodyPayload, ctx: CreatorFunctionContext) {
  const id = getId(data.youtubeUrl);
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
