import { ReorderList } from "@manifest-editor/editors";
import { useGenericEditor } from "@manifest-editor/shell";
import { AnnotationContext, useAnnotationPage } from "react-iiif-vault/presentation-4";
import { TourAnnotationEditor } from "./TourAnnotationEditor";

export function TourAnnotationPageEditor({
  editAlignment = false,
  reorderable = false,
  tourStyle = "linear",
  useSlideshowWorkbench = false,
}: {
  editAlignment?: boolean;
  reorderable?: boolean;
  tourStyle?: "linear" | "non-linear";
  useSlideshowWorkbench?: boolean;
}) {
  const page = useAnnotationPage();
  const editor = useGenericEditor(page);

  if (!page) {
    return null;
  }

  if (!reorderable) {
    return (
      <>
        {page.items.map((annotation, index) => (
          <AnnotationContext annotation={annotation.id} key={annotation.id}>
            <TourAnnotationEditor
              index={index}
              tourStyle={tourStyle}
              editAlignment={editAlignment}
              useSlideshowWorkbench={useSlideshowWorkbench}
            />
          </AnnotationContext>
        ))}
      </>
    );
  }

  return (
    <>
      <ReorderList
        id={page.id}
        marginBottom="0.5em"
        items={page.items || []}
        inlineHandle={false}
        reorder={({ startIndex, endIndex }) =>
          editor.structural.items.reorder(startIndex, endIndex)
        }
        renderItem={(ref, index) => (
          <AnnotationContext annotation={ref.id as string}>
            <TourAnnotationEditor
              index={index}
              tourStyle={tourStyle}
              editAlignment={editAlignment}
              useSlideshowWorkbench={useSlideshowWorkbench}
            />
          </AnnotationContext>
        )}
      />
    </>
  );
}
