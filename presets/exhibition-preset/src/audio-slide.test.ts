import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import { accompanyingImageCanvas, audioFormat, isAudioCanvas, withAudioSlideDefaults } from "./audio-slide";

describe("audio slide defaults", () => {
  test("sets audio defaults without autoplay or image layout markers", () => {
    expect(withAudioSlideDefaults()).toEqual(["audio", "audio-waveform", "image-contain", "w-12", "h-8"]);
  });
  test("preserves explicit choices and extension behaviors", () => {
    expect(withAudioSlideDefaults(["no-audio-waveform", "image-cover", "w-6", "h-3", "left", "custom"])).toEqual([
      "no-audio-waveform",
      "image-cover",
      "w-6",
      "h-3",
      "left",
      "custom",
      "audio",
    ]);
  });
  test("keeps artwork in an accompanying canvas", () => {
    const artwork = accompanyingImageCanvas("https://example.org/canvas", "https://example.org/art.jpg", 600, 800);
    expect(artwork).toMatchObject({
      type: "Canvas",
      width: 600,
      height: 800,
      items: [{ items: [{ target: artwork.id, body: { type: "Image", id: "https://example.org/art.jpg" } }] }],
    });
  });
  test("recognises imported Sound canvases without custom behaviors", () => {
    const vault = new Vault();
    const canvas = {
      id: "https://example.org/audio",
      type: "Canvas",
      duration: 20,
      items: [
        {
          id: "https://example.org/page",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/annotation",
              type: "Annotation",
              motivation: "painting",
              target: "https://example.org/audio",
              body: { id: "https://example.org/sound.mp3", type: "Sound", duration: 20 },
            },
          ],
        },
      ],
    };
    vault.loadSync(canvas.id, canvas);
    expect(isAudioCanvas(vault, vault.get(canvas))).toBe(true);
    expect(isAudioCanvas(vault, { items: [] })).toBe(false);
  });
  test("detects audio formats with query strings", () => {
    expect(audioFormat("https://example.org/file.MP3?token=a")).toBe("audio/mpeg");
    expect(audioFormat("https://example.org/stream")).toBeUndefined();
  });
});

import { resolveAudioSlideControls } from "./audio-slide";

test("audio controls resolve preset defaults then the last explicit slide override", () => {
  expect(resolveAudioSlideControls([], { autoplay: true, showWaveform: false, imageFit: "cover" })).toEqual({
    autoplay: true,
    showWaveform: false,
    imageFit: "cover",
  });
  expect(
    resolveAudioSlideControls(
      ["no-autoplay", "autoplay", "no-audio-waveform", "audio-waveform", "image-cover", "image-contain"],
      { autoplay: false }
    )
  ).toEqual({ autoplay: true, showWaveform: true, imageFit: "contain" });
  expect(resolveAudioSlideControls(["autoplay", "no-autoplay"])).toMatchObject({ autoplay: false });
});
