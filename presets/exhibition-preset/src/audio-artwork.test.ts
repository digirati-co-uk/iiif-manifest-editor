import { Vault } from "@iiif/helpers/vault";
import { getPaintingImages, applyCanvasLayout, canvasLayouts } from "@manifest-editor/editor-api";
import { describe, expect, test } from "vitest";
import { ensureAudioArtworkCanvas, getAudioArtworkCanvas, removeAudioArtworkCanvas } from "./audio-artwork";

function fixture() {
  const vault = new Vault();
  const canvas = { id: "https://example.org/audio", type: "Canvas", duration: 30, width: 1920, height: 1080,
    behavior: ["audio", "audio-waveform"], label: { en: ["Recording"] },
    items: [{ id: "https://example.org/audio/page", type: "AnnotationPage", items: [{ id: "https://example.org/audio/annotation", type: "Annotation", motivation: "painting", target: "https://example.org/audio", body: { id: "https://example.org/audio.mp3", type: "Sound", duration: 30 } }] }],
  };
  vault.loadSync(canvas.id, canvas as any);
  return { vault, canvas: vault.get(canvas as any) as any };
}

describe("accompanying audio artwork", () => {
  test("creates a separate canvas without changing the recording or adding an exhibition slide", () => {
    const { vault, canvas } = fixture();
    const original = vault.toPresentation3<any>(canvas);
    const artwork = ensureAudioArtworkCanvas(vault, canvas);
    expect(artwork.id).not.toBe(canvas.id);
    expect(artwork.items).toEqual([]);
    expect(artwork.width).toBe(1920);
    const edited = vault.toPresentation3<any>(canvas);
    expect(edited.items).toEqual(original.items);
    expect(edited.behavior).toEqual(original.behavior);
    expect(edited.duration).toBe(30);
    expect(edited.accompanyingCanvas.id).toBe(artwork.id);
    expect(getAudioArtworkCanvas(vault, vault.get(canvas))).toMatchObject({ id: artwork.id });
  });

  test("artwork composition layouts only mutate the accompanying canvas", () => {
    const { vault, canvas } = fixture();
    const original = vault.toPresentation3<any>(canvas);
    const artwork = ensureAudioArtworkCanvas(vault, canvas);
    applyCanvasLayout(vault, artwork, canvasLayouts[0]!);
    const audio = vault.toPresentation3<any>(canvas);
    expect(audio.items).toEqual(original.items);
    expect(audio.duration).toBe(30);
    expect(getPaintingImages(vault, vault.get(canvas))).toEqual([]);
  });

  test("uses existing normalized artwork and detaches it without deleting shared images", () => {
    const { vault, canvas } = fixture();
    const artwork = ensureAudioArtworkCanvas(vault, canvas);
    expect(ensureAudioArtworkCanvas(vault, vault.get(canvas)).id).toBe(artwork.id);
    removeAudioArtworkCanvas(vault, canvas);
    expect(getAudioArtworkCanvas(vault, vault.get(canvas))).toBeNull();
    expect(vault.get({ id: artwork.id, type: "Canvas" }).id).toBe(artwork.id);
    expect(vault.toPresentation3<any>(canvas).items[0].items[0].body.type).toBe("Sound");
  });
});
