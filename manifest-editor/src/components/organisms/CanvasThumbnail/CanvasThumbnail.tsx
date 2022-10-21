import { useCanvas, useResourceContext, useThumbnail, useVault } from "react-iiif-vault";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { ThumbnailImage, ThumbnailPlaceholder } from "../ThumbnailPagedList/ThumbnailPageList.styles";
import { memo, useMemo } from "react";
import { ImageCandidateRequest } from "@atlas-viewer/iiif-image-api";

export const CanvasThumbnail = memo(function CanvasThumbnail({
  size = 128,
  fluid,
  onClick,
}: {
  size?: number;
  fluid?: boolean;
  onClick?: () => void;
}) {
  const ctx = useResourceContext();
  const vault = useVault();
  const aspectRatio = useMemo(() => {
    if (!ctx.canvas) {
      return undefined;
    }
    const c = vault.getState().iiif.entities.Canvas[ctx.canvas];
    return `${c.width}/${c.height}`;
  }, [ctx.canvas, vault]);

  return (
    <LazyLoadComponent
      threshold={800}
      placeholder={<ThumbnailPlaceholder style={{ aspectRatio }} />}
      style={{ aspectRatio }}
    >
      <Inner size={size} fluid={fluid} onClick={onClick} />
    </LazyLoadComponent>
  );
});

function useThumbnail2(request: ImageCandidateRequest, dereference?: boolean) {
  try {
    return useThumbnail(request, dereference);
  } catch (e) {
    console.log(e);
    return null;
  }
}

function Inner({ size, fluid, onClick }: { size: number; fluid?: boolean; onClick?: () => void }) {
  const canvas = useCanvas();
  const thumbnail = useThumbnail2(
    {
      width: size,
      height: size,

      maxWidth: size * 2,
      maxHeight: size * 2,

      // unsafeImageService: true,
      // atAnyCost: true,
      // returnAllOptions: true,
    },
    true
  );

  const aspectRatio = canvas ? `${canvas.width}/${canvas.height}` : undefined;

  if (!thumbnail) {
    return <ThumbnailPlaceholder style={{ aspectRatio }} />;
  }

  // if (thumbnail.type === "fixed" && thumbnail.unsafe && thumbnail.width > size * 2) {
  //   return <ThumbnailPlaceholder />;
  // }

  return <ThumbnailImage threshold={800} $fluid={fluid} src={thumbnail.id} onClick={onClick} />;
}
