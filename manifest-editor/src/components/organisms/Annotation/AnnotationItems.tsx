import { useAnnotationPage } from "../../../hooks/useAnnotationPage";
import { Annotation } from "./Annotation";

export const AnnotationItems: React.FC<{ pageID: string }> = ({ pageID }) => {
  const annotationPage = useAnnotationPage({ id: pageID });
  if (!annotationPage) return <></>;
  return (
    <>
      {annotationPage.items.map((annotation: any) => {
        return <Annotation key={annotation.id} id={annotation.id} pageId={pageID} />;
      })}
    </>
  );
};
