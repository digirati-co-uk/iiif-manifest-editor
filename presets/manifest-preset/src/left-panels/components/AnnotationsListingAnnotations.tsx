import {
  AddIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  TargetIcon,
} from "@manifest-editor/components";
import { AnnotationCreationPopup } from "@manifest-editor/editors";
import {
  AnnotationContext,
  CanvasContext,
  useAnnotationPage,
  useCanvas,
  useRenderingStrategy,
  useRequestAnnotation,
  useStrategy,
} from "react-iiif-vault";
import { AnnotationsSidebarListItem } from "./AnnotationsSidebarListItem";

export function AnnotationsListingAnnotations() {
  const canvas = useCanvas();
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
              requestAnnotation({
                type: "box",
                annotationPopup: (
                  <AnnotationCreationPopup
                    annotationPageId={page.id}
                    canvasId={canvas!.id}
                  />
                ),
              })
            },
          },
        ]}
      />
      {isPending ? (
        <div className="bg-me-primary-500 text-white p-2 m-1 rounded flex gap-2">
          <TargetIcon />
          Draw a box on the canvas
        </div>
      ) : null}
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
