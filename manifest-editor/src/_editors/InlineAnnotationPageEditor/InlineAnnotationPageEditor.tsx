import { useEditor, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { AnnotationList } from "@/_components/ui/AnnotationList/AnnotationList";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { useAnnotationPage } from "react-iiif-vault";
import { Reference } from "@iiif/presentation-3";

export function InlineAnnotationPageEditor() {
  const editor = useEditor();
  const canvasId = editor.getPartOf();
  const canvasEditor = useGenericEditor(canvasId ? { id: canvasId, type: "Canvas" } : undefined);
  const page = canvasEditor.structural.items.get();
  const annoPage = useAnnotationPage({ id: page[0].id });
  const hasMultiplePainting = (annoPage?.items.length || 0) > 1;

  const { items } = editor.structural;

  const [canCreateAnnotation, annotationActions] = useCreator(
    editor.ref(),
    "items",
    "Annotation",
    canvasId ? { id: canvasId, type: "Canvas" } : undefined
  );

  // Does the canvas have multiple media?

  return (
    <PaddedSidebarContainer>
      <AnnotationList
        id={items.focusId()}
        list={items.get() || []}
        inlineHandle={false}
        reorder={(t) => items.reorder(t.startIndex, t.endIndex)}
        onSelect={(item, idx) => annotationActions.edit(item, idx)}
        createActions={createAppActions(items)}
      />
      {annoPage && hasMultiplePainting ? <PromptToAddPaintingAnnotations page={annoPage} /> : null}
    </PaddedSidebarContainer>
  );
}

function PromptToAddPaintingAnnotations({ page }: { page: Reference }) {
  const pageEditor = useGenericEditor({ id: page.id, type: "AnnotationPage" });
  const annotationPage = useAnnotationPage({ id: page.id });

  return <pre>{JSON.stringify(annotationPage, null, 2)}</pre>;
}
