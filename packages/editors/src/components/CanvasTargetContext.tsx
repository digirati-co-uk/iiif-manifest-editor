import { CanvasContext, useAnnotation } from "react-iiif-vault/presentation-4";
import { toRef } from "@iiif/parser/presentation-4";

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
