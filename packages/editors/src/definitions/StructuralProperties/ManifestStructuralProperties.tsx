import { useEditingResource, useEditor, useCreator } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { InputContainer, InputLabel, InputLabelEdit } from "../../components/Input";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { useToggleList } from "../../helpers";
import { createAppActions, emptyCallback } from "../../helpers/create-app-actions";
import { CanvasList } from "../../components/CanvasList/CanvasList";

export function ManifestStructuralProperties() {
  const resource = useEditingResource();
  const { structural, notAllowed } = useEditor();
  const [toggled, toggle] = useToggleList();

  const { items, structures } = structural;

  const [canCreateCanvas, canvasActions] = useCreator(resource?.resource, "items", "Canvas");

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("items") ? (
        <>
          <InputContainer $wide>
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
              list={items.getSortable() || []}
              inlineHandle={false}
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) => canvasActions.edit(item, idx)}
              createActions={createAppActions(items, emptyCallback)}
            />
          </InputContainer>
          {canCreateCanvas ? <Button onClick={() => canvasActions.create()}>Add canvas</Button> : null}
        </>
      ) : null}

      {!notAllowed.includes("structures") ? (
        <LinkingPropertyList
          label="Ranges"
          property="structures"
          items={structures.getSortable()}
          reorder={(ctx) => structures.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(structures, emptyCallback)}
          creationType="Range"
          emptyLabel="No ranges"
          parent={resource?.resource}
        />
      ) : null}
    </PaddedSidebarContainer>
  );
}
