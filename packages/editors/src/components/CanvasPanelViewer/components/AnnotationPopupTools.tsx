import { useEditorsTranslations as useTranslations } from "../../../editor-i18n-context";
import { ActionButton, DeleteForeverIcon, TargetIcon } from "@manifest-editor/components";
import { useAtlasStore } from "@manifest-editor/shell";
import { startTransition } from "react";
import { useStore } from "zustand";
import { CheckIcon } from "./SVGIcons";

export function AnnotationPopupTools() {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
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
    <div className="manifest-editor animate-fadeIn rounded flex gap-1">
      {mode !== "sketch" && (
        <>
          <ActionButton
            onPress={() => {
              changeMode("sketch");
            }}
          >
            <TargetIcon /> {t("ui.editRegion")}
          </ActionButton>
          <ActionButton
            onPress={() => {
              cancelRequest();
            }}
          >
            <DeleteForeverIcon /> {t("ui.discardChanges")}
          </ActionButton>
        </>
      )}

      <ActionButton onPress={save} primary>
        <CheckIcon />
        {commonT("actions.confirm")}
      </ActionButton>
    </div>
  );
}
