import { useEditingResource, useEditor } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { PaintingAnnotationList } from "../../components/PaintingAnnotationList/PaintingAnnotationList";
import { createAppActions } from "../../helpers/create-app-actions";
import { CanvasContext, AnnotationPageContext } from "react-iiif-vault";

export function OverviewCanvasEditor() {
  const resource = useEditingResource();
  const { technical, descriptive, structural, notAllowed } = useEditor();
  const { label } = descriptive;
  const { items, annotations } = structural;
  const pages = items.get();
  const page = pages[0];

  const annotationList = annotations.get();

  if (!page) {
    return <div>Error: Expected canvas to have at least one annotation page.</div>;
  }

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        focusId={label.focusId()}
        label={"Label"}
        fields={label.get()}
        onSave={(e: any) => label.set(e.toInternationalString())}
      />
      <CanvasContext canvas={technical.id.get()}>
        <AnnotationPageContext annotationPage={page.id}>
          <PaintingAnnotationList />
        </AnnotationPageContext>

        {annotationList && annotationList.length ? (
          <LinkingPropertyList
            label="Annotations"
            property="annotations"
            items={annotations.get()}
            reorder={(ctx) => annotations.reorder(ctx.startIndex, ctx.endIndex)}
            createActions={createAppActions(annotations)}
            creationType="AnnotationPage"
            emptyLabel="No annotations"
            parent={resource?.resource}
          />
        ) : null}
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}
