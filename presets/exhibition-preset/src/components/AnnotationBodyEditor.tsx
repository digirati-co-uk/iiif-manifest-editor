import { ActionButton, HTMLEditor } from "@manifest-editor/components";
import { Input, Label } from "@manifest-editor/editors";
import { useGenericEditor } from "@manifest-editor/shell";

export function AnnotationBodyEditor({
  className,
  resourceId,
  onRemove,
}: { className?: string; resourceId: string; onRemove: () => void }) {
  const editor = useGenericEditor({
    id: resourceId as string,
    type: "ContentResource",
  });
  const { language, value } = editor.descriptive;

  return (
    <div className={className}>
      <div className="flex gap-4 mb-4 items-center">
        <Label>Language</Label>
        <div className="w-32">
          <Input
            value={language.get() || ""}
            onChange={(newValue) => language.set(newValue.target.value as any)}
          />
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
      </div>
      <div className="prose-xl">
        <HTMLEditor
          value={value.get() || ""}
          onChange={(newValue) => value.set(newValue)}
        />
      </div>
    </div>
  );
}
