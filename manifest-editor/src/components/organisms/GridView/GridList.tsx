import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { useManifest, useVault, CanvasContext } from "react-iiif-vault";
import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";
import { RecentLabel } from "../../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../../atoms/TemplateCard";
import { useShell } from "../../../context/ShellContext/ShellContext";
import { AddIcon } from "../../../icons/AddIcon";
import { FlexContainer } from "../../layout/FlexContainer";
import { GridItem } from "./GridItem";

export const GridList: React.FC = () => {
  const manifest = useManifest();
  const shellContext = useShell();

  const editorContext = useManifestEditor();

  const handleChange = (itemId: string, e: any) => {
    switch (e.detail) {
      case 1:
        shellContext.setCurrentCanvasId(itemId);
        editorContext?.changeSelectedProperty("canvas");
        break;
      case 2:
        shellContext.setCurrentCanvasId(itemId);
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
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };

  const remove = (fromPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    newOrder.splice(fromPosition, 1);
    if (manifest) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newOrder);
    }
  };

  if (!manifest || !manifest[dispatchType] || manifest[dispatchType].length <= 0) {
    return (
      <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
        <TemplateCardContainer onClick={() => editorContext?.setAddCanvasModalOpen(true)}>
          <TemplateCardNew>
            <AddIcon />
          </TemplateCardNew>
          <RecentLabel>Add</RecentLabel>
        </TemplateCardContainer>
      </FlexContainer>
    );
  }
  return (
    <SortableList onSortEnd={reorder} className="list" draggedItemClassName="dragged">
      {manifest &&
        manifest[dispatchType] &&
        Array.isArray(manifest[dispatchType]) &&
        manifest[dispatchType].map((item: any, index: number) => {
          return (
            <SortableItem key={item?.id?.toString() + editorContext?.thumbnailSize?.h}>
              <div>
                <CanvasContext key={item.id} canvas={item.id}>
                  <SortableKnob>
                    <GridItem
                      canvasId={item.id}
                      handleChange={handleChange}
                      reorder={reorder}
                      remove={remove}
                      index={index}
                    />
                  </SortableKnob>
                </CanvasContext>
              </div>
            </SortableItem>
          );
        })}
    </SortableList>
  );
};
