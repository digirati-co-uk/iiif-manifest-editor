import { HTMLPortal } from "@atlas-viewer/atlas";
import { useGenericEditor } from "@manifest-editor/shell";
import { useAnnotation } from "react-iiif-vault";
import { useAnnotationInfo } from "../hooks/useAnnotationInfo";

export function ViewerAnnotationBadge(props: { index: number }) {
  const [annotation, annotationInfo] = useAnnotationInfo();
  const annotationTargetResource = "annotationTargetResource" in annotationInfo ? annotationInfo.annotationTargetResource : undefined;

  const editor = useGenericEditor(annotationTargetResource as any);
  const target = editor.annotation.target.getParsedSelector();

  if (!annotation || !target?.spatial) {
    return null;
  }

  return (
    <HTMLPortal target={target?.spatial! as any} relative={true}>
      <div className="bg-red-500 text-white py-1 absolute top-1 right-1 px-2 rounded">{props.index + 1}</div>
    </HTMLPortal>
  );
}
