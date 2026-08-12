import type {
  FixedSizeImage,
  FixedSizeImageService,
  ImageCandidateRequest,
  UnknownSizeImage,
  VariableSizeImage,
} from "@atlas-viewer/iiif-image-api";
import { createThumbnailHelper } from "@iiif/helpers";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnnotation, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { getAnnotationThumbnailResource } from "../helpers/choice-painting-annotations";
import { constrainCroppedThumbnail, getAnnotationThumbnailCacheKey } from "./annotation-thumbnail";

const globalThumbnailCache = new Map<
  string,
  FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage
>();

export function useAnnotationThumbnail({
  annotationId: _annotationId,
  options = {},
}: {
  annotationId?: string;
  options?: Partial<ImageCandidateRequest>;
} = {}) {
  const annotation = useAnnotation(_annotationId ? { id: _annotationId } : undefined);
  const annotationId = _annotationId || annotation?.id;

  const vault = useVault();

  invariant(annotationId, "Missing annotation ID");

  const thumbnailResource = useMemo(
    () => (annotation ? getAnnotationThumbnailResource(annotation, vault) : undefined),
    [annotation, vault],
  );
  const cacheKey = getAnnotationThumbnailCacheKey(annotationId, thumbnailResource);
  const helper = useMemo(() => createThumbnailHelper(vault), [vault]);
  const [thumbnail, setThumbnail] = useState<
    FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage
  >();
  const lastAnnotation = useRef<string | undefined>(undefined);

  lastAnnotation.current = cacheKey;

  useEffect(() => {
    const last = lastAnnotation.current;

    if (!thumbnailResource || globalThumbnailCache.has(cacheKey)) {
      return;
    }

    try {
      setThumbnail(undefined);
      helper
        .getBestThumbnailAtSize(thumbnailResource, { maxWidth: 256, maxHeight: 256, allowUnsafe: true, ...options })
        .then((result) => {
          if (last === lastAnnotation.current && result.best) {
            const thumbnail = {
              ...result.best,
              id: constrainCroppedThumbnail(result.best.id),
            };
            globalThumbnailCache.set(cacheKey, thumbnail);
            setThumbnail(thumbnail);
          }
        });
    } catch (e) {
      // ignore.
    }
  }, [cacheKey, helper, thumbnailResource, vault]);

  if (globalThumbnailCache.has(cacheKey)) {
    return globalThumbnailCache.get(cacheKey);
  }

  return thumbnail;
}
