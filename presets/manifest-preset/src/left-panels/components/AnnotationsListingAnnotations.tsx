import { AddIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { AnnotationCreationPopup } from "@manifest-editor/editors";
import {
  AnnotationContext,
  CanvasContext,
  useAnnotationPage,
  useRenderingStrategy,
  useRequestAnnotation,
  useStrategy,
} from "react-iiif-vault";
import { AnnotationsSidebarListItem } from "./AnnotationsSidebarListItem";

export function AnnotationsListingAnnotations() {
  const page = useAnnotationPage();
  const { requestAnnotation, isPending } = useRequestAnnotation();
  const [strategy] = useRenderingStrategy();

  if (strategy.type !== "images") {
    return <div>Not supported</div>;
  }

  if (!page) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader
        title="Annotations"
        actions={[
          {
            icon: <AddIcon />,
            title: "Add annotation",
            disabled: isPending,
            onClick: () => {
              requestAnnotation({ type: "box", annotationPopup: <AnnotationCreationPopup /> }).then((response) => {
                console.log("response", response);
              });
            },
          },
        ]}
      />
      {isPending ? <div>Draw a box or select an annotation tool on the image</div> : null}
      <SidebarContent className="w-full p-2 flex flex-col gap-2">
        {page.items.map((annotation) => {
          return (
            <AnnotationContext key={annotation.id} annotation={annotation.id}>
              <AnnotationsSidebarListItem />
            </AnnotationContext>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
