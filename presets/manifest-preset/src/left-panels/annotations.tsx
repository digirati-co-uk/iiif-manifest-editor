import { useInStack } from "@manifest-editor/editors";
import type { LayoutPanel } from "@manifest-editor/shell";
import { AnnotationPageContext, CanvasContext, useCanvas } from "react-iiif-vault";
import { AnnotationsCreateEmptyPage } from "./components/AnnotationsCreateEmptyPage";
import { AnnotationsListingAnnotations } from "./components/AnnotationsListingAnnotations";

export const annotationsPanel: LayoutPanel = {
  id: "@manifest-editor/canvas-annotation-listing",
  label: "Annotations",
  icon: <AnnotationsIcon />,
  render: () => {
    return <AnnotationsPanel />;
  },
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
          Annotations are associated with Canvases in a IIIF Manifest. To view or add
          annotations, first create a Canvas and then select the Annotations link
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

export function AnnotationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.17l-.59.59l-.58.58V4h16zm-9.5-2H18v-2h-5.5zm3.86-5.87c.2-.2.2-.51 0-.71l-1.77-1.77c-.2-.2-.51-.2-.71 0L6 11.53V14h2.47z"
      />
    </svg>
  );
}
