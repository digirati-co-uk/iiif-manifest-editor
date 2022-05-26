import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";
import { CanvasContext, useCanvas, useManifest, useVault } from "react-iiif-vault";
import styled from "styled-components";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";

import { Thumbnail } from "../../atoms/Thumbnail";
import { ViewSelector } from "../../atoms/ViewSelector";
import { FlexContainer, FlexContainerRow } from "../layout/FlexContainer";

import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { RecentLabel } from "../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../atoms/TemplateCard";
import { AddIcon } from "../../icons/AddIcon";
import { DropdownContent } from "../../atoms/Dropdown";
import { DropdownItem } from "../../atoms/DropdownPreviewMenu";
import { HeightWidthSwitcher, ThumbnailSize } from "../../atoms/HeightWidthSwitcher";

export const GridViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 80vh;
  .list {
    flex-direction: row;
    display: flex;
    justify-content: unset;
    max-height: 90vh;
    overflow-y: auto;
    flex-wrap: wrap;
    margin: 0 -10px;
    & > * {
      margin: 10px;
    }
    a {
      text-decoration: none;
    }
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

export const ThumnbnailLabel = styled.small`
  white-space: nowrap;
  text-align: center;
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ThumbnailContainer = styled.div<{ size?: number }>`
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: any) => props.theme.color.lightgrey || "grey"};
  width: ${(props) => props.size && props.size + 50}px;
  height: ${(props) => props.size && props.size + 50}px;
  img {
    max-width: 100%;
  }
`;

const GridItem: React.FC<{
  handleChange: (id: string, e: any) => void;
  canvasId: string;
}> = ({ handleChange, canvasId }) => {
  const canvas = useCanvas();
  const editorContext = useManifestEditor();

  return (
    <ThumbnailContainer onClick={(e: any) => handleChange(canvasId, e)} size={editorContext?.thumbnailSize?.w}>
      <ThumnbnailLabel title={getValue(canvas?.label)}>{getValue(canvas?.label)}</ThumnbnailLabel>
      <ErrorBoundary>
        <Thumbnail onClick={() => {}} />
      </ErrorBoundary>
    </ThumbnailContainer>
  );
};

export const GridView: React.FC<{ handleChange: (canvasId: string, thumbnails: boolean) => void }> = ({
  handleChange: _handleChange,
}) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  // For the context menu to know where to send
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const manifest = useManifest();

  const editorContext = useManifestEditor();

  const handleChange = (itemId: string, e: any) => {
    _handleChange(itemId, e.detail === 2);
  };

  const dispatchType = "items";
  const vault = useVault();

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };

  const showContextMenu = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
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

  if (!manifest || !manifest[dispatchType] || manifest[dispatchType].length <= 0) {
    return (
      <GridViewContainer>
        <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
          <TemplateCardContainer onClick={() => editorContext?.setAddCanvasModalOpen(true)}>
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
              ) {
                reorder(selectedIndex, manifest[dispatchType].length - 1);
              }
              setContextMenuVisible(false);
            }}
          >
            Send to end
          </DropdownItem>
        </DropdownContent>
      )}
      <SortableList onSortEnd={reorder} className="list" draggedItemClassName="dragged">
        {manifest &&
          manifest[dispatchType] &&
          Array.isArray(manifest[dispatchType]) &&
          manifest[dispatchType].map((item: any, index: number) => {
            return (
              <SortableItem key={item?.id?.toString() + editorContext?.thumbnailSize?.h}>
                <div
                  className="item"
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => showContextMenu(e, index)}
                >
                  <CanvasContext key={item.id} canvas={item.id}>
                    <SortableKnob>
                      <GridItem canvasId={item.id} handleChange={handleChange} />
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
            { h: 128, w: 128 },
            { h: 256, w: 256 },
            { h: 512, w: 512 },
            { h: 1024, w: 1024 },
          ]}
          label={`${editorContext?.thumbnailSize?.w}x${editorContext?.thumbnailSize?.h}`}
          onOptionClick={(selected: ThumbnailSize) => editorContext?.setThumbnailSize(selected)}
        />
      </FlexContainerRow>
    </GridViewContainer>
  );
};
