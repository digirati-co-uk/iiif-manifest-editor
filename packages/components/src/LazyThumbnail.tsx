import { LazyLoadComponent } from "react-lazy-load-image-component";
import { useCanvas, useThumbnail } from "react-iiif-vault";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spinner } from "./Spinner";
import { twMerge } from "tailwind-merge";

export function LazyThumbnail({ cover, fade = true }: { cover?: boolean; fade?: boolean }) {
  return (
    <LazyLoadComponent>
      <LazyThumbnailInner cover={cover} fade={fade} />
    </LazyLoadComponent>
  );
}

const renderCache = new Map<string, string>();

function LazyThumbnailInner({ cover, fade = true }: { cover?: boolean; fade?: boolean }) {
  const img = useRef<HTMLImageElement>(null);
  const canvas = useCanvas();
  const isCached = canvas ? !!renderCache.get(canvas?.id) : false;
  const [isLoading, setIsLoading] = useState(!isCached);
  const thumbnail = useThumbnail({ height: 256, width: 256 }, true);
  let thumbnailId = thumbnail?.id;

  if (canvas?.id && thumbnailId) {
    renderCache.set(canvas.id, thumbnailId);
  } else if (canvas?.id && renderCache.get(canvas.id)) {
    thumbnailId = renderCache.get(canvas?.id);
  }

  useEffect(() => {
    if (thumbnail?.id && !isCached) {
      setIsLoading(true);
    }
  }, [thumbnailId]);

  const checkImage = useCallback((node: HTMLImageElement) => {
    if (node && !isCached) {
      if (node.complete || node.naturalWidth > 0) {
        setIsLoading(false);
      }
    }
  }, []);

  return (
    <div className={`w-full h-full relative`}>
      {thumbnail?.id ? (
        <img
          onLoad={() => setIsLoading(false)}
          ref={checkImage}
          src={thumbnail?.id}
          alt=""
          className={`w-full h-full ${cover ? "object-cover" : "object-contain"} ${!isLoading ? (isCached ? "" : "animate-fadeIn") : "opacity-0"}`}
        />
      ) : (
        <div className="text-black/30 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0 z-20">
          No thumbnail
        </div>
      )}
      {!thumbnail?.id || isLoading ? (
        <div
          className={twMerge(
            "absolute inset-0 flex items-center justify-center bg-me-gray-100 text-2xl z-10",
            fade && "animate-fadeIn"
          )}
        >
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}
