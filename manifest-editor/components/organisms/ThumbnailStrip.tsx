import { CanvasContext, useManifest, useSimpleViewer } from "react-iiif-vault";

import { ThumbnailContainer } from "../atoms/ThumbnailContainer";
import { Thumbnail } from "../atoms/Thumbnail";
import { useContext } from "react";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import { FlexContainerColumn } from "../layout/FlexContainer";
import { ViewSelector } from "../atoms/ViewSelector";

// The CanvasContext currently only lets you select every second canvas. Once the
// SimpleViewerProvider && SimpleViewerContext from react-iiif-vault
// get updated with the latest code they will accept a prop pagingView={false}

export const ThumbnailStrip: React.FC = () => {
  const manifest = useManifest();
  const { setCurrentCanvasId } = useSimpleViewer();
  const editorContext = useContext(ManifestEditorContext);

  const handleChange = (itemId: string) => {
    setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty(itemId);
  };

  return (
    <FlexContainerColumn style={{ alignItems: "center" }} justify="space-between">
      <ThumbnailContainer>
        {manifest?.items.map((item: any) => {
          return (
            <CanvasContext key={item.id} canvas={item.id}>
              <Thumbnail onClick={() => handleChange(item.id)} />
            </CanvasContext>
          );
        })}
      </ThumbnailContainer>
      <ViewSelector />
    </FlexContainerColumn>
  );
};
