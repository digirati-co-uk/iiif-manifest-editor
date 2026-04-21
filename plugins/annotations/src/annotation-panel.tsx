import { useInStack } from "@manifest-editor/editors";
import type { LayoutPanel } from "@manifest-editor/shell";
import { AnnotationPageContext, CanvasContext, useCanvas } from "react-iiif-vault";
import { ANNOTATIONS_LEFT_PANEL_ID } from "./constants";
import { AnnotationsCreateEmptyPage } from "./components/AnnotationsCreateEmptyPage";
import { AnnotationsListingAnnotations } from "./components/AnnotationsListingAnnotations";
import { AnnotationsIcon } from "./icons";

export const annotationsPanel: LayoutPanel = {
  id: ANNOTATIONS_LEFT_PANEL_ID,
  label: "Annotations",
  icon: <AnnotationsIcon />,
  render: () => <AnnotationsPanel />,
};

function AnnotationsPanel() {
  const canvasRef = useInStack("Canvas");
  const canvasId = canvasRef?.resource.source?.id;
  const canvas = useCanvas({ id: canvasId });
  const firstPage = canvas?.annotations[0];

  if (!canvas) {
    return (
      <div className="flex flex-col gap-5 text-center p-4 items-center justify-center">
        <AnnotationsIcon className="w-32 h-32 text-gray-300" />
        <p className="text-gray-500">
          Annotations are associated with Canvases in a IIIF Manifest. To view or add annotations, first create a
          Canvas and then select the Annotations link
        </p>
      </div>
    );
  }

  if (firstPage) {
    return (
      <AnnotationPageContext annotationPage={firstPage.id}>
        <CanvasContext canvas={canvas.id}>
          <AnnotationsListingAnnotations />
        </CanvasContext>
      </AnnotationPageContext>
    );
  }

  return (
    <CanvasContext canvas={canvas.id}>
      <AnnotationsCreateEmptyPage />
    </CanvasContext>
  );
}
