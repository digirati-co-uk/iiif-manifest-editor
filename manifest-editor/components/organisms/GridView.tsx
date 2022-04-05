import { getValue } from "@iiif/vault-helpers";
import { useContext, useState } from "react";
import {
  CanvasContext,
  useCanvas,
  useManifest,
  useVault,
} from "react-iiif-vault";
import styled from "styled-components";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import { Thumbnail } from "../atoms/Thumbnail";
import { ViewSelector } from "../atoms/ViewSelector";
import {
  FlexContainer,
  FlexContainerColumn,
  FlexContainerRow,
} from "../layout/FlexContainer";

import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import ShellContext from "../apps/Shell/ShellContext";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { RecentLabel } from "../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../atoms/TemplateCard";
import { AddIcon } from "../icons/AddIcon";
import { DropdownContent } from "../atoms/Dropdown";
import { DropdownItem } from "../atoms/DropdownPreviewMenu";
import {
  HeightWidthSwitcher,
  ThumbnailSize,
} from "../atoms/HeightWidthSwitcher";

const GridViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 80vh;
  .list {
    padding: 2px;
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
  padding: ${(props: any) => props.theme.padding.medium || "1rem"} 0 0 0;
`;

const GridItem: React.FC<{
  handleChange: (id: string, e: any) => void;
  canvasId: string;
}> = ({ handleChange, canvasId }) => {
  const canvas = useCanvas();

  return (
    <FlexContainerColumn
      style={{ alignItems: "center", cursor: "grab" }}
      onClick={(e: any) => handleChange(canvasId, e)}
    >
      <ThumnbnailLabel title={getValue(canvas?.label)}>
        {getValue(canvas?.label)}
      </ThumnbnailLabel>
      <ErrorBoundary>
        <Thumbnail onClick={() => {}} />
      </ErrorBoundary>
    </FlexContainerColumn>
  );
};

export const GridView: React.FC = () => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  // For the context menu to know where to send
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const manifest = useManifest();
  const shellContext = useContext(ShellContext);

  const editorContext = useContext(ManifestEditorContext);

  const handleChange = (itemId: string, e: any) => {
    switch (e.detail) {
      case 1:
        shellContext?.setCurrentCanvasId(itemId);
        editorContext?.changeSelectedProperty("canvas");
        break;
      case 2:
        shellContext?.setCurrentCanvasId(itemId);
        editorContext?.changeSelectedProperty("canvas");
        editorContext?.setView("thumbnails");
        break;
    }
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

  const showContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    // Disable the default context menu
    event.preventDefault();

    setSelectedIndex(index);

    setContextMenuVisible(false);
    const newPosition = {
      x: event.pageX,
      y: event.pageY,
    };

    setAnchorPoint(newPosition);
    setContextMenuVisible(true);
  };

  if (
    !manifest ||
    !manifest[dispatchType] ||
    manifest[dispatchType].length <= 0
  ) {
    return (
      <GridViewContainer>
        <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
          <TemplateCardContainer
            onClick={() => editorContext?.setAddCanvasModalOpen(true)}
          >
            <TemplateCardNew>
              <AddIcon />
            </TemplateCardNew>
            <RecentLabel>Add</RecentLabel>
          </TemplateCardContainer>
        </FlexContainer>

        <ViewSelector />
      </GridViewContainer>
    );
  }
  return (
    <GridViewContainer onClick={() => setContextMenuVisible(false)}>
      {contextMenuVisible && (
        <DropdownContent style={{ top: anchorPoint.y, left: anchorPoint.x }}>
          <DropdownItem
            onClick={() => {
              reorder(selectedIndex, 0);
              setContextMenuVisible(false);
            }}
          >
            Send to start
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              if (
                manifest &&
                manifest[dispatchType] &&
                Array.isArray(manifest[dispatchType]) &&
                manifest[dispatchType]
              )
                reorder(selectedIndex, manifest[dispatchType].length - 1);
              setContextMenuVisible(false);
            }}
          >
            Send to end
          </DropdownItem>
        </DropdownContent>
      )}
      <SortableList
        onSortEnd={reorder}
        className="list"
        draggedItemClassName="dragged"
      >
        {manifest &&
          manifest[dispatchType] &&
          Array.isArray(manifest[dispatchType]) &&
          manifest[dispatchType].map((item: any, index: number) => {
            return (
              <SortableItem
                key={item?.id?.toString() + editorContext?.thumbnailSize?.h}
              >
                <div
                  className="item"
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                    showContextMenu(e, index)
                  }
                >
                  <CanvasContext key={item.id} canvas={item.id}>
                    <SortableKnob>
                      <GridItem
                        canvasId={item.id}
                        handleChange={handleChange}
                      />
                    </SortableKnob>
                  </CanvasContext>
                </div>
              </SortableItem>
            );
          })}
      </SortableList>

      <FlexContainerRow>
        <ViewSelector />
        <HeightWidthSwitcher
          options={[
            { h: 256, w: 256 },
            { h: 512, w: 512 },
            { h: 1024, w: 1024 },
          ]}
          label={`${editorContext?.thumbnailSize?.w}x${editorContext?.thumbnailSize?.h}`}
          onOptionClick={(selected: ThumbnailSize) =>
            editorContext?.setThumbnailSize(selected)
          }
        />
      </FlexContainerRow>
    </GridViewContainer>
  );
};
