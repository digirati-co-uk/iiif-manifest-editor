import { PaddedSidebarContainer } from "@manifest-editor/components";
import { InlineAnnotationPageEditor, PaintingAnnotationList } from "@manifest-editor/editors";
import { type EditorDefinition, useEditor, useGenericEditor } from "@manifest-editor/shell";
import { AnnotationPageContext, CanvasContext } from "react-iiif-vault";

export function UniversalViewerAnnotationPage() {
  const editor = useEditor();
  const annotationPageId = editor.technical.id.get();
  const canvasId = editor.getPartOf();

  if (!canvasId) {
    return <InlineAnnotationPageEditor />;
  }

  const canvasEditor = useGenericEditor({ id: canvasId, type: "Canvas" });
  const isPaintingAnnotationPage = (canvasEditor.structural.items.get() || []).some((item) => item.id === annotationPageId);

  if (!isPaintingAnnotationPage) {
    return <InlineAnnotationPageEditor />;
  }

  return (
    <PaddedSidebarContainer>
      <CanvasContext canvas={canvasId}>
        <AnnotationPageContext annotationPage={annotationPageId}>
          <PaintingAnnotationList />
        </AnnotationPageContext>
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}

export const universalViewerAnnotationPageEditor: EditorDefinition = {
  id: "@manifest-editor/universal-viewer-annotation-page",
  label: "Media",
  supports: {
    edit: true,
    properties: [],
    resourceTypes: ["AnnotationPage"],
  },
  component: () => <UniversalViewerAnnotationPage />,
};
