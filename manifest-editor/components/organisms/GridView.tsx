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
import { ThumbnailGrid } from "../atoms/ThumbnailContainer";
import { ViewSelector } from "../atoms/ViewSelector";
import { FlexContainerColumn } from "../layout/FlexContainer";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import ShellContext from "../apps/Shell/ShellContext";

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
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    setRedraw(redraw + 1);
    reorder(result.source.index, destination.index);
  };

  return (
    <GridViewContainer>
      <DragDropContext onDragEnd={onDragEnd} key={redraw}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ThumbnailGrid {...provided.droppableProps} ref={provided.innerRef}>
              {manifest &&
                manifest[dispatchType] &&
                Array.isArray(manifest[dispatchType]) &&
                manifest[dispatchType].map((item: any, index) => {
                  return (
                    <Draggable
                      key={item?.id?.toString() + "--HASH--"}
                      draggableId={item?.id?.toString() + "--HASH--"}
                      index={index}
                    >
                      {(innerProvided) => (
                        <div
                          ref={innerProvided.innerRef}
                          {...innerProvided.draggableProps}
                          {...innerProvided.dragHandleProps}
                          key={index}
                        >
                          <CanvasContext key={item.id} canvas={item.id}>
                            <GridItem
                              canvasId={item.id}
                              handleChange={() => handleChange(item.id)}
                            />
                          </CanvasContext>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
            </ThumbnailGrid>
          )}
        </Droppable>
      </DragDropContext>
      <ViewSelector />
    </GridViewContainer>
  );
};
