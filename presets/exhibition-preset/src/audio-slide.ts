import { DEFAULT_AUDIO_THEME_OPTIONS, type AudioThemeOptions } from "./theme/theme-service";
import type { Vault } from "@iiif/helpers/vault";

export const AUDIO_SLIDE_DEFAULTS = ["audio", "audio-waveform", "image-contain", "w-12", "h-8"];

export function isAudioCanvas(vault: Vault, canvas: any): boolean {
  if (!canvas) return false;
  if (canvas.behavior?.includes("audio")) return true;
  return (canvas.items || []).some((page: any) =>
    (vault.get(page)?.items || []).some((annotation: any) => {
      const value = vault.get(annotation);
      return (Array.isArray(value?.body) ? value.body : [value?.body]).some((body: any) => {
        const resolved = body && vault.get(body);
        return (resolved?.type === "SpecificResource" ? vault.get(resolved.source) : resolved)?.type === "Sound";
      });
    })
  );
}

export function isAudioEditingResource(vault: Vault, resource: any) {
  return isAudioCanvas(vault, vault.get(resource?.source || resource));
}

export function withAudioSlideDefaults(behavior: string[] = []) {
  const next = behavior.filter((item) => item !== "multi-image" && item !== "info");
  const groups = [
    { values: ["audio"], fallback: "audio" },
    { values: ["audio-waveform", "no-audio-waveform"], fallback: "audio-waveform" },
    { values: ["image-cover", "image-contain", "cover", "contain"], fallback: "image-contain" },
    { values: ["w-"], fallback: "w-12" },
    { values: ["h-"], fallback: "h-8" },
  ];
  for (const group of groups) {
    if (
      !next.some((item) =>
        group.values.some((value) => (value.endsWith("-") ? item.startsWith(value) : item === value))
      )
    )
      next.push(group.fallback);
  }
  return next;
}

export function resolveAudioSlideControls(behavior: string[], defaults: Partial<AudioThemeOptions> = {}) {
  const base = { ...DEFAULT_AUDIO_THEME_OPTIONS, ...defaults };
  const last = (values: string[]) => [...behavior].reverse().find((value) => values.includes(value));
  const waveform = last(["audio-waveform", "no-audio-waveform"]);
  const autoplay = last(["autoplay", "no-autoplay"]);
  const fit = last(["image-cover", "cover", "image-contain", "contain"]);
  return {
    showWaveform: waveform ? waveform === "audio-waveform" : base.showWaveform !== false,
    autoplay: autoplay ? autoplay === "autoplay" : base.autoplay === true,
    imageFit: fit
      ? ["cover", "image-cover"].includes(fit)
        ? "cover"
        : "contain"
      : base.imageFit === "cover"
        ? "cover"
        : "contain",
  };
}

export function audioFormat(url: string) {
  const extension = url.split(/[?#]/)[0]?.split(".").pop()?.toLowerCase();
  return (
    {
      mp3: "audio/mpeg",
      m4a: "audio/mp4",
      mp4: "audio/mp4",
      wav: "audio/wav",
      ogg: "audio/ogg",
      oga: "audio/ogg",
      flac: "audio/flac",
      webm: "audio/webm",
    } as Record<string, string>
  )[extension || ""];
}

/** Standard IIIF accompanying canvas: the image never paints onto the timed canvas. */
export function accompanyingImageCanvas(canvasId: string, imageUrl: string, width = 1920, height = 1080) {
  const id = `${canvasId}/accompanying`;
  return {
    id,
    type: "Canvas" as const,
    width,
    height,
    items: [
      {
        id: `${id}/page`,
        type: "AnnotationPage" as const,
        items: [
          {
            id: `${id}/annotation`,
            type: "Annotation" as const,
            motivation: "painting",
            target: id,
            body: { id: imageUrl, type: "Image" as const, width, height },
          },
        ],
      },
    ],
  };
}
