import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { useManifest, useVault, CanvasContext, useResourceContext } from "react-iiif-vault";
import { useManifestEditor } from "../../../apps/ManifestEditorLegacy/ManifestEditor.context";
import { RecentLabel } from "../../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../../atoms/TemplateCard";
import { AddIcon } from "../../../icons/AddIcon";
import { FlexContainer } from "../../layout/FlexContainer";
import { GridItem } from "./GridItem";
import { Fragment, useCallback } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { reorderEntityField, removeReference } from "@iiif/helpers/vault/actions";
import { Reference } from "@iiif/presentation-3";
import { useCanvasSubset } from "../../../hooks/useCanvasSubset";

export const GridList: React.FC<{
  handleChange: (itemId: string, canvas?: boolean) => void;
  handleChangeDouble?: (itemId: string, thumbnail?: boolean) => void;
  strip?: boolean;
  canvasIds?: Array<Reference | string>;
}> = ({ handleChange: _handleChange, handleChangeDouble, canvasIds }) => {
  const ctx = useResourceContext();
  const manifestId = ctx.manifest;
  const canvases = useCanvasSubset(canvasIds);
  const editorContext = useManifestEditor();

  const handleChange = useCallback((itemId: string, e: any) => {
    _handleChange(itemId, e.detail === 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatchType = "items";
  const vault = useVault();

  const reorder = useCallback(
    (fromPosition: number, toPosition: number) => {
      if (manifestId) {
        unstable_batchedUpdates(() => {
          vault.dispatch(
            reorderEntityField({
              id: manifestId,
              type: "Manifest",
              endIndex: toPosition,
              startIndex: fromPosition,
              key: dispatchType,
            })
          );
        });
      }
    },
    [manifestId, vault]
  );

  const remove = useCallback(
    (fromPosition: number, reference: Reference) => {
      if (manifestId) {
        vault.dispatch(
          removeReference({
            id: manifestId,
            type: "Manifest",
            key: dispatchType,
            index: fromPosition,
            reference,
          })
        );
      }
    },
    [manifestId, vault]
  );

  if (canvases.length === 0) {
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
  const Sortable = canvasIds
    ? {
        List: "div",
        Item: "div",
        Knob: "div",
      }
    : {
        List: SortableList,
        Item: SortableItem,
        Knob: SortableKnob,
      };

  return (
    <Sortable.List onSortEnd={reorder} className="list" draggedItemClassName="dragged">
      {canvases.map((item, index: number) => {
        return (
          <Sortable.Item key={item.id}>
            <div>
              <CanvasContext canvas={item.id}>
                <Sortable.Knob>
                  <div>
                    <GridItem
                      canvasId={item.id}
                      handleChange={handleChange}
                      handleChangeDouble={handleChangeDouble}
                      reorder={canvasIds ? undefined : reorder}
                      remove={remove}
                      index={index}
                    />
                  </div>
                </Sortable.Knob>
              </CanvasContext>
            </div>
          </Sortable.Item>
        );
      })}
    </Sortable.List>
  );
};
