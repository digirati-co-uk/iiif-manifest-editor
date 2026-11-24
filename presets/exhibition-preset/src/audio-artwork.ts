import type { Vault } from "@iiif/helpers/vault";

/** The accompanying canvas is a separate image composition, never the timed Sound canvas. */
export function getAudioArtworkCanvas(vault: Vault, audio: any): any | null {
  const reference = Array.isArray(audio?.accompanyingCanvas) ? audio.accompanyingCanvas[0] : audio?.accompanyingCanvas;
  if (!reference) return null;
  const canvas = vault.get(reference) as any;
  return canvas?.type === "Canvas" ? canvas : null;
}

export function ensureAudioArtworkCanvas(vault: Vault, audio: any): any {
  const existing = getAudioArtworkCanvas(vault, audio);
  if (existing) return existing;
  const id = `${audio.id}/accompanying/${crypto.randomUUID()}`;
  vault.loadSync(id, {
    id, type: "Canvas", label: { en: ["Accompanying artwork"] },
    width: audio.width || 1920, height: audio.height || 1080, items: [],
  } as any);
  vault.modifyEntityField({ id: audio.id, type: "Canvas" }, "accompanyingCanvas", { id, type: "Canvas" });
  return vault.get({ id, type: "Canvas" });
}

export function removeAudioArtworkCanvas(vault: Vault, audio: any) {
  // Detach only. Deleting the referenced resource could affect another slide that shares it.
  vault.modifyEntityField({ id: audio.id, type: "Canvas" }, "accompanyingCanvas", null);
}
