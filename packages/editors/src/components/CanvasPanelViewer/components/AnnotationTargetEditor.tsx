import { HTMLPortal, useMode } from "@atlas-viewer/atlas";
import type { SvgSelector } from "@iiif/helpers";
import { useGenericEditor } from "@manifest-editor/shell";
import { PolygonSelector, RenderSvgEditorControls, useAnnotation, useCanvas, useVault } from "react-iiif-vault/presentation-4";
import { constrainPosition } from "../../../helpers/constrain-position";
import { ResizeWorldItem } from "./ResizeWorldItem";

export function AnnotationTargetEditor() {
  const canvas = useCanvas();
  const annotation = useAnnotation();
  const editor = useGenericEditor(annotation ? { id: annotation.id, type: "Annotation" } : undefined);
  const selector = editor.annotation.target.getParsedSelector();

  const updateAnnotationTarget = (input: any) => {
    if (input.type === "polygon" && canvas) {
      // Check if the polygon is a rectangle.
      const points = input.shape.points;
      if (
        points.length === 4 &&
        points[0][0] === points[3][0] &&
        points[1][0] === points[2][0] &&
        points[0][1] === points[1][1] &&
        points[2][1] === points[3][1]
      ) {
        const x = points[0][0];
        const y = points[0][1];
        const width = points[1][0] - points[0][0];
        const height = points[2][1] - points[0][1];
        const target = { x, y, width, height };
        const position = constrainPosition(canvas, target);
        editor.annotation.target.setPosition(position);
        return;
      }

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

  if (!annotation.target || selector?.type !== "BoxSelector") {
    // Refused to show the resizing if it's targeting the whole canvas.
    if (canvas && selector === null) {
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
    if (canvas && selector?.type === "SvgSelector") {
      const svgSelector: SvgSelector = selector;
      if (!svgSelector.points) return null;
      return (
        <PolygonSelector
          id={annotation.id}
          updatePolygon={(data) => {
            updateAnnotationTarget({
              type: "polygon",
              shape: data,
            });
          }}
          polygon={{
            id: annotation.id,
            open: svgSelector.svgShape === "polyline",
            points: svgSelector.points,
          }}
          annotationBucket="default"
          renderControls={(helper, state, showShapes) => (
            <>
              <RenderSvgEditorControls showShapes={showShapes} />
            </>
          )}
        />
      );
    }

    return null;
  }

  const firstBody = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
  const bodyWidth = (firstBody as any)?.width;
  const bodyHeight = (firstBody as any)?.height;
  const bodyAspectRatio = bodyWidth && bodyHeight ? bodyWidth / bodyHeight : undefined;

  return (
    <ResizeWorldItem
      {...selector.spatial}
      resizable
      aspectRatio={isSpatial ? bodyAspectRatio : undefined}
      maintainAspectRatio={isSpatial}
      disableCardinalControls={isSpatial}
      onSave={(newPosition: any) => {
        if (bodyAspectRatio && isSpatial) {
          // Increase height to make sure the aspect ratio is preserved.
          const newHeight = Math.round(newPosition.width / bodyAspectRatio);
          if (Number.isInteger(newHeight)) {
            newPosition.height = newHeight;
          }
        }
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
