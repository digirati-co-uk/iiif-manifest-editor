import { getValue } from "@iiif/vault-helpers";
import { useContext } from "react";
import {
  CanvasContext,
  useCanvas,
  useManifest,
  useSimpleViewer,
} from "react-iiif-vault";
import styled from "styled-components";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import { Thumbnail } from "../atoms/Thumbnail";
import { ThumbnailGrid } from "../atoms/ThumbnailContainer";
import { ViewSelector } from "../atoms/ViewSelector";
import { FlexContainerColumn } from "../layout/FlexContainer";

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

const ThumnbnailLabel = styled.small`
  white-space: nowrap;
  text-align: center;
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GridItem: React.FC<{
  handleChange: (id: string) => void;
  canvasId: string;
}> = ({ handleChange, canvasId }) => {
  const canvas = useCanvas();

  return (
    <FlexContainerColumn style={{ alignItems: "center" }}>
      <Thumbnail onClick={() => handleChange(canvasId)} />
      <ThumnbnailLabel title={getValue(canvas?.label)}>
        {getValue(canvas?.label)}
      </ThumnbnailLabel>
    </FlexContainerColumn>
  );
};

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
              <GridItem
                canvasId={item.id}
                handleChange={() => handleChange(item.id)}
              />
            </CanvasContext>
          );
        })}
      </ThumbnailGrid>
      <ViewSelector />
    </GridViewContainer>
  );
};
