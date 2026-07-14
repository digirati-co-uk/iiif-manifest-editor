import { afterEach, describe, expect, test, vi } from "vitest";
import { createScrollingPreviewUrl } from "./exhibition-preview-url-helper";

describe("createScrollingPreviewUrl", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("uses the template preview path and query parameters on the local viewer", () => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => null },
      location: { hostname: "localhost", origin: "http://localhost:3000" },
    });

    const url = createScrollingPreviewUrl(
      "exhibition",
      { cutCorners: true },
      "https://preview.exhibitionviewer.org/preview/leeds/full-page?theme=leeds",
    );

    expect(url.origin).toBe("http://localhost:5174");
    expect(url.pathname).toBe("/preview/leeds/full-page");
    expect(url.searchParams.get("theme")).toBe("leeds");
    expect(url.searchParams.get("cut-corners")).toBe("true");
    expect(url.searchParams.get("manifest-editor-preview-origin")).toBe("http://localhost:3000");
  });
});
