import { polygonToBoundingBox, useAtlasStore } from "@manifest-editor/shell";
import { useMemo } from "react";
import { useCanvas } from "react-iiif-vault";
import { useStore } from "zustand";
import { AnnotationPopupTools } from "./AnnotationPopupTools";
import { RenderHighlightAnnotation } from "./RenderHighlightedAnnotation";
import { SVGAnnotationEditor } from "./SVGAnnotationEditor";

export function RenderAnnotationEditing() {
  const store = useAtlasStore();
  const canvas = useCanvas();

  const currentShape = useStore(store, (state) => state.polygon);
  const mode = useStore(store, (state) => state.mode);
  const tooltype = useStore(store, (state) => state.toolType);
  const changeMode = useStore(store, (state) => state.changeMode);
  const isTransitioning = useStore(
    store,
    (state) => state.polygonState.transitioning,
  );
  const { enabled, requestId } = useStore(store, (state) => state.tool);
  const boundingBox = useMemo(
    () => polygonToBoundingBox(currentShape),
    [currentShape],
  );

  const onClick = () => {
    changeMode("sketch");
  };

  if (!enabled || !canvas || !requestId || !currentShape) {
    return null;
  }

  const popup =
    boundingBox && currentShape.id && !isTransitioning ? (
      <RenderHighlightAnnotation
        annotation={currentShape as any}
        target={boundingBox}
      >
        <AnnotationPopupTools />
      </RenderHighlightAnnotation>
    ) : null;

  if (mode === "explore") {
    const Shape = "shape" as any;

    return (
      <>
        <Shape
          id={`shape-${currentShape.id}`}
          points={currentShape.points}
          open={currentShape.open}
          onClick={onClick}
          relativeStyle={true}
          target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
          style={{
            ":hover": {
              backgroundColor: "rgba(0,0,0,0.2)",
            },
            backgroundColor: "rgba(0,0,0,0)",
            borderWidth: "4px",
            borderColor: "rgba(255, 255, 255, .4)",
          }}
        />
        <Shape
          id={`shape-${currentShape.id}`}
          points={currentShape.points}
          open={currentShape.open}
          onClick={onClick}
          relativeStyle={true}
          target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
          style={{
            backgroundColor: "rgba(0,0,0,0)",
            borderWidth: "2px",
            borderColor: "rgba(0, 0, 0, .4)",
          }}
        />
        {popup}
      </>
    );
  }

  if (tooltype === "target") {
    // return <BoxAnnotationEditor image={canvas} />
  }

  return (
    <>
      <SVGAnnotationEditor image={canvas} />
      {popup}
    </>
  );
}
