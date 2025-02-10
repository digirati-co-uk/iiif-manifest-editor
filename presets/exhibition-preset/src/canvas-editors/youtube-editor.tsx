import { ActionButton, LazyThumbnail } from "@manifest-editor/components";
import {
  type CanvasEditorDefinition,
  useGenericEditor,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useRef } from "react";
import {
  LocaleString,
  type MediaStrategy,
  type SingleYouTubeVideo,
  useCanvas,
  useVaultSelector,
} from "react-iiif-vault";
import invariant from "tiny-invariant";

export const youtubeMainEdtior: CanvasEditorDefinition = {
  id: "youtube-main-editor",
  label: "YouTube main editor",
  component: (strategy) =>
    strategy.type === "media" ? (
      <YouTubeEditor
        strategy={strategy as MediaStrategy}
        video={strategy.media as SingleYouTubeVideo}
      />
    ) : null,
  supports: {
    strategy: (strategy, resource, vault) => {
      console.log(strategy);
      if (strategy.type !== "media") {
        return false;
      }

      if (strategy.media.type !== "VideoYouTube") {
        return false;
      }

      return true;
    },
  },
};

export function YouTubeEditor({
  strategy,
  video,
}: { strategy: MediaStrategy; video: SingleYouTubeVideo }) {
  const { edit } = useLayoutActions();
  const canvas = useCanvas();
  const annotationRef = useVaultSelector((_, v) => {
    const page = v.get(canvas?.items[0]!);
    return page.items[0]!;
  });
  invariant(canvas && annotationRef);
  const player = useRef<HTMLIFrameElement>(null);
  const annotation = useGenericEditor(annotationRef);
  const media = video;

  const ar = (canvas.width || 1) / (canvas.height || 1);
  const ytThumbnail = `https://img.youtube.com/vi/${media.youTubeId}/0.jpg`;

  return (
    <div className="overflow-y-auto">
      <div className="p-8">
        <div
          className="bg-black z-20 flex p-8 rounded-lg max-w-full max-h-[70vh] mx-auto"
          style={{ aspectRatio: ar }}
        >
          <iframe
            title="YouTube video"
            className="border-none w-full h-full object-contain"
            ref={player}
            src={`https://www.youtube.com/embed/${media.youTubeId}?enablejsapi=1&origin=${window.location.host}`}
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
      </div>

      <div className="bg-white shadow w-full p-8 flex gap-8">
        <div>
          <div
            className="w-64 bg-black flex-shrink-0 flex items-center justify-center rounded overflow-clip"
            style={{ aspectRatio: ar }}
          >
            {canvas.thumbnail?.length ? (
              <LazyThumbnail cover />
            ) : (
              <div className="text-white/50 text-center py-16">
                No thumbnail
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <LocaleString
            as="h3"
            className="text-2xl font-bold mt-4"
            defaultText={
              (<span className="text-black/30">No Label</span>) as any
            }
          >
            {annotation.descriptive.label.get()}
          </LocaleString>
          <LocaleString
            as="p"
            className="mt-2 mb-8"
            defaultText={
              (<span className="text-black/30">No summary</span>) as any
            }
          >
            {annotation.descriptive.summary.get()}
          </LocaleString>
          <ActionButton onPress={() => edit(annotation.ref())}>
            Edit properties
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
