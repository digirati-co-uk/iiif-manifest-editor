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
  const image = vault.get(annotationId) as any;
  const helper = useMemo(() => createThumbnailHelper(vault), [vault]);
  const [thumbnail, setThumbnail] = useState<
    FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage
  >();
  const lastAnnotation = useRef<string>();

  lastAnnotation.current = annotationId;

  useEffect(() => {
    const last = lastAnnotation.current;
    helper
      .getBestThumbnailAtSize(vault.get(image), { maxWidth: 200, maxHeight: 200, allowUnsafe: true, ...options })
      .then((result) => {
        if (last === lastAnnotation.current && result.best) {
          setThumbnail(result.best);
        }
      });
  }, [helper, image, vault]);

  return thumbnail;
}
