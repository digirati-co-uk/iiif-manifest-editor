import {
  CanvasContext,
  useManifest,
  useSimpleViewer,
  useThumbnail
} from "react-iiif-vault";

import { ThumbnailContainer } from "../atoms/ThumbnailContainer";
import { ThumbnailImg } from "../atoms/Thumbnail";

const Thumbnail: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const thumb = useThumbnail({
    maxHeight: 300,
    maxWidth: 300
  });

  if (!thumb) {
    return null;
  }

  return (
    <ThumbnailImg src={thumb.id} alt="" loading="lazy" onClick={onClick} />
  );
};
// The CanvasContext currently only lets you select every second canvas. Once the
// SimpleViewerProvider && SimpleViewerContext from react-iiif-vault
// get updated with the latest code they will accept a prop pagingView={false}

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
