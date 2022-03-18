import { useContext } from "react";
import { CanvasContext, useManifest, useSimpleViewer } from "react-iiif-vault";
import styled from "styled-components";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import { Thumbnail } from "../atoms/Thumbnail";
import { ThumbnailGrid } from "../atoms/ThumbnailContainer";
import { ViewSelector } from "../atoms/ViewSelector";

const GridViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justiy-content: space-between;
  align-items: center;
  height: 80vh;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    height: unset;
    min-height: 50vh;
  } ;
`;

export const GridView: React.FC = () => {
  const manifest = useManifest();
  const { setCurrentCanvasId } = useSimpleViewer();
  const editorContext = useContext(ManifestEditorContext);

  const handleChange = (itemId: string) => {
    setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty("canvas");
  };

  return (
    <GridViewContainer>
      <ThumbnailGrid>
        {manifest?.items.map((item: any) => {
          return (
            <CanvasContext key={item.id} canvas={item.id}>
              <Thumbnail onClick={() => handleChange(item.id)} />
            </CanvasContext>
          );
        })}
      </ThumbnailGrid>
      <ViewSelector />
    </GridViewContainer>
  );
};
