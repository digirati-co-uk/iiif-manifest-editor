import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { useEditor } from "@/shell/EditingStack/EditingStack";
import { useAnnotationPageEditor, useEditingResource } from "../../shell/EditingStack/EditingStack";
import { AnnotationPageContext, CanvasContext, useResourceContext } from "react-iiif-vault";
import { CanvasList } from "../../_components/ui/CanvasList/CanvasList";
import { createAppActions } from "../LinkingProperties/LinkingProperties.helpers";
import { InputContainer, InputLabel } from "@/editors/Input";
import { EmptyState } from "@/madoc/components/EmptyState";
import { useToggleList } from "../LinkingProperties/LinkingProperties";
import { useCreator } from "../../_panels/right-panels/BaseCreator/BaseCreator";
import invariant from "tiny-invariant";
import { InputLabelEdit } from "../../editors/Input";
import { Button } from "@/atoms/Button";
import { AnnotationList } from "../../_components/ui/AnnotationList/AnnotationList";

export function CanvasStructuralProperties() {
  const { technical, structural } = useEditor();
  const { items } = structural;
  const pages = items.get();

  if (pages.length > 1) {
    return <div>Unsupported canvas (multiple annotation pages)</div>;
  }

  const page = pages[0];

  // For now - we unwrap the annotation page.
  return (
    <CanvasContext canvas={technical.id.get()}>
      <AnnotationPageContext annotationPage={page.id}>
        <PaintingAnnotationList />
      </AnnotationPageContext>
    </CanvasContext>
  );
}

function PaintingAnnotationList() {
  const { annotationPage, canvas } = useResourceContext();
  const { structural, notAllowed } = useAnnotationPageEditor();
  const { items } = structural;
  const [toggled, toggle] = useToggleList();

  invariant(annotationPage, "Annotation page not found");

  const [canCreateAnnotation, annotationActions] = useCreator(
    { id: annotationPage, type: "AnnotationPage" },
    "items",
    "Annotation",
    canvas ? { id: canvas, type: "Canvas" } : undefined
  );

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("items") ? (
        <>
          <InputContainer wide>
            {!items.get()?.length ? (
              <>
                <InputLabel>Media</InputLabel>
                <EmptyState $noMargin $box>
                  No media
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                Media
                <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
              </InputLabel>
            )}
            <AnnotationList
              id={items.focusId()}
              list={items.get()}
              inlineHandle={false}
              reorder={(t) => items.reorder(t.startIndex, t.endIndex)}
              onSelect={(item, idx) => annotationActions.edit(item, idx)}
              createActions={createAppActions(items)}
            />
          </InputContainer>
          {canCreateAnnotation ? <Button onClick={() => annotationActions.create()}>Add media</Button> : null}
        </>
      ) : null}
    </PaddedSidebarContainer>
  );
}
