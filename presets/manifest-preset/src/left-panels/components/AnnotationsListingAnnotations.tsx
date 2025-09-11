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
import { SecondaryButton, SmallButton } from "@manifest-editor/ui/atoms/Button";

export function AddAnnotationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}<path fill="currentColor" d="M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12zm1-10h2v3h3v2h-3v3h-2v-3H8V9h3z" /></svg>
  )
}

export function AnnotationsListingAnnotations() {
  const canvas = useCanvas();
  const page = useAnnotationPage();
  const { requestAnnotation, isActive, busy, cancelRequest } = useRequestAnnotation();
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
            icon: <AddAnnotationIcon className="text-2xl" />,
            title: "Add annotation",
            disabled: isActive || busy,
            onClick: createAnnotation,
          },
        ]}
      />
      {isActive ? (
        <>
        <SecondaryButton onClick={() => {cancelRequest()}}>Exit edit mode </SecondaryButton>
        <div className="flex flex-col gap-5 text-center p-4 items-center justify-center">
          <TargetIcon className="w-32 h-32 text-gray-300" />
          <p className="text-gray-500">
            Draw a box on the canvas

          </p>
        </div>
        </>
      ) : null}
      <SidebarContent className="w-full p-2 flex flex-col gap-2">
        {page.items.map((annotation) => {
          return (
            <AnnotationContext key={annotation.id} annotation={annotation.id}>
              <AnnotationsSidebarListItem />
            </AnnotationContext>
          );
        })}

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
          </div>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
