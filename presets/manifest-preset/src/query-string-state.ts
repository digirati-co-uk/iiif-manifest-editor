import type { Config } from "@manifest-editor/shell";

type UrlState = Config["urlState"];

export function getSearchParam(key: string, urlState?: UrlState) {
  return urlState ? urlState.getSearchParam(key) : new URLSearchParams(window.location.search).get(key);
}

export function replaceSearchParam(key: string, value: string | null | undefined, urlState?: UrlState) {
  if (urlState) {
    urlState.replaceSearchParam(key, value || null);
    return;
  }

  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.replaceState(window.history.state, "", url.href);
}
