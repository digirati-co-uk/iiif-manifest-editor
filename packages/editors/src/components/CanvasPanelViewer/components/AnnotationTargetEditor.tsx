import { PolygonSelector, RenderSvgEditorControls, useAnnotation, useCanvas, useVault } from "react-iiif-vault";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { SupportedTarget, SvgSelector } from "@iiif/helpers";
import { HTMLPortal, ResizeWorldItem, useMode } from "@atlas-viewer/atlas";
import { constrainPosition } from "../../../helpers/constrain-position";
import { useGenericEditor } from "@manifest-editor/shell";

export function AnnotationTargetEditor() {
  const canvas = useCanvas();
  const annotation = useAnnotation<AnnotationNormalized & { target: SupportedTarget }>();
  const editor = useGenericEditor(annotation ? { id: annotation.id, type: "Annotation" } : undefined);

  const updateAnnotationTarget = (input: any) => {
    if (input.type === "polygon" && canvas) {
      editor.annotation.target.setSvgSelector(input.shape, canvas);
      return;
    }
    if (annotation && canvas) {
      const position = constrainPosition(canvas, input);
      editor.annotation.target.setPosition(position);
    }
  };

  const isSpatial = editor.annotation.body.isSpatial();

  if (!annotation) {
    return null;
  }

  if (!annotation || !annotation.target || annotation.target.selector?.type !== "BoxSelector") {
    // Refused to show the resizing if it's targeting the whole canvas.
    if (canvas && annotation?.target.selector === null) {
      return (
        <box
          relativeStyle
          interactive={false}
          target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
          style={{ border: "2px solid blue" }}
        />
      );
    }

    // Svg.
    if (canvas && annotation?.target.selector?.type === "SvgSelector") {
      const selector: SvgSelector = annotation?.target.selector!;
      if (!selector.points) return null;
      console.log("selector =>", selector);
      return (
        <PolygonSelector
          id={annotation.id}
          updatePolygon={(data) => {
            console.log("UPDATE POLYGON", data);
            updateAnnotationTarget({
              type: "polygon",
              shape: data,
            });
          }}
          polygon={{ id: annotation.id, open: selector.svgShape === "polyline", points: selector.points }}
          annotationBucket="default"
          renderControls={(helper, state, showShapes) => (
            <>
              <RenderSvgEditorControls helper={helper} state={state} showShapes={showShapes} />
            </>
          )}
        />
      );
    }

    return null;
  }

  return (
    <ResizeWorldItem
      {...annotation.target.selector.spatial}
      resizable
      maintainAspectRatio={isSpatial}
      disableCardinalControls={isSpatial}
      onSave={(newPosition: any) => {
        updateAnnotationTarget(newPosition);
      }}
    >
      <HTMLPortal>
        {/* Things can go in here. */}
        {null}
      </HTMLPortal>
    </ResizeWorldItem>
  );
}
