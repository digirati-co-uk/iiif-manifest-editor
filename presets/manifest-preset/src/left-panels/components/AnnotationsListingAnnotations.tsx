import {
    ActionButton,
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
  const { requestAnnotation, isActive, busy } = useRequestAnnotation();
  const [strategy] = useRenderingStrategy();

  if (strategy.type !== "images") {
    return <div>Not supported</div>;
  }

  if (!page) {
    return null;
  }

  const createAnnotation = () => requestAnnotation({
    type: "box",
    annotationPopup: (
      <AnnotationCreationPopup
        annotationPageId={page.id}
        canvasId={canvas!.id}
      />
    ),
  });

  return (
    <Sidebar>
      <SidebarHeader
        title="Annotations"
        actions={[
          {
            icon: <AddIcon />,
            title: "Add annotation",
            disabled: isActive || busy,
            onClick: createAnnotation,
          },
        ]}
      />
      {isActive ? (
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

        {page.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="p-4 opacity-50 text-center">
              This image does not yet have any inline annotations.
            </div>

            <ActionButton
              large
              primary
              isDisabled={isActive}
              onPress={() => createAnnotation()}
            >
              Start annotating
            </ActionButton>
          </div>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
