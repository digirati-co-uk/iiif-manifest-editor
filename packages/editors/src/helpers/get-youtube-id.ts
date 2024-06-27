const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?vi?=|&vi?=))([^#&?]*).*/;

export function getYouTubeId(url: string) {
  const id = (url || "").match(ytRegex);
  return id ? id[1] : null;
}
