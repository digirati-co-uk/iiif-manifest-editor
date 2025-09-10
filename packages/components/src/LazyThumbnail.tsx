import { createThumbnailHelper } from "@iiif/helpers";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCanvas, useRenderingStrategy, useStrategy, useThumbnail, useVault } from "react-iiif-vault";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { twMerge } from "tailwind-merge";
import { TextIcon } from "./icons/TextIcon";
import { Spinner } from "./Spinner";

export function LazyThumbnail({ cover, fade = true }: { cover?: boolean; fade?: boolean }) {
  return (
    <LazyLoadComponent>
      <LazyThumbnailOuter cover={cover} fade={fade} />
    </LazyLoadComponent>
  );
}

const renderCache = new Map<string, string>();

function LazyThumbnailOuter({ cover, fade = true }: { cover?: boolean; fade?: boolean }) {
  const [strategy] = useRenderingStrategy();

  if (strategy.type === "images" && strategy.images.length > 1) {
    return <ComplexCanvasThumbnail cover={cover} fade={fade} />;
  }

  if (strategy.type === "textual-content") {
    return (
      <div className="text-black/30 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0">
        <TextIcon className="w-16 h-16" />
      </div>
    );
  }

  return <LazyThumbnailInner cover={cover} fade={fade} />;
}

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
    if (thumbnailId && !isCached) {
      setIsLoading(true);
    }
  }, [thumbnailId, isCached]);

  const checkImage = useCallback(
    (node: HTMLImageElement) => {
      if (node && !isCached) {
        if (node.complete || node.naturalWidth > 0) {
          setIsLoading(false);
        }
      }
    },
    [isCached],
  );

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
        <ThumbnailFallback />
      )}
      {!thumbnail?.id || isLoading ? (
        <div
          className={twMerge(
            "absolute inset-0 flex items-center justify-center bg-me-gray-100 text-2xl z-10",
            fade && "animate-fadeIn",
          )}
        >
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}

function ThumbnailFallback() {
  const [strategy] = useRenderingStrategy();

  if (strategy.type === "textual-content") {
    return (
      <div className="text-black/30 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0">
        <TextIcon className="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="text-black/30 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0">
      No thumbnail
    </div>
  );
}

function ComplexCanvasThumbnail({ cover, fade = true }: { cover?: boolean; fade?: boolean }) {
  const canvas = useCanvas();
  const [strategy] = useRenderingStrategy();
  const vault = useVault();
  const helper = useMemo(() => {
    return createThumbnailHelper(vault);
  }, [vault]);
  const [state, setState] = useState<any>({});

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      if (!canvas || strategy.type !== "images" || strategy.images.length <= 1) {
        return;
      }

      const imagesToRender: any[] = [];
      for (const image of strategy.images) {
        await helper
          .getBestThumbnailAtSize(image.annotation, {
            width: 256,
            height: 256,
          })
          .then((thumbnail) => {
            if (abort.signal.aborted) return;
            imagesToRender.push({
              image: thumbnail.best,
              target: image.target,
            });
          });

        if (abort.signal.aborted) return;

        setState({
          canvasId: canvas.id,
          imagesToRender,
        });
      }
    })().catch((err) => {
      // ignore.
    });

    return () => {
      abort.abort();
    };
  }, [strategy]);

  if (!state || !canvas || state.canvasId !== canvas?.id) {
    return (
      <div
        className={twMerge(
          "absolute inset-0 flex items-center justify-center bg-me-gray-100 text-2xl z-10",
          fade && "animate-fadeIn",
        )}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="relative overflow-hidden margin-auto w-full bg-white"
        style={{
          aspectRatio: `${canvas.width / canvas.height}`,
        }}
      >
        {state.imagesToRender.map((image: any) => {
          return (
            <div
              className="absolute"
              key={image.image.id}
              style={{
                width: `${(image.target.spatial.width / canvas.width) * 100}%`,
                height: `${(image.target.spatial.height / canvas.height) * 100}%`,
                top: `${(image.target.spatial.y / canvas.height) * 100}%`,
                left: `${(image.target.spatial.x / canvas.width) * 100}%`,
              }}
            >
              <img className="w-full h-full object-cover" src={image.image.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
