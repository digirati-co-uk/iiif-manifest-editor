import { useEffect, useMemo, useRef, useState } from "react";
import { useAnnotation, useVault } from "react-iiif-vault";
import { createThumbnailHelper } from "@iiif/vault-helpers";
import {
  FixedSizeImage,
  FixedSizeImageService,
  ImageCandidateRequest,
  UnknownSizeImage,
  VariableSizeImage,
} from "@atlas-viewer/iiif-image-api";
import invariant from "tiny-invariant";

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
  const annotation = useAnnotation();
  const annotationId = _annotationId || annotation?.id;

  const vault = useVault();

  invariant(annotationId, "Missing annotation ID");

  const image = vault.get(annotationId) as any;
  const helper = useMemo(() => createThumbnailHelper(vault), [vault]);
  const [thumbnail, setThumbnail] = useState<
    FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage
  >();
  const lastAnnotation = useRef<string>();

  lastAnnotation.current = annotationId;

  useEffect(() => {
    const last = lastAnnotation.current;

    if (globalThumbnailCache.has(image)) {
      return;
    }

    try {
      helper
        .getBestThumbnailAtSize(vault.get(image), { maxWidth: 200, maxHeight: 200, allowUnsafe: true, ...options })
        .then((result) => {
          if (last === lastAnnotation.current && result.best) {
            globalThumbnailCache.set(image, result.best);
            setThumbnail(result.best);
          }
        });
    } catch (e) {
      // ignore.
    }
  }, [helper, image, vault]);

  if (globalThumbnailCache.has(image)) {
    return globalThumbnailCache.get(image);
  }

  return thumbnail;
}
