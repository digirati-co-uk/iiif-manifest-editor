import { useAnnotation, useCanvas, useVault } from "react-iiif-vault";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { SupportedTarget } from "@iiif/vault-helpers";
import { HTMLPortal, ResizeWorldItem } from "@atlas-viewer/atlas";

export function AnnotationTargetEditor() {
  const vault = useVault();
  const canvas = useCanvas();
  const annotation = useAnnotation<AnnotationNormalized & { target: SupportedTarget }>();

  const updateAnnotationTarget = (position: any) => {
    if (annotation && canvas) {
      const newTarget = `xywh=${~~position.x},${~~position.y},${~~position.width},${~~position.height}`;
      vault.modifyEntityField(annotation as any, "target", `${canvas.id}#${newTarget}`);
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
