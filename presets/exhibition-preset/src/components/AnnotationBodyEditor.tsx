import { ActionButton, HTMLEditor } from "@manifest-editor/components";
import { Input, Label } from "@manifest-editor/editors";
import { useGenericEditor } from "@manifest-editor/shell";
import { useEffect } from "react";

export function AnnotationBodyEditor({
  editorClassName,
  className,
  resourceId,
  onRemove,
  defaultLanguage = "en",
  showLanguage = false,
}: {
  editorClassName?: string;
  className?: string;
  resourceId: string;
  onRemove: () => void;
  defaultLanguage?: string;
  showLanguage?: boolean;
}) {
  const editor = useGenericEditor({
    id: resourceId as string,
    type: "ContentResource",
  });
  const { language, value } = editor.descriptive;

  useEffect(() => {
    if (!showLanguage) {
      language.set(defaultLanguage as any);
    }
  }, [showLanguage]);

  return (
    <div className={className}>
      <div className="flex gap-4 items-center">
        {showLanguage ? (
          <>
            <Label>Language</Label>
            <div className="w-32">
              <Input value={language.get() || ""} onChange={(newValue) => language.set(newValue.target.value as any)} />
            </div>
            <ActionButton
              onPress={() => {
                if (confirm("Do you want to remove this body?")) {
                  onRemove();
                }
              }}
            >
              Remove
            </ActionButton>
          </>
        ) : null}
      </div>
      <div className="prose-headings:mt-1 prose-headings:mb-1 prose-sm">
        <HTMLEditor
          className={editorClassName}
          value={value.get() || ""}
          onChange={(newValue) => value.set(newValue)}
        />
      </div>
    </div>
  );
}
