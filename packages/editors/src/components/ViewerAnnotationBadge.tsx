import { HTMLPortal } from "@atlas-viewer/atlas";
import { useViewerAnnotationTarget } from "./useViewerAnnotationTarget";

export function ViewerAnnotationBadge(props: { index: number }) {
  const { annotation, target } = useViewerAnnotationTarget();

  if (!annotation || !target?.spatial) {
    return null;
  }

  return (
    <HTMLPortal target={target?.spatial! as any} relative={true}>
      <div className="bg-red-500 text-white py-1 absolute top-1 right-1 px-2 rounded">{props.index + 1}</div>
    </HTMLPortal>
  );
}
