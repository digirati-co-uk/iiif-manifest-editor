import { AnnotationContext, useAnnotationPage } from "react-iiif-vault";
import { ViewerAnnotation } from "./ViewerAnnotation";

export function ViewerAnnotationPage() {
  const page = useAnnotationPage();
  return (
    <>
      {page?.items?.map((item) => {
        return (
          <AnnotationContext annotation={item.id} key={item.id}>
            <ViewerAnnotation />
          </AnnotationContext>
        );
      })}
    </>
  );
}
