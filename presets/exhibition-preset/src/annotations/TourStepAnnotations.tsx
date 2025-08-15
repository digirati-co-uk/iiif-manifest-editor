import { ViewerAnnotationPage } from "@manifest-editor/editors";
import { type AnnotationPanel, useAtlasStore, useLayoutState } from "@manifest-editor/shell";
import { AnnotationPageContext, useCanvas } from "react-iiif-vault";
import { useStore } from "zustand";

export const tourStepAnnotations: AnnotationPanel = {
  id: "@exhibition/tour-step-annotations",
  label: "Tour steps",
  render: () => <TourStepAnnotations />,
};

function TourStepAnnotations() {
  const canvas = useCanvas();
  const store = useAtlasStore();
  const toolEnabled = useStore(store, (s) => s.tool.enabled);
  const { rightPanel } = useLayoutState();
  const isRightPanel = rightPanel.current === "@manifest-editor/editor";
  const isTour = isRightPanel && rightPanel.state?.currentTab?.startsWith("@exhibition/tour-steps");
  const firstAnnotationPage = canvas?.annotations[0];

  if (!isTour || !canvas || toolEnabled || !firstAnnotationPage) {
    return null;
  }

  return (
    <>
      <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
        <ViewerAnnotationPage />
      </AnnotationPageContext>
    </>
  );
}
