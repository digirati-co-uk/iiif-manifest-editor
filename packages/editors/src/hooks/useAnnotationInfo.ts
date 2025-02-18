import { isSpecificResource } from "@iiif/parser";
import { useHoverHighlightImageResource } from "@manifest-editor/shell";
import { useAnnotation } from "react-iiif-vault";

export function useAnnotationInfo() {
  const annotation = useAnnotation();
  const highlightProps = useHoverHighlightImageResource(annotation?.id);

  if (!annotation) {
    return [
      null,
      {
        highlightProps: {},
        isValid: false,
        annotationTarget: null,
        firstBody: null,
        item: null,
      },
    ] as const;
  }

  const body = annotation?.body;
  const firstBody = (body || [])[0] as any;
  const item = isSpecificResource(firstBody) ? firstBody.source : firstBody;

  const isValid: boolean = !!(item && (item.type === "Image" || item.type === "Sound" || item.type === "Video"));
  const annotationTarget: string | null =
    (annotation as any)?.target.source?.type === "Annotation" ? (annotation as any)?.target.source?.id : null;

  return [
    annotation,
    {
      highlightProps,
      isValid,
      annotationTarget,
      firstBody,
      item,
    },
  ] as const;
}
