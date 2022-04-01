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
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";

import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import ShellContext from "../apps/Shell/ShellContext";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { RecentLabel } from "../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../atoms/TemplateCard";
import { AddIcon } from "../icons/AddIcon";

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
      <ErrorBoundary>
        <Thumbnail onClick={() => handleChange(canvasId)} />
      </ErrorBoundary>
    </FlexContainerColumn>
  );
};

export const GridView: React.FC = () => {
  const manifest = useManifest();
  const shellContext = useContext(ShellContext);

  const editorContext = useContext(ManifestEditorContext);

  const handleChange = (itemId: string) => {
    shellContext?.setCurrentCanvasId(itemId);
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
    <GridViewContainer>
      <SortableList
        onSortEnd={reorder}
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
                    <SortableKnob>
                      <GridItem
                        canvasId={item.id}
                        handleChange={() => handleChange(item.id)}
                      />
                    </SortableKnob>
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
