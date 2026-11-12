import { Vault } from "@iiif/helpers/vault";
import { afterEach, expect, test, vi } from "vitest";
import { accompanyingImageCanvas } from "./audio-slide";
import { getCanvasSound, saveBakedWaveform } from "./audio-waveform-baking";
import { probeAudioDuration, replaceAudioRecording } from "./audio-recording";

test("replacing a recording retains artwork, text and target, and clears stale generated peaks", () => {
  const vault = new Vault();
  const id = "https://example.org/canvas";
  vault.loadSync(id, {
    id,
    type: "Canvas",
    label: { en: ["Interview"] },
    duration: 30,
    accompanyingCanvas: accompanyingImageCanvas(id, "https://example.org/art.jpg"),
    items: [
      {
        id: `${id}/page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${id}/annotation`,
            type: "Annotation",
            motivation: "painting",
            target: id,
            body: { id: "https://example.org/old.mp3", type: "Sound", duration: 30 },
          },
        ],
      },
    ],
  } as any);
  saveBakedWaveform(vault, id, {
    version: 2,
    bits: 16,
    channels: 1,
    sample_rate: 8000,
    samples_per_pixel: 8000,
    length: 1,
    data: [-1, 1],
  });
  replaceAudioRecording(vault, id, "https://example.org/new.ogg", 75);
  const canvas = vault.get({ id, type: "Canvas" });
  expect(getCanvasSound(vault, canvas)).toMatchObject({
    id: "https://example.org/new.ogg",
    format: "audio/ogg",
    duration: 75,
  });
  const output = vault.toPresentation3<any>({ id, type: "Canvas" });
  expect(output.label).toEqual({ en: ["Interview"] });
  expect(output.duration).toBe(75);
  expect(output.accompanyingCanvas.items[0].items[0].body.id).toBe("https://example.org/art.jpg");
  expect(output.items[0].items[0].target).toBe(id);
  expect(output.seeAlso || []).toHaveLength(0);
  expect(() => replaceAudioRecording(vault, id, "javascript:alert(1)", 75)).toThrow("HTTP");
  expect(getCanvasSound(vault, canvas).id).toBe("https://example.org/new.ogg", 75);
});

test("replacing a selected Sound source keeps its normalized time selector", () => {
  const vault = new Vault();
  const id = "https://example.org/selected";
  vault.loadSync(id, {
    id,
    type: "Canvas",
    duration: 5,
    items: [
      {
        id: `${id}/page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${id}/annotation`,
            type: "Annotation",
            motivation: "painting",
            target: id,
            body: {
              type: "SpecificResource",
              source: { id: "https://example.org/old.mp3", type: "Sound", duration: 30 },
              selector: { type: "FragmentSelector", value: "t=5,10" },
            },
          },
        ],
      },
    ],
  } as any);
  replaceAudioRecording(vault, id, "https://example.org/new.mp3", 60);
  const output = vault.toPresentation3<any>({ id, type: "Canvas" });
  expect(vault.get({ id: `${id}/annotation`, type: "Annotation" }).body[0]).toMatchObject({
    type: "SpecificResource",
    source: { id: "https://example.org/new.mp3", type: "ContentResource" },
    selector: { type: "FragmentSelector", value: "t=5,10" },
  });
  expect(output.duration).toBe(5);
  expect(output.items[0].items[0].body.id).toBe("https://example.org/new.mp3#t=5,10");
});

test("replacement clears all authored waveform links but keeps descriptive resources", () => {
  const vault = new Vault();
  const id = "https://example.org/linked";
  const links = [
    { id: "https://example.org/old.peaks.json", type: "Dataset", format: "application/json" },
    { id: "https://example.org/samples", type: "Dataset", profile: "https://example.org/waveform" },
    { id: "https://example.org/catalog.json", type: "Dataset", format: "application/json" },
  ];
  vault.loadSync(id, {
    id,
    type: "Canvas",
    duration: 30,
    seeAlso: links,
    rendering: links,
    items: [
      {
        id: id + "/p",
        type: "AnnotationPage",
        items: [
          {
            id: id + "/a",
            type: "Annotation",
            motivation: "painting",
            target: id,
            body: { id: "https://example.org/old.mp3", type: "Sound", seeAlso: links, rendering: links },
          },
        ],
      },
    ],
  } as any);
  expect(() => replaceAudioRecording(vault, id, "https://example.org/new.mp3", 0)).toThrow("finite duration");
  expect(vault.get({ id, type: "Canvas" }).duration).toBe(30);
  replaceAudioRecording(vault, id, "https://example.org/new.mp3", 60);
  const output = vault.toPresentation3<any>({ id, type: "Canvas" });
  for (const resource of [output, output.items[0].items[0].body]) {
    expect(resource.seeAlso.map((item: any) => item.id)).toEqual([links[2]!.id]);
    expect(resource.rendering.map((item: any) => item.id)).toEqual([links[2]!.id]);
  }
  expect(output.duration).toBe(60);
});

afterEach(() => vi.unstubAllGlobals());

test("duration probing resolves before replacement and cancellation releases the media element", async () => {
  const elements: any[] = [];
  vi.stubGlobal(
    "Audio",
    class {
      duration = 91;
      removeAttribute = vi.fn();
      load = vi.fn();
      constructor() {
        elements.push(this);
      }
    }
  );
  const pending = probeAudioDuration("https://example.org/new.mp3", new AbortController().signal);
  const audio = elements[0];
  audio.onloadedmetadata();
  expect(await pending).toBe(91);
  expect(audio.removeAttribute).toHaveBeenCalledWith("src");
  expect(audio.onloadedmetadata).toBeNull();
  const controller = new AbortController();
  const cancelled = probeAudioDuration("https://example.org/other.mp3", controller.signal);
  controller.abort();
  await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
  expect(elements[1].onloadedmetadata).toBeNull();
});
