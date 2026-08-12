import { type BoxSelector, createThumbnailHelper, type FixedSizeImage, type TemporalBoxSelector } from "@iiif/helpers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCanvas, useRenderingStrategy, useThumbnail, useVault } from "react-iiif-vault/presentation-4";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { twMerge } from "tailwind-merge";
import { TextIcon } from "./icons/TextIcon";
import { Spinner } from "./Spinner";

export interface ThumbnailRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function LazyThumbnail({
  cover,
  fade = true,
  region,
  singleImage,
}: {
  cover?: boolean;
  fade?: boolean;
  region?: ThumbnailRegion;
  singleImage?: boolean;
}) {
  return (
    <LazyLoadComponent>
      <ErrorBoundary fallback={<div />}>
        <LazyThumbnailOuter cover={cover} fade={fade} region={region} singleImage={singleImage} />
      </ErrorBoundary>
    </LazyLoadComponent>
  );
}

const renderCache = new Map<string, string>();

export function getImageApiRegion(resource: any) {
  const selector = resource?.selector;
  if (
    selector &&
    (selector.type === "iiif:ImageApiSelector" || selector.type === "ImageApiSelector") &&
    isValidImageApiRegion(selector.region)
  ) {
    return selector.region;
  }
  return null;
}

export function getImageApiRotation(resource: any) {
  const selector = resource?.selector;
  if (!selector || (selector.type !== "iiif:ImageApiSelector" && selector.type !== "ImageApiSelector")) {
    return null;
  }
  const rotation = String(selector.rotation ?? "");
  const angle = Number(rotation.replace(/^!/, ""));
  return rotation && Number.isFinite(angle) ? rotation : null;
}

function isValidImageApiRegion(region: unknown) {
  if (typeof region !== "string") return false;
  const value = region.startsWith("pct:") ? region.slice(4) : region;
  const parts = value.split(",").map(Number);
  return (
    parts.length === 4 &&
    parts.every(Number.isFinite) &&
    parts[0]! >= 0 &&
    parts[1]! >= 0 &&
    parts[2]! > 0 &&
    parts[3]! > 0
  );
}

export function shouldUseComplexCanvasThumbnail(
  strategy: any,
  resolveBody: (body: any) => any = (body) => body,
  region?: ThumbnailRegion,
) {
  if (strategy.type !== "images") return false;
  if (strategy.images.length > 1 || region) return true;

  return strategy.images.some((image: any) => {
    const body = firstBody(image.annotation?.body);
    const resource = resolveBody(body);

    return [resource, body].some((candidate) => {
      const selector = candidate?.selector;
      const rotation = Number(selector?.rotation);

      return (
        getImageApiRegion(candidate) !== null ||
        ((selector?.type === "iiif:ImageApiSelector" || selector?.type === "ImageApiSelector") &&
          Number.isFinite(rotation) &&
          rotation !== 0)
      );
    });
  });
}

export function imageUrlWithTransform(id: string, region: string | null, rotation: string | null) {
  const parts = id.split("/");
  if (parts.length < 4) return id;

  if (region) {
    parts[parts.length - 4] = region;
  }
  parts[parts.length - 3] = "256,";
  if (rotation) {
    parts[parts.length - 2] = rotation;
  }

  return parts.join("/");
}

export function imageUrlWithRegion(id: string, region: string | null) {
  return imageUrlWithTransform(id, region, null);
}

function LazyThumbnailOuter({
  cover,
  fade = true,
  region,
  singleImage,
}: {
  cover?: boolean;
  fade?: boolean;
  region?: ThumbnailRegion;
  singleImage?: boolean;
}) {
  const [strategy] = useRenderingStrategy();
  const vault = useVault();
  const useComplexThumbnail = shouldUseComplexCanvasThumbnail(
    strategy,
    (body) => (body?.id ? vault.get(body, { skipSelfReturn: false } as any) : body) || body,
    region,
  );

  if (useComplexThumbnail) {
    return <ComplexCanvasThumbnail cover={cover} fade={fade} region={region} singleImage={singleImage} />;
  }

  if (strategy.type === "textual-content") {
    return (
      <div className="text-black/60 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0">
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

  // If the vault has a fresher URL than what we cached, invalidate the cache so
  // the new image loads with a proper loading state instead of silently swapping.
  useEffect(() => {
    if (!thumbnailId || !canvas?.id) return;
    const cached = renderCache.get(canvas.id);
    if (cached && cached !== thumbnailId) {
      renderCache.delete(canvas.id);
      setIsLoading(true);
    }
  }, [thumbnailId, canvas?.id]);

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
          className={`select-none w-full h-full ${cover ? "object-cover" : "object-contain"} ${!isLoading ? (isCached ? "" : "animate-fadeIn") : "opacity-0"}`}
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
      <div className="text-black/60 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0">
        <TextIcon className="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="text-black/60 flex items-center justify-center h-full bg-me-gray-100 animate-fadeInDelayed absolute inset-0">
      No thumbnail
    </div>
  );
}

export function getRegionIntersection(a: ThumbnailRegion, b: ThumbnailRegion): ThumbnailRegion | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (right <= x || bottom <= y) {
    return null;
  }

  return { x, y, width: right - x, height: bottom - y };
}

