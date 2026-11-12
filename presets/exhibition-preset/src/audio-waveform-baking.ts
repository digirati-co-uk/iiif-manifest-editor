import type { Vault } from "@iiif/helpers/vault";
import { entityActions, mappingActions } from "@iiif/helpers/vault/actions";

export const BAKED_WAVEFORM_PROFILE = "https://exhibitionviewer.org/profiles/generated-waveform";
export const WAVEFORM_BAKE_LIMITS = { maxBytes: 48 * 1024 * 1024, maxSeconds: 45 * 60, bins: 480 };

export interface BakedWaveform {
  version: 2;
  bits: 16;
  channels: 1;
  sample_rate: number;
  samples_per_pixel: number;
  length: number;
  data: number[];
}

/** A new run or cancellation invalidates every older asynchronous callback. */
export function createWaveformBakeJob() {
  let current: AbortController | undefined;
  return {
    start() {
      current?.abort();
      const controller = new AbortController();
      current = controller;
      return { signal: controller.signal, isCurrent: () => current === controller && !controller.signal.aborted };
    },
    cancel() { current?.abort(); current = undefined; },
  };
}

export function getCanvasSound(vault: Vault, canvas: any): any {
  for (const page of canvas?.items || []) {
    for (const annotation of vault.get(page)?.items || []) {
      for (const reference of vault.get(annotation)?.body || []) {
        const body = vault.get(reference) as any;
        const sound = body?.type === "SpecificResource" ? vault.get(body.source) : body;
        if (sound?.type === "Sound") return sound;
      }
    }
  }
  return null;
}

export function getBakedWaveform(vault: Vault, canvas: any): any {
  return (canvas?.seeAlso || []).map((reference: any) => vault.get(reference)).find(
    (resource: any) => resource?.profile === BAKED_WAVEFORM_PROFILE,
  );
}

export function saveBakedWaveform(vault: Vault, canvasId: string, peaks: BakedWaveform | null) {
  const canvas = vault.get({ id: canvasId, type: "Canvas" });
  const retained = (canvas?.seeAlso || []).filter((reference: any) => {
    const resource = vault.get(reference) as any;
    return resource?.profile !== BAKED_WAVEFORM_PROFILE;
  });
  vault.batch((batch) => {
    if (peaks) {
      const id = `${canvasId.replace(/\/$/, "")}/waveform`;
      // loadSync accepts IIIF roots, not standalone Dataset bodies. Import the normalized content resource explicitly.
      batch.dispatch(entityActions.importEntities({ entities: { ContentResource: { [id]: {
        id, type: "Dataset", format: "application/json", profile: BAKED_WAVEFORM_PROFILE, value: peaks,
        label: { en: ["Audio waveform generated in the exhibition editor"] },
      } as any } } }));
      batch.dispatch(mappingActions.addMapping({ id, type: "ContentResource" }));
      retained.unshift({ id, type: "ContentResource" });
    }
    batch.modifyEntityField({ id: canvasId, type: "Canvas" }, "seeAlso", retained);
  });
}

/** Quantized min/max peaks from every decoded sample, in timeline order; no random sampling. */
export async function bakeDecodedAudio(
  decoded: Pick<AudioBuffer, "sampleRate" | "length" | "numberOfChannels" | "getChannelData">,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<BakedWaveform> {
  const scale = Math.max(1, Math.ceil(decoded.length / WAVEFORM_BAKE_LIMITS.bins));
  const length = Math.ceil(decoded.length / scale);
  const data: number[] = [];
  const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index));
  for (let bin = 0; bin < length; bin++) {
    signal.throwIfAborted();
    let min = 0, max = 0;
    for (const channel of channels) {
      for (let sample = bin * scale; sample < Math.min(decoded.length, (bin + 1) * scale); sample++) {
        min = Math.min(min, channel[sample] || 0);
        max = Math.max(max, channel[sample] || 0);
      }
    }
    data.push(Math.round(Math.max(-1, min) * 32768), Math.round(Math.min(1, max) * 32767));
    if (bin % 16 === 0 || bin === length - 1) {
      onProgress((bin + 1) / length);
      // Let progress paint and allow the listener to cancel between groups of bins.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  signal.throwIfAborted();
  return { version: 2, bits: 16, channels: 1, sample_rate: decoded.sampleRate, samples_per_pixel: scale, length, data };
}

export async function generateBakedWaveform(
  url: string,
  { signal, duration, onProgress }: { signal: AbortSignal; duration?: number; onProgress: (progress: number) => void },
): Promise<BakedWaveform> {
  if (duration && duration > WAVEFORM_BAKE_LIMITS.maxSeconds) throw new Error("Browser generation supports recordings up to 45 minutes.");
  const Offline = globalThis.OfflineAudioContext || (globalThis as any).webkitOfflineAudioContext;
  if (!Offline) throw new Error("This browser does not support audio waveform generation.");
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]) });
  if (!response.ok) throw new Error(`Could not read the recording (${response.status}).`);
  const total = Number(response.headers.get("content-length"));
  if (total > WAVEFORM_BAKE_LIMITS.maxBytes) { await response.body?.cancel(); throw new Error("Browser generation supports audio files up to 48 MB."); }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("This browser cannot stream the recording.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > WAVEFORM_BAKE_LIMITS.maxBytes) throw new Error("Browser generation supports audio files up to 48 MB.");
      chunks.push(value);
      onProgress(0.6 * Math.min(1, size / (total > 0 ? total : WAVEFORM_BAKE_LIMITS.maxBytes)));
    }
  } finally { await reader.cancel().catch(() => {}); }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  chunks.length = 0;
  signal.throwIfAborted();
  onProgress(0.65);
  // Low-rate PCM is sufficient for the envelope and bounds decoded memory for long recordings.
  const decoded: AudioBuffer = await new Offline(1, 1, 8000).decodeAudioData(buffer.buffer);
  signal.throwIfAborted();
  if (!decoded.length || decoded.duration > WAVEFORM_BAKE_LIMITS.maxSeconds) throw new Error("Browser generation supports recordings up to 45 minutes.");
  return bakeDecodedAudio(decoded, signal, (progress) => onProgress(0.7 + progress * 0.3));
}
