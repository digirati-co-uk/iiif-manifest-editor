import { afterEach, describe, expect, test, vi } from "vitest";
import { createScrollingPreviewUrl } from "./exhibition-preview-url-helper";

afterEach(() => vi.unstubAllGlobals());

function editorAt(origin: string) {
  vi.stubGlobal("window", { location: new URL(origin) });
}

describe("exhibition development previews", () => {
  test("allows another loopback port without redirecting to an external origin", () => {
    editorAt("http://localhost:3000");
    (window as any).localStorage = { getItem: () => "http://127.0.0.1:5175" };
    expect(createScrollingPreviewUrl("scroll").origin).toBe("http://127.0.0.1:5175");
    (window as any).localStorage = { getItem: () => "https://external.example" };
    expect(createScrollingPreviewUrl("scroll").origin).toBe("http://localhost:5174");
  });
  test.each(["delft", "leeds"])("routes every %s template to the local viewer", (theme) => {
    editorAt("http://localhost:3000");
    for (const layout of ["full-page", "slideshow", "scroll"]) {
      const url = createScrollingPreviewUrl(
        "exhibition",
        { manifest: "https://example.org/manifest" },
        `https://preview.exhibitionviewer.org/preview/${theme}/${layout}`
      );
      expect(url.origin).toBe("http://localhost:5174");
      expect(url.pathname).toBe(`/preview/${theme}/${layout}`);
      expect(url.searchParams.get("manifest-editor-preview-origin")).toBe("http://localhost:3000");
      expect(url.searchParams.get("manifest")).toBe("https://example.org/manifest");
    }
  });

  test("also maps the default URL on loopback", () => {
    editorAt("http://127.0.0.1:3000");
    expect(createScrollingPreviewUrl("scroll").origin).toBe("http://localhost:5174");
  });

  test("preserves custom hosts and production previews", () => {
    editorAt("http://localhost:3000");
    expect(createScrollingPreviewUrl("scroll", {}, "https://custom.example/preview").origin).toBe(
      "https://custom.example"
    );
    editorAt("https://editor.example");
    expect(createScrollingPreviewUrl("scroll").origin).toBe("https://preview.exhibitionviewer.org");
  });
});
