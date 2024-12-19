import { AnnotationPageContext, CanvasContext } from "react-iiif-vault";
import { createAppActions } from "../../helpers/create-app-actions";
import { useEditingResource, useEditor } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { PaintingAnnotationList } from "../../components/PaintingAnnotationList/PaintingAnnotationList";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";

export function CanvasStructuralProperties() {
  const resource = useEditingResource();
  const { technical, structural } = useEditor();
  const { items, annotations } = structural;
  const pages = items.get();

  if (pages.length > 1) {
    return <div>Unsupported canvas (multiple annotation pages)</div>;
  }

  const page = pages[0]!;

  // For now - we unwrap the annotation page.
  return (
    <PaddedSidebarContainer>
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
          createActions={createAppActions(annotations)}
          creationType="AnnotationPage"
          emptyLabel="No annotations"
          parent={resource?.resource}
        />
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}
