import { ActionButton, AddIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { useInlineCreator } from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";
import { AddAnnotationIcon } from "./AnnotationsListingAnnotations";

export function AnnotationsCreateEmptyPage() {
  const canvasRef = useInStack("Canvas");
  const canvasId = canvasRef?.resource.source?.id;
  const canvas = useCanvas({ id: canvasId });
  const creator = useInlineCreator();

  const createEmptyAnnotationPage = () => {
    if (!canvas) return;
    creator.create(
      "@manifest-editor/empty-annotation-page",
      {
        label: { en: ["Inline annotations"] },
      },
      {
        target: {
          id: canvas.id,
          type: "Canvas",
        },
        targetType: "AnnotationPage",
        parent: {
          property: "annotations",
          resource: {
            id: canvas.id,
            type: "Canvas",
          },
        },
      },
    );
  };

  return (
    <Sidebar>
      <SidebarHeader
        title="Annotations"
        actions={[
          {
            icon: <AddAnnotationIcon className="text-2xl" />,
            title: "Add annotation",
            disabled: true,
            onClick: () => void 0,
          },
        ]}
      />
      <SidebarContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="p-4 opacity-50 text-center">
            This canvas does not yet have any inline annotations. To add inline annotations,
            an AnnotationPage is created which will be linked to this canvas, and can
            then used to add your annotations. Simply use the link below to start
            adding your annotations
          </div>

          <ActionButton
            large
            primary
            onPress={() => createEmptyAnnotationPage()}
          >
            <AddIcon className="text-xl" /> Create empty page
          </ActionButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
