import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test, vi } from "vitest";
import {
  BAKED_WAVEFORM_PROFILE, bakeDecodedAudio, createWaveformBakeJob,
  generateBakedWaveform, getBakedWaveform, saveBakedWaveform, type BakedWaveform,
} from "./audio-waveform-baking";

const peaks: BakedWaveform = {
  version: 2, bits: 16, channels: 1, sample_rate: 8000, samples_per_pixel: 4000, length: 2,
  data: [-16000, 20000, -12000, 14000],
};

function fixture() {
  const vault = new Vault();
  const canvas = {
    id: "https://example.org/canvas", type: "Canvas", duration: 1,
    seeAlso: [{ id: "https://example.org/description.json", type: "Dataset", format: "application/json" }],
    items: [],
  };
  vault.loadSync(canvas.id, canvas as any);
  return { vault, canvas };
}

describe("baked waveform persistence", () => {
  test("exports inline BBC JSON and preserves other seeAlso links across regeneration and removal", () => {
    const { vault, canvas } = fixture();
    saveBakedWaveform(vault, canvas.id, peaks);
    let exported = vault.toPresentation3<any>({ id: canvas.id, type: "Canvas" });
    expect(exported.seeAlso).toHaveLength(2);
    expect(exported.seeAlso[0]).toMatchObject({ type: "Dataset", format: "application/json", profile: BAKED_WAVEFORM_PROFILE });
    expect(exported.seeAlso[0].id).toBe(`${canvas.id}/waveform`);
    expect(exported.seeAlso[0].value).toEqual(peaks);
    expect(getBakedWaveform(vault, vault.get(canvas as any))).toBeTruthy();
    saveBakedWaveform(vault, canvas.id, { ...peaks, data: [-1, 1, -2, 2] });
    exported = vault.toPresentation3<any>({ id: canvas.id, type: "Canvas" });
    expect(exported.seeAlso).toHaveLength(2);
    expect(exported.seeAlso[0].id).toBe(`${canvas.id}/waveform`);
    expect(exported.seeAlso[0].value.data).toEqual([-1,1,-2,2]);
    expect(exported.seeAlso[1].id).toBe("https://example.org/description.json");
    saveBakedWaveform(vault, canvas.id, null);
    exported = vault.toPresentation3<any>({ id: canvas.id, type: "Canvas" });
    expect(exported.seeAlso).toEqual([{ id: "https://example.org/description.json", type: "Dataset", format: "application/json" }]);
  });

  test("reimporting an exported canvas retains its baked waveform", () => {
    const { vault, canvas } = fixture();
    saveBakedWaveform(vault, canvas.id, peaks);
    const exported = vault.toPresentation3<any>({ id: canvas.id, type: "Canvas" });
    const reopened = new Vault();
    reopened.loadSync(canvas.id, exported);
    expect(getBakedWaveform(reopened, reopened.get(canvas as any))).toMatchObject({id: exported.seeAlso[0].id, value: peaks});
  });
});

describe("browser waveform generation", () => {
  test("records actual min/max samples in timeline order and includes both channels", async () => {
    const channelA = Float32Array.from([-1, .2, -.25, .5]);
    const channelB = Float32Array.from([.1, .7, -.1, 1]);
    const progress: number[] = [];
    const result = await bakeDecodedAudio({ sampleRate: 8000, length: 4, numberOfChannels: 2,
      getChannelData: (index) => index === 0 ? channelA : channelB,
    }, new AbortController().signal, (value) => progress.push(value));
    expect(result.data).toEqual([-32768, 3277, 0, 22937, -8192, 0, 0, 32767]);
    expect(result.length).toBe(4);
    expect(result.samples_per_pixel).toBe(1);
    expect(progress.at(-1)).toBe(1);
    expect(progress).toEqual([...progress].sort((a, b) => a - b));
  });

  test("cancelling invalidates late progress/results; a new run invalidates the old one", () => {
    const job = createWaveformBakeJob();
    const first = job.start();
    expect(first.isCurrent()).toBe(true);
    const second = job.start();
    expect(first.signal.aborted).toBe(true);
    expect(first.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(true);
    job.cancel();
    expect(second.isCurrent()).toBe(false);
    expect(second.signal.aborted).toBe(true);
  });

  test("stops peak generation when cancelled before a subsequent chunk", async () => {
    const controller = new AbortController();
    await expect(bakeDecodedAudio({ sampleRate: 8000, length: 32, numberOfChannels: 1,
      getChannelData: () => new Float32Array(32),
    }, controller.signal, () => controller.abort())).rejects.toThrow();
  });

  test("rejects long recordings before downloading", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch");
    try {
      await expect(generateBakedWaveform("https://example.org/audio.mp3", {
        signal: new AbortController().signal, duration: 3000, onProgress: () => {},
      })).rejects.toThrow("45 minutes");
      expect(fetcher).not.toHaveBeenCalled();
    } finally { fetcher.mockRestore(); }
  });
});
