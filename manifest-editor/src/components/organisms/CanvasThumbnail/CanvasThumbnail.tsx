import { useThumbnail } from "react-iiif-vault";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { ThumbnailImage, ThumbnailPlaceholder } from "../ThumbnailPagedList/ThumbnailPageList.styles";
import { memo } from "react";

export const CanvasThumbnail = memo(function CanvasThumbnail({
  size = 128,
  onClick,
}: {
  size?: number;
  onClick?: () => void;
}) {
  return (
    <LazyLoadComponent threshold={800} placeholder={<ThumbnailPlaceholder />}>
      <Inner size={size} onClick={onClick} />
    </LazyLoadComponent>
  );
});

function Inner({ size, onClick }: { size: number; onClick?: () => void }) {
  const thumbnail = useThumbnail(
    {
      width: size,
      height: size,

      maxWidth: size * 2,
      maxHeight: size * 2,

      unsafeImageService: true,
      atAnyCost: true,
      returnAllOptions: true,
    },
    true
  );

  if (!thumbnail) {
    return <ThumbnailPlaceholder />;
  }

  if (thumbnail.type === "fixed" && thumbnail.unsafe && thumbnail.width > size * 2) {
    return <ThumbnailPlaceholder />;
  }

  return <ThumbnailImage threshold={800} src={thumbnail.id} onClick={onClick} />;
}