function thumbnailRegionKey(region?: ThumbnailRegion) {
  return region ? `${region.x},${region.y},${region.width},${region.height}` : "";
}

function firstBody(body: any) {
  return Array.isArray(body) ? body[0] : body;
}

function ComplexCanvasThumbnail({
  cover,
  fade = true,
  region,
  singleImage,
}: {
  cover?: boolean;
  fade?: boolean;
  region?: ThumbnailRegion;
  singleImage?: boolean;
}) {
  const canvas = useCanvas();
  const [strategy] = useRenderingStrategy();
  const vault = useVault();
  const helper = useMemo(() => {
    return createThumbnailHelper(vault);
  }, [vault]);
  const [state, setState] = useState<{
    canvasId: string | null;
    regionKey: string;
    region: ThumbnailRegion | null;
    imagesToRender: { image: FixedSizeImage; target: BoxSelector | TemporalBoxSelector }[];
  }>({
    canvasId: null,
    regionKey: "",
    region: null,
    imagesToRender: [],
  });
  const regionKey = thumbnailRegionKey(region);
  const stateKey = `${regionKey}/${singleImage ? "single" : "all"}`;

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      if (
        !canvas ||
        strategy.type !== "images" ||
        !shouldUseComplexCanvasThumbnail(
          strategy,
          (body) => (body?.id ? vault.get(body, { skipSelfReturn: false } as any) : body) || body,
          region,
        )
      ) {
        return;
      }

      const imageEntries = strategy.images.map((image) => {
        const target = image.target || {
          spatial: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        };
        return { image, target };
      });
      const matchingEntries = region
        ? imageEntries.filter((entry) => getRegionIntersection(region, entry.target.spatial))
        : imageEntries;
      const renderRegion = region || null;
      const entriesToRender = region
        ? singleImage
          ? (matchingEntries.length ? matchingEntries : imageEntries).slice(0, 1)
          : matchingEntries
        : imageEntries;
      const imagesToRender: { image: FixedSizeImage; target: BoxSelector | TemporalBoxSelector }[] = [];

      for (const { image, target } of entriesToRender) {
        const bodyRef = firstBody(image.annotation.body);
        const resource = bodyRef ? vault.get(bodyRef, { skipSelfReturn: false } as any) || bodyRef : image.annotation;
        const imageApiRegion = getImageApiRegion(resource) || getImageApiRegion(bodyRef);
        const imageApiRotation = getImageApiRotation(resource) || getImageApiRotation(bodyRef);
        await helper
          .getBestThumbnailAtSize(resource, {
            width: 256,
            height: 256,
            maxWidth: 768,
            maxHeight: 768,
            unsafeImageService: true,
            allowUnsafe: true,
            returnAllOptions: true,
          })
          .then((thumbnail) => {
            if (abort.signal.aborted) return;
            if (thumbnail.best?.type === "fixed") {
              imagesToRender.push({
                image: {
                  ...thumbnail.best,
                  id: imageUrlWithTransform(thumbnail.best.id, imageApiRegion, imageApiRotation),
                },
                target,
              });
            }
          })
          .catch(() => undefined);

        if (abort.signal.aborted) return;
        if (renderRegion && singleImage && imagesToRender.length) break;
      }

      setState({
        canvasId: canvas.id,
        regionKey: stateKey,
        region: renderRegion,
        imagesToRender,
      });
    })().catch((err) => {
      if (!abort.signal.aborted && canvas?.id) {
        setState({
          canvasId: canvas.id,
          regionKey: stateKey,
          region: null,
          imagesToRender: [],
        });
      }
    });

    return () => {
      abort.abort();
    };
  }, [strategy, helper, stateKey, canvas]);

  if (!state || !canvas || state.canvasId !== canvas?.id || state.regionKey !== stateKey) {
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
        className="relative overflow-hidden max-h-full max-w-full"
        style={{
          aspectRatio: `${(state.region?.width || canvas.width) / (state.region?.height || canvas.height)}`,
          width: (state.region?.width || canvas.width) >= (state.region?.height || canvas.height) ? "100%" : "auto",
          height: (state.region?.width || canvas.width) >= (state.region?.height || canvas.height) ? "auto" : "100%",
        }}
      >
        {state.imagesToRender.length ? (
          state.imagesToRender.map((image) => {
            return (
              <div
                className="absolute"
                key={image.image.id}
                style={{
                  width: `${(image.target.spatial.width / (state.region?.width || canvas.width)) * 100}%`,
                  height: `${(image.target.spatial.height / (state.region?.height || canvas.height)) * 100}%`,
                  top: `${((image.target.spatial.y - (state.region?.y || 0)) / (state.region?.height || canvas.height)) * 100}%`,
                  left: `${((image.target.spatial.x - (state.region?.x || 0)) / (state.region?.width || canvas.width)) * 100}%`,
                }}
              >
                <img className="w-full h-full object-cover select-none" src={image.image.id} />
              </div>
            );
          })
        ) : (
          <ThumbnailFallback />
        )}
      </div>
    </div>
  );
}
