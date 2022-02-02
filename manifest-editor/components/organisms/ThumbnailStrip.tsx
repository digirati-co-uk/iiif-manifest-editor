import React, { FC } from "react";
import {
  CanvasContext,
  useManifest,
  useSimpleViewer,
  useThumbnail
} from "@hyperion-framework/react-vault";

import { ThumbnailContainer } from "../atoms/ThumbnailContainer";
import { ThumbnailImg } from "../atoms/Thumbnail";

const Thumbnail: FC<{ onClick: () => void }> = ({ onClick }) => {
  const thumb = useThumbnail({
    maxHeight: 300,
    maxWidth: 300
  });

  if (!thumb) {
    return null;
  }

  return (
    <ThumbnailImg
      src={thumb.id}
      alt=""
      loading="lazy"
      onClick={onClick}
    />
  );
};

export const ThumbnailStrip: FC = () => {
  const manifest = useManifest();
  const { setCurrentCanvasId } = useSimpleViewer();

  return (
    <ThumbnailContainer>
      {manifest?.items.map((item: any) => {
        return (
          <CanvasContext key={item.id} canvas={item.id}>
            <Thumbnail onClick={() => setCurrentCanvasId(item.id)} />
          </CanvasContext>
        );
      })}
    </ThumbnailContainer>
  );
};
