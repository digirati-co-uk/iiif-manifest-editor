import { ErrorMessage } from "@manifest-editor/components";
import { useEditingResource, useEditor } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { AnnotationPageContext, CanvasContext } from "react-iiif-vault";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { PaintingAnnotationList } from "../../components/PaintingAnnotationList/PaintingAnnotationList";
import { createAppActions, emptyCallback } from "../../helpers/create-app-actions";

export function CanvasStructuralProperties() {
  const resource = useEditingResource();
  const { technical, structural } = useEditor();
  const { items, annotations } = structural;
  const pages = items.get();

  const unsupported = pages.length > 1;

  const page = pages[0]!;

  // For now - we unwrap the annotation page.
  return (
    <PaddedSidebarContainer>
      {unsupported ? (
        <ErrorMessage className="mb-2">Multiple painting annotation pages are not supported.</ErrorMessage>
      ) : null}
      <CanvasContext canvas={technical.id.get()}>
        <AnnotationPageContext annotationPage={page.id}>
          <PaintingAnnotationList />
        </AnnotationPageContext>

        <LinkingPropertyList
          containerId={annotations.containerId()}
          label="Annotations"
          property="annotations"
          items={annotations.get()}
          reorder={(ctx) => annotations.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(annotations, emptyCallback)}
          creationType="AnnotationPage"
          emptyLabel="No annotations"
          parent={resource?.resource}
        />
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}
