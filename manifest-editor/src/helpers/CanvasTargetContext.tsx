import { CanvasContext, useAnnotation } from "react-iiif-vault";
import { toRef } from "@iiif/parser";

export function CanvasTargetContext({ children }: { children: any }) {
  const annotation = useAnnotation();
  if (annotation && annotation.target && annotation.target) {
    const ref = toRef(annotation.target);
    if (ref) {
      return <CanvasContext canvas={ref.id}>{children}</CanvasContext>;
    }
  }
  return children;
}
