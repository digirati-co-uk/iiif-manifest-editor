import { useAnnotationInfo, ViewerAnnotationPage } from "@manifest-editor/editors";
import { type AnnotationPanel, useAtlasStore, useLayoutState } from "@manifest-editor/shell";
import { AnnotationPageContext, useCanvas } from "react-iiif-vault";
import { useStore } from "zustand";

export const canvasAnnotations: AnnotationPanel = {
  id: "@manifest-editor/canvas-annotations",
  label: "Canvas annotations",
  render: () => <CanvasAnnotations />,
};

function CanvasAnnotations() {
  const canvas = useCanvas();
  const store = useAtlasStore();
  const toolEnabled = useStore(store, (s) => s.tool.enabled);
  const { leftPanel } = useLayoutState();
  const isLeftPanel = leftPanel.current === "@manifest-editor/canvas-annotation-listing";
  const firstAnnotationPage = canvas?.annotations[0];

  if (!canvas || toolEnabled || !firstAnnotationPage || !isLeftPanel) {
    return null;
  }

  return (
    <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
      <ViewerAnnotationPage />
    </AnnotationPageContext>
  );
}
