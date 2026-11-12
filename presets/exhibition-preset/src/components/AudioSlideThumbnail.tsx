import { AudioIcon } from "@manifest-editor/components";
import { useState } from "react";
import { CanvasContext, useCanvas, useThumbnail, useVaultSelector } from "react-iiif-vault";
import { getAudioArtworkCanvas } from "../audio-artwork";

/** Static audio preview: shows artwork and a sound marker without creating a media player. */
export function AudioSlideThumbnail({ className = "" }: { className?: string }) {
  const canvas = useCanvas();
  const artwork = useVaultSelector((_, vault) => getAudioArtworkCanvas(vault, canvas), [canvas]);
  const cover = canvas?.behavior?.includes("image-cover") || canvas?.behavior?.includes("cover");
  return (
    <div
      role="img"
      aria-label="Audio slide"
      data-audio-thumbnail
      className={`relative h-full w-full overflow-hidden bg-slate-800 ${className}`}
      style={{ backgroundColor: (artwork as any)?.backgroundColor || (canvas as any)?.backgroundColor }}
    >
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-slate-300">
        <AudioIcon className="h-9 w-9" />
      </div>
      {artwork ? (
        <CanvasContext canvas={artwork.id}>
          <ArtworkThumbnail cover={!!cover} />
        </CanvasContext>
      ) : null}
      <span
        className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold leading-none text-white shadow-sm"
        aria-hidden="true"
      >
        <AudioIcon className="h-3 w-3" />
        Audio
      </span>
    </div>
  );
}

function ArtworkThumbnail({ cover }: { cover: boolean }) {
  const thumbnail = useThumbnail({ width: 320, height: 320 }, true);
  const url = thumbnail?.id;
  const [failed, setFailed] = useState<string | null>(null);
  if (!url || url === failed) return null;
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      draggable={false}
      className={`absolute inset-0 h-full w-full ${cover ? "object-cover" : "object-contain"}`}
      onError={() => setFailed(url)}
    />
  );
}
