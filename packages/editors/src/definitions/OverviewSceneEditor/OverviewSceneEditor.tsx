import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor, useLayoutActions } from "@manifest-editor/shell";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { Input, InputContainer, InputLabel } from "../../components/Input";

export function OverviewSceneEditor() {
  const editor = useEditor();
  const layout = useLayoutActions();

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        focusId={editor.descriptive.label.focusId()}
        label="Label"
        fields={editor.descriptive.label.get()}
        onSave={(value: any) => editor.descriptive.label.set(value.toInternationalString())}
      />
      <InputContainer $wide>
        <InputLabel htmlFor={editor.technical.backgroundColor.focusId()}>Background colour</InputLabel>
        <div className="flex gap-2">
          <Input
            aria-label="Scene background colour picker"
            className="h-10 w-12 shrink-0 p-1"
            type="color"
            value={editor.technical.backgroundColor.get() || "#111111"}
            onChange={(event) => editor.technical.backgroundColor.set(event.target.value)}
          />
          <Input
            id={editor.technical.backgroundColor.focusId()}
            value={editor.technical.backgroundColor.get() || ""}
            placeholder="#111111"
            onChange={(event) => editor.technical.backgroundColor.set(event.target.value || null)}
          />
        </div>
      </InputContainer>
      <div className="border-t border-gray-200 pt-4">
        <p className="mb-3 text-sm text-gray-600">
          Models, cameras, and lights are organised in the Scene contents panel.
        </p>
        <ActionButton onPress={() => layout.leftPanel.open({ id: "scene-contents" })}>Open Scene contents</ActionButton>
      </div>
    </PaddedSidebarContainer>
  );
}
