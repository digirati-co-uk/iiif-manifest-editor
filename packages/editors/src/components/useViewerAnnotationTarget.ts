import { useGenericEditor } from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";
import { useAnnotationInfo } from "../hooks/useAnnotationInfo";
import { safelyGetViewerAnnotationTarget } from "./viewer-annotation-target";

export function useViewerAnnotationTarget() {
  const canvas = useCanvas();
  const [annotation, annotationInfo] = useAnnotationInfo();
  const annotationTargetResource =
    "annotationTargetResource" in annotationInfo
      ? annotationInfo.annotationTargetResource
      : undefined;
  const editor = useGenericEditor(annotationTargetResource as any);

  return {
    annotation,
    editor,
    target: safelyGetViewerAnnotationTarget(
      () => editor.annotation.target.getParsedSelector(),
      canvas,
    ),
  };
}
