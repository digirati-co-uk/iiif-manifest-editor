import { useAnnotation, useCanvas, useVault } from "react-iiif-vault";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { SupportedTarget } from "@iiif/vault-helpers";
import { HTMLPortal, ResizeWorldItem } from "@atlas-viewer/atlas";
import { constrainPosition } from "@/helpers/constrain-position";
import { useGenericEditor } from "@/shell/EditingStack/EditingStack";

export function AnnotationTargetEditor() {
  const canvas = useCanvas();
  const annotation = useAnnotation<AnnotationNormalized & { target: SupportedTarget }>();
  const editor = useGenericEditor(annotation ? { id: annotation.id, type: "Annotation" } : undefined);

  const updateAnnotationTarget = (input: any) => {
    if (annotation && canvas) {
      const position = constrainPosition(canvas, input);
      editor.annotation.target.setPosition(position);
    }
  };

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
    return null;
  }

  return (
    <ResizeWorldItem
      {...annotation.target.selector.spatial}
      resizable
      maintainAspectRatio
      disableCardinalControls
      onSave={(newPosition) => {
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
