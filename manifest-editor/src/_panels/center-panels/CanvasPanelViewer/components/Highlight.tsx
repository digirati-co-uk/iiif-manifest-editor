import { useAnnotation, useCanvas } from "react-iiif-vault";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { SupportedTarget } from "@iiif/vault-helpers";
import { BoxStyle } from "@atlas-viewer/atlas";

export function Highlight({ id, style }: { id: string; style?: BoxStyle }) {
  const canvas = useCanvas();
  const annotation = useAnnotation<AnnotationNormalized & { target: SupportedTarget }>({ id } as any);

  if (!annotation || !annotation.target || annotation.target.selector?.type !== "BoxSelector") {
    if (canvas && annotation?.target.selector === null) {
      return (
        <box
          html
          relativeStyle
          interactive={false}
          target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
          style={style || { border: "2px solid #488afc" }}
        />
      );
    }
    return null;
  }

  return (
    <box
      html
      relativeStyle
      interactive={false}
      target={annotation.target.selector.spatial}
      style={style || { border: "2px solid #488afc" }}
    />
  );
}
