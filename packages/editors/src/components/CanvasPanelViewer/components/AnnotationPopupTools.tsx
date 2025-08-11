import { ActionButton } from "@manifest-editor/components";
import { useAtlasStore } from "@manifest-editor/shell";
import { startTransition } from "react";
import { useStore } from "zustand";

export function AnnotationPopupTools() {
  const store = useAtlasStore();
  const changeMode = useStore(store, (state) => state.changeMode);
  const mode = useStore(store, (state) => state.mode);
  const compelteRequest = useStore(store, (state) => state.completeRequest);
  const tool = useStore(store, (state) => state.tool);

  const save = () => {
    startTransition(() => {
      compelteRequest();
    });
  };

  if (!tool.enabled) {
    return null;
  }

  return (
    <div className="animate-fadeIn bg-white shadow rounded">
      {mode !== "sketch" && (
        <ActionButton
          onPress={() => {
            changeMode("sketch");
          }}
        >
          Edit
        </ActionButton>
      )}

      <ActionButton onPress={save}>Save</ActionButton>
    </div>
  );
}
