import { ActionButton, DeleteForeverIcon, TargetIcon } from "@manifest-editor/components";
import { useAtlasStore } from "@manifest-editor/shell";
import { startTransition } from "react";
import { useStore } from "zustand";
import { CheckIcon } from "./SVGIcons";

export function AnnotationPopupTools() {
  const store = useAtlasStore();
  const changeMode = useStore(store, (state) => state.changeMode);
  const mode = useStore(store, (state) => state.mode);
  const compelteRequest = useStore(store, (state) => state.completeRequest);
  const cancelRequest = useStore(store, (state) => state.cancelRequest);
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
    <div className="animate-fadeIn rounded flex gap-1">
      {mode !== "sketch" && (
        <>
          <ActionButton
            onPress={() => {
              changeMode("sketch");
            }}
          >
            <TargetIcon /> Edit region
          </ActionButton>
          <ActionButton
            onPress={() => {
              cancelRequest();
            }}
          >
            <DeleteForeverIcon /> Discard changes
          </ActionButton>
        </>
      )}

      <ActionButton onPress={save} primary>
        <CheckIcon />
        Confirm
      </ActionButton>
    </div>
  );
}
