import { Button } from "@manifest-editor/ui/atoms/Button";
import { InputContainer, InputLabel, InputLabelEdit } from "@manifest-editor/ui/editors/Input";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { createAppActions } from "../../helpers/create-app-actions";
import { toRef } from "@iiif/parser";
import { useEditingResource, useEditor, useCreator } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useToggleList } from "../../helpers";
import { RangeList } from "../../components/RangeList";

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
          <InputContainer $wide>
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
