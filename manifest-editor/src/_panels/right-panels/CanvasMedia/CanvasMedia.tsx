import { useCanvas } from "react-iiif-vault";
import { limitation } from "@/helpers/limitation";
import invariant from "tiny-invariant";
import { AnnotationPageContext } from "react-iiif-vault";
import { ListAnnotationPage } from "@/_panels/right-panels/CanvasMedia/components/ListAnnotationPage";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { AnnotationPreview } from "@/_components/ui/AnnotationPreview/AnnotationPreview";
import { AnnotationNormalized } from "@iiif/presentation-3";

export function CanvasMedia({ onClickAnnotation }: { onClickAnnotation?: (annotation: AnnotationNormalized) => void }) {
  const canvas = useCanvas();
  const annotationPage = canvas?.items[0];

  if (!canvas) {
    return <div>No canvas selected</div>;
  }

  invariant(annotationPage, "Canvas must have at least one annotation page");
  limitation(canvas.items.length === 1, "We do not support multiple AnnotationPages on canvases");

  return (
    <PaddedSidebarContainer>
      <AnnotationPageContext annotationPage={canvas.items[0].id}>
        <ListAnnotationPage renderAnnotation={() => <AnnotationPreview onClick={onClickAnnotation} />} />
      </AnnotationPageContext>
    </PaddedSidebarContainer>
  );
}
