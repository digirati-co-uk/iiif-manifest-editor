import { useTranslations } from "@manifest-editor/i18n";
import { ActionButton, AnnotationPopOutIcon, AnnotationPopInIcon } from "@manifest-editor/components";
import { useConfig, useSaveConfig } from "@manifest-editor/shell";

export function AnnotationPopUpSwitcherButton() {
  const t = useTranslations("editors");
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const saveConfig = useSaveConfig();

  return (
    <ActionButton
      aria-label={t(annotationPopups ? "messages.popupDock" : "messages.popupFloat")}
      className="ml-auto"
      onPress={() =>
        saveConfig({
          editorFeatureFlags: {
            ...editorFeatureFlags,
            annotationPopups: annotationPopups ? false : true,
          },
        })
      }
    >
      {annotationPopups ? <AnnotationPopInIcon /> : <AnnotationPopOutIcon />}
    </ActionButton>
  );
}
