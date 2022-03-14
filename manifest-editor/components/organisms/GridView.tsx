import { useContext } from "react";
import { CanvasContext, useManifest, useSimpleViewer } from "react-iiif-vault";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import { Thumbnail } from "../atoms/Thumbnail";
import { ThumbnailGrid } from "../atoms/ThumbnailContainer";

// The CanvasContext currently only lets you select every second canvas. Once the
// SimpleViewerProvider && SimpleViewerContext from react-iiif-vault
// get updated with the latest code they will accept a prop pagingView={false}

export const GridView: React.FC = () => {
  const manifest = useManifest();
  const { setCurrentCanvasId } = useSimpleViewer();
  const editorContext = useContext(ManifestEditorContext);

  const handleChange = (itemId: string) => {
    setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty(itemId);

  }

  return (
    <ThumbnailGrid>
      {manifest?.items.map((item: any) => {
        return (
          <CanvasContext key={item.id} canvas={item.id}>
            <Thumbnail onClick={() => handleChange(item.id)} />
          </CanvasContext>
        );
      })}
    </ThumbnailGrid>
  );
};
