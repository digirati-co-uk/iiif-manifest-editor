import { useAnnotationPageEditor, useCreator } from "@manifest-editor/shell";
import { useResourceContext } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { useToggleList } from "../../helpers";
import { InputContainer, InputLabel, InputLabelEdit } from "../Input";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { createAppActions } from "../../helpers/create-app-actions";
import { AnnotationList } from "../AnnotationList/AnnotationList";

export function PaintingAnnotationList() {
  const { annotationPage, canvas } = useResourceContext();
  const { structural, notAllowed } = useAnnotationPageEditor();
  const { items } = structural;
  const [toggled, toggle] = useToggleList();

  invariant(annotationPage, "Annotation page not found");

  const [canCreateAnnotation, annotationActions] = useCreator(
    { id: annotationPage, type: "AnnotationPage" },
    "items",
    "Annotation",
    canvas ? { id: canvas, type: "Canvas" } : undefined,
    { isPainting: true }
  );

  return (
    <>
      {!notAllowed.includes("items") ? (
        <div id={items.containerId()}>
          <InputContainer $wide>
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
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) => annotationActions.edit(item, idx)}
              createActions={createAppActions(items)}
            />
          </InputContainer>
          {canCreateAnnotation ? <Button onClick={() => annotationActions.create()}>Add media</Button> : null}
        </div>
      ) : null}
    </>
  );
}
