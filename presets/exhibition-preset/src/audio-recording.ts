import { entityActions, mappingActions } from "@iiif/helpers/vault/actions";
import type { Vault } from "@iiif/helpers/vault";
import { audioFormat } from "./audio-slide";
import { getCanvasSound } from "./audio-waveform-baking";

/** Change the recording without touching its artwork or the annotation target. */
export function replaceAudioRecording(vault: Vault, canvasId: string, url: string, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error("Load a recording with a finite duration before replacing it.");
  const next = new URL(url.trim());
  if (!["http:", "https:"].includes(next.protocol)) throw new Error("Use an HTTP or HTTPS audio URL.");
  const canvas = vault.get({ id: canvasId, type: "Canvas" });
  const sound = getCanvasSound(vault, canvas);
  if (!canvas || !sound) throw new Error("The slide has no recording to replace.");
  if (sound.id === next.href) return;
  const keepLink = (reference: any) => {
    const link = vault.get(reference) || reference;
    const profiles = Array.isArray(link?.profile) ? link.profile : [link?.profile];
    return (
      !profiles.some((profile: unknown) => typeof profile === "string" && /waveform/i.test(profile)) &&
      !/\.dat(?:[?#]|$)|\.(?:peaks|waveform)\.json(?:[?#]|$)/i.test(link?.id || "")
    );
  };
  const replacement = {
    ...sound,
    id: next.href,
    format: audioFormat(next.href),
    duration,
    seeAlso: (sound.seeAlso || []).filter(keepLink),
    rendering: (sound.rendering || []).filter(keepLink),
  };
  const hasSelector = canvas.items.some((page) =>
    vault
      .get(page)
      ?.items?.some((ann) =>
        vault
          .get(ann)
          ?.body?.some(
            (body: any) => body?.type === "SpecificResource" && body.source?.id === sound.id && body.selector
          )
      )
  );
  vault.batch((batch) => {
    batch.dispatch(
      entityActions.importEntities({ entities: { ContentResource: { [replacement.id]: replacement } } } as any)
    );
    batch.dispatch(mappingActions.addMapping({ id: replacement.id, type: "ContentResource" }));
    for (const page of canvas.items.map((p) => vault.get(p)))
      for (const ann of page.items || []) {
        const annotation = vault.get(ann);
        let changed = false;
        const body = annotation.body.map((reference: any) => {
          const value = reference?.type === "SpecificResource" ? reference : (vault.get(reference) as any);
          if (value?.id === sound.id) {
            changed = true;
            return { id: replacement.id, type: "ContentResource" };
          }
          if (value?.type === "SpecificResource" && value.source?.id === sound.id) {
            changed = true;
            return { ...value, source: { id: replacement.id, type: "ContentResource" } };
          }
          return value;
        });
        if (changed) batch.modifyEntityField(annotation, "body", body as any);
      }
    // A selected time segment keeps its canvas timing; otherwise the canvas spans the new file.
    batch.modifyEntityField(
      canvas,
      "duration",
      hasSelector && canvas.duration ? Math.min(canvas.duration, duration) : duration
    );
    batch.modifyEntityField(canvas, "seeAlso", (canvas.seeAlso || []).filter(keepLink));
    batch.modifyEntityField(canvas, "rendering", (canvas.rendering || []).filter(keepLink));
  });
}

/** Read metadata before changing the manifest, so cancellation never leaves an incomplete slide. */
export function probeAudioDuration(url: string, signal: AbortSignal): Promise<number> {
  const parsed = new URL(url.trim());
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Use an HTTP or HTTPS audio URL.");
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const cleanup = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute("src");
      audio.load();
    };
    const fail = (error: Error) => {
      cleanup();
      reject(error);
    };
    const abort = () => fail(new DOMException("Cancelled", "AbortError"));
    const timeout = setTimeout(
      () => fail(new Error("The recording took too long to load. Check the URL and try again.")),
      30000
    );
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        fail(new Error("The recording has no finite duration. Choose a direct audio-file URL."));
        return;
      }
      cleanup();
      resolve(duration);
    };
    audio.onerror = () => fail(new Error("The recording could not be loaded. Check the audio URL and try again."));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    audio.src = parsed.href;
  });
}
