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
import { useContentResource } from "./useContentResource";

export function useContentResourceThumbnail({
  resourceId: _resourceId,
  options = {},
}: {
  resourceId: string;
  options?: Partial<ImageCandidateRequest>;
}) {
  const resource = useContentResource({ id: _resourceId });
  const resourceId = _resourceId || resource?.id;

  const vault = useVault();

  invariant(resourceId, "Missing resource");

  const helper = useMemo(() => createThumbnailHelper(vault), [vault]);
  const [thumbnail, setThumbnail] = useState<
    FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage
  >();
  const lastAnnotation = useRef<string>();

  lastAnnotation.current = resourceId;

  useEffect(() => {
    const last = lastAnnotation.current;

    try {
      helper
        .getBestThumbnailAtSize(vault.get(resourceId), { maxWidth: 200, maxHeight: 200, allowUnsafe: true, ...options })
        .then((result) => {
          if (last === lastAnnotation.current && result.best) {
            setThumbnail(result.best);
          }
        });
    } catch (e) {
      // ignore.
    }
  }, [helper, resource, vault]);

  return thumbnail;
}
