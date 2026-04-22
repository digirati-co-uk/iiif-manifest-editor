import { useEffect, useMemo, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";
import { createThumbnailHelper } from "@iiif/helpers";
import {
  FixedSizeImage,
  FixedSizeImageService,
  ImageCandidateRequest,
  UnknownSizeImage,
  VariableSizeImage,
} from "@atlas-viewer/iiif-image-api";
import invariant from "tiny-invariant";
import { getContentResourceThumbnailResource } from "../helpers/choice-painting-annotations";
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

  const thumbnailResource = useMemo(
    () => (resource ? getContentResourceThumbnailResource(resource, vault) : undefined),
    [resource, vault],
  );
  const cacheKey = getThumbnailCacheKey(resourceId, thumbnailResource);
  const helper = useMemo(() => createThumbnailHelper(vault), [vault]);
  const [thumbnail, setThumbnail] = useState<
    FixedSizeImage | FixedSizeImageService | VariableSizeImage | UnknownSizeImage
  >();
  const lastAnnotation = useRef<string | undefined>(undefined);

  lastAnnotation.current = cacheKey;

  useEffect(() => {
    const last = lastAnnotation.current;

    if (!thumbnailResource) {
      return;
    }

    try {
      setThumbnail(undefined);
      helper
        .getBestThumbnailAtSize(thumbnailResource, { maxWidth: 200, maxHeight: 200, allowUnsafe: true, ...options })
        .then((result) => {
          if (last === lastAnnotation.current && result.best) {
            setThumbnail(result.best);
          }
        });
    } catch (e) {
      // ignore.
    }
  }, [cacheKey, helper, thumbnailResource, vault]);

  return thumbnail;
}

function getThumbnailCacheKey(resourceId: string, resource: any) {
  const thumbnailId = typeof resource === "string" ? resource : resource?.id;
  const thumbnailType = typeof resource === "object" ? resource?.type : undefined;
  return ["ContentResource", resourceId, thumbnailType, thumbnailId].filter(Boolean).join("|");
}
