import { Vault } from "@iiif/helpers/vault";
import { canvasHasAv, getCanvasCaptionTracks } from "@manifest-editor/editor-api";
import { describe, expect, test } from "vitest";

const canvas = { id: "https://example.org/canvas", type: "Canvas" as const };
const caption = {
  id: "https://example.org/captions.vtt",
  type: "Text",
  format: "text/vtt",
  label: { en: ["English captions"] },
  language: "en",
};
async function setup(mediaType: string, annotations: any[] = []) {
  const vault = new Vault();
  await vault.load(canvas.id, {
    ...canvas,
    items: [
      {
        id: `${canvas.id}/painting-page`,
        type: "AnnotationPage",
        items: [
          {
            id: `${canvas.id}/painting`,
            type: "Annotation",
            motivation: "painting",
            target: canvas.id,
            body: { id: "https://example.org/media", type: mediaType },
          },
        ],
      },
    ],
    annotations: [{ id: `${canvas.id}/captions`, type: "AnnotationPage", items: annotations }],
  });
  return vault;
}

function annotation(id: string, body: any, motivation = "supplementing") {
  return { id: `${canvas.id}/${id}`, type: "Annotation", motivation, target: canvas.id, body };
}

describe("canvas caption tracks", () => {
  test.each(["Sound", "Video"])("recognizes %s canvases without requiring a duration", async (type) => {
    const vault = await setup(type);
    expect(canvasHasAv(vault, canvas)).toBe(true);
    expect(getCanvasCaptionTracks(vault, canvas)).toEqual([]);
  });

  test("does not treat an image canvas as AV", async () => {
    expect(canvasHasAv(await setup("Image"), canvas)).toBe(false);
  });

  test("recognizes AV media wrapped in a choice and SpecificResource", async () => {
    const vault = await setup("Image");
    await vault.load("https://example.org/choice-canvas", {
      id: "https://example.org/choice-canvas",
      type: "Canvas",
      items: [
        {
          id: "https://example.org/choice-page",
          type: "AnnotationPage",
          items: [
            {
              ...annotation(
                "choice",
                {
                  id: "https://example.org/choice",
                  type: "Choice",
                  items: [{ type: "SpecificResource", source: { id: "https://example.org/audio", type: "Sound" } }],
                },
                "painting"
              ),
              target: "https://example.org/choice-canvas",
            },
          ],
        },
      ],
    });
    expect(canvasHasAv(vault, { id: "https://example.org/choice-canvas", type: "Canvas" })).toBe(true);
  });

  test("finds existing captions while preserving the annotation and body index used for editing", async () => {
    const vault = await setup("Video", [
      annotation("caption", [
        { id: "https://example.org/transcript", type: "Text", format: "text/plain" },
        { type: "SpecificResource", source: caption },
      ]),
    ]);
    const tracks = getCanvasCaptionTracks(vault, canvas);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({
      body: caption,
      bodyIndex: 1,
      annotation: { id: `${canvas.id}/caption`, type: "Annotation" },
      page: { id: `${canvas.id}/captions`, type: "AnnotationPage" },
    });
    expect(tracks[0]!.bodyRef.type).toBe("SpecificResource");
  });

  test("handles several caption formats without treating unrelated annotations as tracks", async () => {
    const vault = await setup("Sound", [
      annotation("vtt", caption),
      annotation(
        "srt",
        { id: "https://example.org/subtitles.srt", type: "Text", format: "application/x-subrip" },
        "subtitling"
      ),
      annotation(
        "ttml",
        { id: "https://example.org/subtitles.ttml", type: "Text", format: "application/ttml+xml" },
        "captioning"
      ),
      annotation("plain", { id: "https://example.org/plain", type: "Text", format: "text/plain" }),
      annotation("comment", { ...caption, id: "https://example.org/comment.vtt" }, "commenting"),
    ]);
    expect(getCanvasCaptionTracks(vault, canvas).map((track) => track.body.format)).toEqual([
      "text/vtt",
      "application/x-subrip",
      "application/ttml+xml",
    ]);
  });
});
