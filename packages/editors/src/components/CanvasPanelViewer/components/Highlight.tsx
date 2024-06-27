import { useAnnotation, useCanvas, useVault } from "react-iiif-vault";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { SupportedTarget, SvgSelector } from "@iiif/helpers";
import { BoxStyle } from "@atlas-viewer/atlas";

export function Highlight({ id, style }: { id: string; style?: BoxStyle }) {
  const canvas = useCanvas();
  const annotation = useAnnotation<AnnotationNormalized & { target: SupportedTarget }>({ id } as any);

  if ((annotation as any)?.target.source?.type === "Annotation" && (annotation as any)?.target.source?.id !== id) {
    return <Highlight id={annotation?.target.source?.id as string} style={style} />;
  }

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

    if (canvas && annotation?.target.selector?.type === "SvgSelector") {
      const selector: SvgSelector = annotation?.target.selector!;
      if (!selector.points) return null;
      const Shape = "shape" as any;
      return (
        <Shape
          points={selector.points.map((p) => [p[0], p[1]])}
          open={selector.svgShape === "polyline"}
          relativeStyle={true}
          style={{ border: "2px solid #488afc" }}
          target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
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
