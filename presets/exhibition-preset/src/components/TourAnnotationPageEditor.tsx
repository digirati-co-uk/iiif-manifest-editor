import { ReorderList } from "@manifest-editor/editors";
import { useGenericEditor } from "@manifest-editor/shell";
import { AnnotationContext, useAnnotationPage } from "react-iiif-vault";
import { TourAnnotationEditor } from "./TourAnnotationEditor";

export function TourAnnotationPageEditor({
  reorderable = false,
  useSlideshowWorkbench = false,
}: {
  reorderable?: boolean;
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
        {page.items.map((annotation) => (
          <AnnotationContext annotation={annotation.id} key={annotation.id}>
            <TourAnnotationEditor
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
              useSlideshowWorkbench={useSlideshowWorkbench}
            />
          </AnnotationContext>
        )}
      />
    </>
  );
}
