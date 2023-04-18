import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel, InputLabelEdit } from "@/editors/Input";
import { useEditingResource, useEditor } from "@/shell/EditingStack/EditingStack";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { EmptyState } from "@/madoc/components/EmptyState";
import { useToggleList } from "../LinkingProperties/LinkingProperties";
import { createAppActions } from "../LinkingProperties/LinkingProperties.helpers";
import { CanvasList } from "../../_components/ui/CanvasList/CanvasList";

export function ManifestStructuralProperties() {
  const resource = useEditingResource();
  const { structural, notAllowed } = useEditor();
  const [toggled, toggle] = useToggleList();

  const { items } = structural;

  const [canCreateCanvas, canvasActions] = useCreator(resource?.resource, "items", "Canvas");

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("items") ? (
        <>
          <InputContainer wide>
            {!items.get()?.length ? (
              <>
                <InputLabel>Canvases</InputLabel>
                <EmptyState $noMargin $box>
                  No canvases
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                Canvases
                <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
              </InputLabel>
            )}
            <CanvasList
              id={items.focusId()}
              list={items.get()}
              inlineHandle={false}
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) => canvasActions.edit(item, idx)}
              createActions={createAppActions(items)}
            />
          </InputContainer>
          {canCreateCanvas ? <Button onClick={() => canvasActions.create()}>Add canvas</Button> : null}
        </>
      ) : null}
    </PaddedSidebarContainer>
  );
}
