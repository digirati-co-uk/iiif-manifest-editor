import { describe, expect, test, vi } from "vitest";
vi.mock("@manifest-editor/creators", () => ({
  audioAnnotation: {
    render: () => null,
    supportsResource: async () => ({ initialData: { url: "https://example.org/test.mp3" } }),
  },
}));
import { audioSlideCreator, createAudioSlide } from "./audio-slide-creator";

describe("audio slide creator", () => {
  test("paints Sound and attaches artwork using accompanyingCanvas", () => {
    const ctx: any = {
      generateId: () => "https://example.org/new",
      options: { initialData: {} },
      embed: (resource: any) => resource,
    };
    const result: any = createAudioSlide(
      {
        url: "https://example.org/test.mp3?download=1",
        duration: 20,
        artwork: "https://example.org/art.jpg",
        label: { en: ["Interview"] },
      },
      ctx
    );
    expect(result).toMatchObject({
      type: "Canvas",
      label: { en: ["Interview"] },
      duration: 20,
      behavior: ["audio", "audio-waveform", "image-contain", "w-12", "h-8"],
      items: [{ items: [{ body: { type: "Sound", format: "audio/mpeg", duration: 20 } }] }],
      accompanyingCanvas: { type: "Canvas", items: [{ items: [{ body: { type: "Image" } }] }] },
    });
    expect(result.behavior).not.toContain("autoplay");
  });
  test("inherits audio URL detection and appears in each exhibition creator group", async () => {
    expect(await audioSlideCreator.supportsResource!("https://example.org/test.mp3", {} as any)).toMatchObject({
      initialData: { url: "https://example.org/test.mp3" },
    });
    expect(audioSlideCreator.tags).toEqual(
      expect.arrayContaining(["exhibition-slide", "exhibition-slideshow-slide", "exhibition-scroll-section"])
    );
  });
});
