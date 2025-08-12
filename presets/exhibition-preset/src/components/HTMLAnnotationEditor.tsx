import { ActionButton } from "@manifest-editor/components";
import { useConfig, useGenericEditor, useInlineCreator } from "@manifest-editor/shell";
import { useAnnotation } from "react-iiif-vault";
import { AnnotationBodyEditor } from "./AnnotationBodyEditor";

export function HTMLAnnotationEditor({ className }: { className?: string }) {
  const annotation = useAnnotation();
  const creator = useInlineCreator();
  const bodies = annotation?.body || [];
  const editor = useGenericEditor(annotation);
  const {
    i18n: { defaultLanguage, advancedLanguageMode },
  } = useConfig();

  if (!annotation) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {bodies.map((body, n) => {
        return (
          <AnnotationBodyEditor
            editorClassName={className}
            defaultLanguage={defaultLanguage}
            showLanguage={advancedLanguageMode}
            key={n}
            resourceId={body.id}
            onRemove={() => editor.annotation.body.deleteAtIndex(n)}
          />
        );
      })}

      {advancedLanguageMode ? (
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
                }
              );
            }}
          >
            Add new translation
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}
