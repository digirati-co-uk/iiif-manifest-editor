"use client";

import { useMemo } from "react";

export function HandleQueryString() {
  const queryString = useMemo(() => {
    if (typeof window === "undefined") return null;

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const resource = params.get("iiif-content");

    // Options:
    //   - Just a query string - open up a modal with options
    //   - Could have `intent` with `edit` or `import`
    //   - Could also have a unique ID, and importing would override the existing (show modal)

    if (resource) {
      return resource;
    }

    return null;
  }, []);

  return null;
}
