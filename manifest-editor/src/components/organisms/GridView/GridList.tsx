import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { useManifest, useVault, CanvasContext } from "react-iiif-vault";
import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";
import { RecentLabel } from "../../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../../atoms/TemplateCard";
import { AddIcon } from "../../../icons/AddIcon";
import { FlexContainer } from "../../layout/FlexContainer";
import { GridItem } from "./GridItem";
import { useCallback } from "react";
import { reorderEntityField, removeReference } from "@iiif/vault/actions";
import { Reference } from "@iiif/presentation-3";

export const GridList: React.FC<{ handleChange: (itemId: string, canvas?: boolean) => void; strip?: boolean }> = ({
  handleChange: _handleChange,
  strip,
}) => {
  const manifest = useManifest();
  const editorContext = useManifestEditor();

  const handleChange = useCallback((itemId: string, e: any) => {
    _handleChange(itemId, e.detail === 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatchType = "items";
  const vault = useVault();

  const reorder = useCallback(
    (fromPosition: number, toPosition: number) => {
      if (manifest) {
        vault.dispatch(
          reorderEntityField({
            id: manifest.id,
            type: manifest.type,
            endIndex: toPosition,
            startIndex: fromPosition,
            key: dispatchType,
          })
        );
      }
    },
    [manifest, vault]
  );

  const remove = useCallback(
    (fromPosition: number, reference: Reference) => {
      if (manifest) {
        vault.dispatch(
          removeReference({
            id: manifest.id,
            type: manifest.type,
            key: dispatchType,
            index: fromPosition,
            reference,
          })
        );
      }
    },
    [manifest, vault]
  );

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
            <SortableItem key={item.id}>
              <div>
                <CanvasContext canvas={item.id}>
                  <SortableKnob>
                    <div>
                      <GridItem
                        canvasId={item.id}
                        handleChange={handleChange}
                        reorder={reorder}
                        remove={remove}
                        index={index}
                      />
                    </div>
                  </SortableKnob>
                </CanvasContext>
              </div>
            </SortableItem>
          );
        })}
    </SortableList>
  );
};
