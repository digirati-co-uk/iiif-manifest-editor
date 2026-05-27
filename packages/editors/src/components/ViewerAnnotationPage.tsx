import { AnnotationContext, useAnnotationPage } from "react-iiif-vault";
import { ViewerAnnotation } from "./ViewerAnnotation";
import { ViewerAnnotationBadge } from "./ViewerAnnotationBadge";

export function ViewerAnnotationPage(props: { showAnnotationNumber?: boolean; style?: any }) {
  const page = useAnnotationPage();
  return (
    <>
      {page?.items?.map((item, index) => {
        return (
          <AnnotationContext annotation={item.id} key={item.id}>
            <ViewerAnnotation style={props.style} />
            {props.showAnnotationNumber && <ViewerAnnotationBadge index={index} />}
          </AnnotationContext>
        );
      })}
    </>
  );
}
