import { LazyLoadComponent } from "react-lazy-load-image-component";
import { useThumbnail } from "react-iiif-vault";
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
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnail = useThumbnail({ height: 256, width: 256 }, true);

  useEffect(() => {
    setIsLoaded(false);
  }, [thumbnail?.id]);

  useLayoutEffect(() => {
    if (img.current) {
      if (img.current.complete || img.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, [thumbnail?.id]);

  return (
    <div className={`w-full h-full relative`}>
      <img
        onLoad={() => setIsLoaded(true)}
        ref={img}
        src={thumbnail?.id}
        alt=""
        className={`w-full h-full object-contain ${isLoaded ? "animate-fadeIn" : "opacity-0"}`}
      />
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-me-gray-100 text-2xl animate-fadeIn">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}
