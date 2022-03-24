import { getValue } from "@iiif/vault-helpers";
import { useContext, useState } from "react";
import {
  CanvasContext,
  useCanvas,
  useManifest,
  useSimpleViewer,
  useVault,
} from "react-iiif-vault";
import styled from "styled-components";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import { Thumbnail } from "../atoms/Thumbnail";
import { ViewSelector } from "../atoms/ViewSelector";
import { FlexContainerColumn } from "../layout/FlexContainer";

import SortableList, { SortableItem } from "react-easy-sort";
import ShellContext from "../apps/Shell/ShellContext";

const GridViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justiy-content: space-between;
  align-items: center;
  height: 80vh;
  .list {
    padding: 2px;
    background-color: blue;
    flex-direction: row;
    display: flex;
    justify-content: space-evenly;
    max-height: 90vh;
    overflow-y: auto;
    width: 100%;
    flex-wrap: wrap;
  }
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    height: unset;
    min-height: 50vh;
    .list {
      flex-direction: row;
      overflow-x: auto;
    }
  }
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
    <FlexContainerColumn style={{ alignItems: "center", cursor: "grab" }}>
      <ThumnbnailLabel title={getValue(canvas?.label)}>
        {getValue(canvas?.label)}
      </ThumnbnailLabel>
      <Thumbnail onClick={() => handleChange(canvasId)} />
    </FlexContainerColumn>
  );
};

export const GridView: React.FC = () => {
  const manifest = useManifest();
  const shellContext = useContext(ShellContext);

  const { setCurrentCanvasId } = useSimpleViewer();
  const editorContext = useContext(ManifestEditorContext);
  const [redraw, setRedraw] = useState(0);

  const handleChange = (itemId: string) => {
    setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty("canvas");
  };

  const dispatchType = "items";
  const vault = useVault();

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    setRedraw(redraw + 1);

    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };

  return (
    <GridViewContainer>
      <SortableList
        onSortEnd={reorder}
        key={redraw}
        className="list"
        draggedItemClassName="dragged"
      >
        {manifest &&
          manifest[dispatchType] &&
          Array.isArray(manifest[dispatchType]) &&
          manifest[dispatchType].map((item: any) => {
            return (
              <SortableItem key={item?.id?.toString() + "--HASH--"}>
                <div className="item">
                  <CanvasContext key={item.id} canvas={item.id}>
                    <GridItem
                      canvasId={item.id}
                      handleChange={() => handleChange(item.id)}
                    />
                  </CanvasContext>
                </div>
              </SortableItem>
            );
          })}
      </SortableList>
      <ViewSelector />
    </GridViewContainer>
  );
};
