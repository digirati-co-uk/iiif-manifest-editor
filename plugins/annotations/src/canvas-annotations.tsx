import { ViewerAnnotationPage } from "@manifest-editor/editors";
import { type AnnotationPanel, useAtlasStore, useLayoutState } from "@manifest-editor/shell";
import { AnnotationPageContext, useCanvas } from "react-iiif-vault";
import { useStore } from "zustand";
import { ANNOTATIONS_LEFT_PANEL_ID, CANVAS_ANNOTATIONS_PANEL_ID } from "./constants";

export const canvasAnnotations: AnnotationPanel = {
  id: CANVAS_ANNOTATIONS_PANEL_ID,
  label: "Canvas annotations",
  render: () => <CanvasAnnotations />,
};

function CanvasAnnotations() {
  const canvas = useCanvas();
  const store = useAtlasStore();
  const toolEnabled = useStore(store, (state) => state.tool.enabled);
  const { leftPanel } = useLayoutState();
  const isLeftPanel = leftPanel.current === ANNOTATIONS_LEFT_PANEL_ID;
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
