import { useAnnotationPage } from "../../../hooks/useAnnotationPage";
import { AnnotationPreview } from "./Annotation";

export const AnnotationItems: React.FC<{ pageID: string }> = ({ pageID }) => {
  const annotationPage = useAnnotationPage({ id: pageID });
  if (!annotationPage) return <></>;
  return (
    <>
      {annotationPage.items.map((annotation: any) => {
        return <AnnotationPreview key={annotation.id} id={annotation.id} pageId={pageID} />;
      })}
    </>
  );
};
