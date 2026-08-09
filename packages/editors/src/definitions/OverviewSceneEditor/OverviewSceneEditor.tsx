import { getValue } from "@iiif/helpers";
import { ActionButton, AddIcon, PaddedSidebarContainer } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditor, useGenericEditor } from "@manifest-editor/shell";
import { useVault } from "react-iiif-vault";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { Input, InputContainer, InputLabel } from "../../components/Input";

export function OverviewSceneEditor() {
  const resource = useEditingResource();
  const editor = useEditor();
  const scene = resource?.resource as any;
  const page = editor.structural.items.get()?.[0] as any;

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
        <Input
          id={editor.technical.backgroundColor.focusId()}
          value={editor.technical.backgroundColor.get() || ""}
          onChange={(event) => editor.technical.backgroundColor.set(event.target.value || null)}
        />
      </InputContainer>
      {page && scene ? <SceneItems page={page} scene={scene} /> : <p>This scene has no annotation page.</p>}
    </PaddedSidebarContainer>
  );
}

function SceneItems({ page, scene }: { page: any; scene: any }) {
  const vault = useVault();
  const pageEditor = useGenericEditor(page, { parent: scene, parentProperty: "items", index: 0 });
  const [canCreate, actions] = useCreator(page, "items", "Annotation", scene, { isPainting: true });
  const items = pageEditor.structural.items.get() || [];

  return (
    <div className="flex flex-col gap-2">
      <InputLabel>Scene contents</InputLabel>
      {items.length ? (
        items.map((item: any, index: number) => (
          <button
            className="w-full rounded border border-gray-300 bg-white p-3 text-left hover:border-me-500"
            key={item.id}
            type="button"
            onClick={() => actions.edit(item, index)}
          >
            {getValue(vault.get(item)?.label) || item.id}
          </button>
        ))
      ) : (
        <p className="text-sm text-gray-500">No models, cameras, or lights yet.</p>
      )}
      {canCreate ? (
        <ActionButton onPress={() => actions.create()}>
          <AddIcon /> Add to scene
        </ActionButton>
      ) : null}
    </div>
  );
}
