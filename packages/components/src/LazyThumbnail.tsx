import { LazyLoadComponent } from "react-lazy-load-image-component";
import { useCanvas, useThumbnail } from "react-iiif-vault";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spinner } from "./Spinner";

export function LazyThumbnail() {
  return (
    <LazyLoadComponent>
      <LazyThumbnailInner />
    </LazyLoadComponent>
  );
}

function LazyThumbnailInner() {
  const img = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const thumbnail = useThumbnail({ height: 256, width: 256 }, true);

  useEffect(() => {
    if (thumbnail?.id) {
      setIsLoading(true);
    }
  }, [thumbnail?.id]);

  useLayoutEffect(() => {
    if (img.current) {
      if (img.current.complete || img.current.naturalWidth > 0) {
        setIsLoading(false);
      }
    }
  }, [thumbnail?.id]);

  return (
    <div className={`w-full h-full relative`}>
      {thumbnail?.id ? (
        <img
          onLoad={() => setIsLoading(false)}
          ref={img}
          src={thumbnail?.id}
          alt=""
          className={`w-full h-full object-contain ${!isLoading ? "animate-fadeIn" : "opacity-0"}`}
        />
      ) : (
        <div className="text-black/30 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0 z-20">
          No thumbnail
        </div>
      )}
      {!thumbnail?.id || isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-me-gray-100 text-2xl animate-fadeIn z-10">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}
