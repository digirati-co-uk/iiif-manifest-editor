import {
  ActionButton,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  TargetIcon,
} from "@manifest-editor/components";
import { AnnotationCreationPopup } from "@manifest-editor/editors";
import {
  AnnotationContext,
  useAnnotationPage,
  useCanvas,
  useRenderingStrategy,
  useRequestAnnotation,
} from "react-iiif-vault";
import { AddAnnotationIcon } from "../icons";
import { AnnotationsSidebarListItem } from "./AnnotationsSidebarListItem";
import { AnnotationsOcrActions } from "./AnnotationsOcrActions";

export function AnnotationsListingAnnotations() {
  const canvas = useCanvas();
  const page = useAnnotationPage();
  const { requestAnnotation, isActive, busy, cancelRequest } =
    useRequestAnnotation();
  const [strategy] = useRenderingStrategy();

  if (strategy.type !== "images") {
    return <div>Not supported</div>;
  }

  if (!page) {
    return null;
  }

  const createAnnotation = () =>
    requestAnnotation({
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
            icon: <AddAnnotationIcon className="text-2xl" />,
            title: "Add annotation",
            disabled: isActive || busy,
            onClick: createAnnotation,
          },
        ]}
      />
      {isActive ? (
        <>
          <button
            aria-label="cancel add annotation"
            className="m-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            type="button"
            onClick={() => cancelRequest()}
          >
            Exit edit mode
          </button>
          <div className="flex flex-col gap-5 text-center p-4 items-center justify-center">
            <TargetIcon className="w-32 h-32 text-gray-300" />
            <p className="text-gray-500">Draw a box on the canvas</p>
          </div>
        </>
      ) : null}
      <SidebarContent className="w-full p-2 flex flex-col gap-2">
        {page.items.map((annotation) => (
          <AnnotationContext key={annotation.id} annotation={annotation.id}>
            <AnnotationsSidebarListItem />
          </AnnotationContext>
        ))}

        {!isActive && page.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="p-4 opacity-50 text-center">
              This canvas does not yet have any inline annotations.
            </div>

            <ActionButton
              large
              primary
              isDisabled={isActive}
              onPress={() => createAnnotation()}
            >
              <AddAnnotationIcon className="text-xl" /> Add annotation
            </ActionButton>

            <AnnotationsOcrActions />
          </div>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
