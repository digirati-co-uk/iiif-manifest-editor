import { useTranslations } from "@manifest-editor/i18n";
import { ActionButton, HTMLEditor } from "@manifest-editor/components";
import { useGenericEditor } from "@manifest-editor/shell";
import { useEffect } from "react";
import { Input, Label } from "../";

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
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const editor = useGenericEditor({
    id: resourceId as string,
    type: "ContentResource",
  });
  const { language, value } = editor.descriptive;

  useEffect(() => {
    if (!showLanguage && !language.get()) {
      language.set(defaultLanguage as any);
    }
  }, [showLanguage, defaultLanguage, language]);

  return (
    <div className={className}>
      <div className="flex gap-4 items-center">
        {showLanguage ? (
          <>
            <Label>{t("fields.language")}</Label>
            <div className="w-32">
              <Input value={language.get() || ""} onChange={(newValue) => language.set(newValue.target.value as any)} />
            </div>
            <ActionButton
              onPress={() => {
                if (confirm(t("messages.removeBodyConfirm"))) {
                  onRemove();
                }
              }}
            >
              {commonT("actions.remove")}
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
