import { type CreatorFunctionContext, defineCreator } from "@manifest-editor/creator-api";
import { audioAnnotation, type CreateAudioAnnotationPayload } from "@manifest-editor/creators";
import { useEffect, useRef, useState } from "react";
import { accompanyingImageCanvas, audioFormat, withAudioSlideDefaults } from "../audio-slide";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@exhibitions/audio-creator": typeof audioSlideCreator;
    }
  }
}

export const audioSlideCreator = defineCreator({
  ...audioAnnotation,
  id: "@exhibitions/audio-creator",
  label: "Audio with image",
  labelMessage: undefined,
  summary: "Add an audio slide from a direct audio-file link, with optional accompanying artwork.",
  summaryMessage: undefined,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "width", "height", "duration", "items", "accompanyingCanvas"],
  additionalTypes: [],
  staticFields: { type: "Canvas" },
  initialEditor: "@exhibition/audio",
  tags: ["audio", "exhibition-slide", "exhibition-slideshow-slide", "exhibition-scroll-section"],
  supports: { initialData: true, parentTypes: ["Manifest"], parentFields: ["items"] },
  render: (ctx) => <AudioSlideForm {...ctx} />,
  create: createAudioSlide,
});

function AudioSlideForm(ctx: Parameters<NonNullable<typeof audioAnnotation.render>>[0]) {
  const [artwork, setArtwork] = useState(ctx.options.initialData?.artwork || "");
  const artworkValue = useRef(artwork);
  const [artworkDimensions, setArtworkDimensions] = useState<{ width: number; height: number } | null>(null);
  const [artworkWarning, setArtworkWarning] = useState("");
  useEffect(() => {
    setArtworkDimensions(null);
    setArtworkWarning("");
    if (!artwork) return;
    let active = true;
    const image = new Image();
    image.src = artwork;
    image
      .decode()
      .then(() => {
        if (active) setArtworkDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      })
      .catch(() => {
        if (active)
          setArtworkWarning(
            "The image could not be previewed. You can still add this slide and change its artwork in Sound settings."
          );
      });
    return () => {
      active = false;
    };
  }, [artwork]);
  return (
    <>
      <div className="px-5 pt-5">
        <label htmlFor="audio-artwork-url" className="block text-sm font-semibold">
          Accompanying image URL (optional)
        </label>
        <input
          id="audio-artwork-url"
          type="url"
          className="mt-2 w-full rounded border p-2"
          value={artwork}
          onChange={(event) => {
            artworkValue.current = event.target.value;
            setArtwork(event.target.value);
          }}
        />
        {artworkWarning ? (
          <output className="mt-2 block text-sm text-amber-800">
            {artworkWarning}
          </output>
        ) : null}
      </div>
      {audioAnnotation.render!({
        ...ctx,
        runCreate: (payload: CreateAudioAnnotationPayload) =>
          ctx.runCreate({
            ...payload,
            artwork: artworkValue.current,
            artworkWidth: artworkDimensions?.width,
            artworkHeight: artworkDimensions?.height,
          } as any),
      })}
    </>
  );
}

export function createAudioSlide(
  data: CreateAudioAnnotationPayload & {
    artwork?: string;
    artworkWidth?: number;
    artworkHeight?: number;
    behavior?: string[];
  },
  ctx: CreatorFunctionContext
) {
  const id = ctx.generateId("Canvas");
  const accompanyingCanvas = data.artwork
    ? accompanyingImageCanvas(id, data.artwork, data.artworkWidth, data.artworkHeight)
    : undefined;
  return ctx.embed({
    id,
    type: "Canvas",
    label: data.label || { en: ["Audio slide"] },
    width: 1920,
    height: 1080,
    duration: data.duration || 0,
    behavior: withAudioSlideDefaults(data.behavior || ctx.options.initialData?.audioSlideBehavior),
    ...(accompanyingCanvas ? { accompanyingCanvas } : {}),
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
              id: data.url,
              type: "Sound",
              ...(audioFormat(data.url) ? { format: audioFormat(data.url) } : {}),
              duration: data.duration || 0,
            },
          },
        ],
      },
    ],
  });
}
