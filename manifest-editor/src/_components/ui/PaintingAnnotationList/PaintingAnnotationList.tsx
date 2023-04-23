import { useResourceContext } from "react-iiif-vault";
import { useAnnotationPageEditor } from "@/shell/EditingStack/EditingStack";
import { useToggleList } from "@/_editors/LinkingProperties/LinkingProperties";
import invariant from "tiny-invariant";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { InputContainer, InputLabel, InputLabelEdit } from "@/editors/Input";
import { EmptyState } from "@/madoc/components/EmptyState";
import { AnnotationList } from "@/_components/ui/AnnotationList/AnnotationList";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { Button } from "@/atoms/Button";

export function PaintingAnnotationList() {
  const { annotationPage, canvas } = useResourceContext();
  const { structural, notAllowed } = useAnnotationPageEditor();
  const { items, annotations } = structural;
  const [toggled, toggle] = useToggleList();

  invariant(annotationPage, "Annotation page not found");

  const [canCreateAnnotation, annotationActions] = useCreator(
    { id: annotationPage, type: "AnnotationPage" },
    "items",
    "Annotation",
    canvas ? { id: canvas, type: "Canvas" } : undefined
  );

  return (
    <>
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
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) => annotationActions.edit(item, idx)}
              createActions={createAppActions(items)}
            />
          </InputContainer>
          {canCreateAnnotation ? <Button onClick={() => annotationActions.create()}>Add media</Button> : null}
        </>
      ) : null}
    </>
  );
}
