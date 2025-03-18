import { ActionButton } from "@manifest-editor/components";
import { useGenericEditor, useInlineCreator } from "@manifest-editor/shell";
import { useAnnotation } from "react-iiif-vault";
import { AnnotationBodyEditor } from "./AnnotationBodyEditor";

export function HTMLAnnotationEditor() {
  const annotation = useAnnotation();
  const creator = useInlineCreator();
  const bodies = annotation?.body || [];
  const editor = useGenericEditor(annotation);

  if (!annotation) {
    return null;
  }

  //add more html editing wizygiv stuff to this
  // h1 h2 h3
  // theres a tailwind plugin for styles - pros (tailwind typography)

  return (
    <div className="flex flex-col gap-4">
      {bodies.map((body, n) => {
        return (
          <AnnotationBodyEditor
            key={n}
            resourceId={body.id}
            onRemove={() => editor.annotation.body.deleteAtIndex(n)}
          />
        );
      })}

      <div className="">
        <ActionButton
          primary
          onPress={() => {
            creator.create(
              "@manifest-editor/html-body-creator",
              { language: "en", value: "" },
              {
                targetType: "ContentResource",
                parent: {
                  property: "body",
                  resource: {
                    id: annotation.id,
                    type: "Annotation",
                  },
                },
                initialData: {},
              },
            );
          }}
        >
          Add new translation
        </ActionButton>
      </div>
    </div>
  );
}
