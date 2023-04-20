import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel, InputLabelEdit } from "@/editors/Input";
import { useEditingResource, useEditor } from "@/shell/EditingStack/EditingStack";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { EmptyState } from "@/madoc/components/EmptyState";
import { useToggleList } from "../LinkingProperties/LinkingProperties";
import { createAppActions } from "../LinkingProperties/LinkingProperties.helpers";
import { toRef } from "@iiif/parser";
import { RangeList } from "@/_components/ui/RangeList/RangeList";

export function RangeStructuralProperties() {
  const resource = useEditingResource();
  const { structural, notAllowed } = useEditor();
  const [toggled, toggle] = useToggleList();

  const { items, structures } = structural;

  const [canCreateRange, rangeActions] = useCreator(resource?.resource, "items", "Range");
  const [canCreateCanvas, canvasActions] = useCreator(resource?.resource, "items", "Canvas");

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("items") ? (
        <>
          <InputContainer wide>
            {!items.get()?.length ? (
              <>
                <InputLabel>Ranges</InputLabel>
                <EmptyState $noMargin $box>
                  No ranges
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                Ranges
                <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
              </InputLabel>
            )}
            <RangeList
              id={items.focusId()}
              list={items.get()}
              inlineHandle={false}
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) =>
                toRef(item)?.type === "Canvas" ? canvasActions.edit(item) : rangeActions.edit(item)
              }
              createActions={createAppActions(items)}
            />
          </InputContainer>
          {canCreateCanvas ? <Button onClick={() => canvasActions.create()}>Add canvas</Button> : null}
          {canCreateRange ? <Button onClick={() => rangeActions.create()}>Add range</Button> : null}
        </>
      ) : null}
    </PaddedSidebarContainer>
  );
}
