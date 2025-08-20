import { ActionButton } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { useInlineCreator } from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";

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
    <div className="flex flex-col items-center justify-center p-4">
      <div className="p-4 opacity-50 text-center">
        This image does not yet have any inline annotations.
      </div>

      <ActionButton
        large
        primary
        onPress={() => createEmptyAnnotationPage()}
      >
        Create empty page
      </ActionButton>
    </div>
  );
}
