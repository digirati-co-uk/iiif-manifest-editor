import { useEffect, useMemo, useRef, useState } from "react";
import { useAnnotation, useVault } from "react-iiif-vault";
import { createThumbnailHelper } from "@iiif/helpers";
import {
  FixedSizeImage,
  FixedSizeImageService,
  ImageCandidateRequest,
  UnknownSizeImage,
  VariableSizeImage,
} from "@atlas-viewer/iiif-image-api";
import invariant from "tiny-invariant";
import { getAnnotationThumbnailResource } from "../helpers/choice-painting-annotations";

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
  const cacheKey = getThumbnailCacheKey(annotationId, thumbnailResource);
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
        .getBestThumbnailAtSize(thumbnailResource, { maxWidth: 200, maxHeight: 200, allowUnsafe: true, ...options })
        .then((result) => {
          if (last === lastAnnotation.current && result.best) {
            globalThumbnailCache.set(cacheKey, result.best);
            setThumbnail(result.best);
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

function getThumbnailCacheKey(annotationId: string, resource: any) {
  const resourceId = typeof resource === "string" ? resource : resource?.id;
  const resourceType = typeof resource === "object" ? resource?.type : undefined;
  return ["Annotation", annotationId, resourceType, resourceId].filter(Boolean).join("|");
}
