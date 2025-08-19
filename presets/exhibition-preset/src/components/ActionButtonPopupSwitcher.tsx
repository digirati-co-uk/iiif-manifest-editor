import { ActionButton } from "@manifest-editor/components";
import { useConfig, useSaveConfig } from "@manifest-editor/shell";

export function ActionButtonPopupSwitcher() {
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const saveConfig = useSaveConfig();

  return (
    <ActionButton
      className="ml-auto"
      onPress={() => saveConfig({ editorFeatureFlags: { ...editorFeatureFlags, annotationPopups: annotationPopups ? false : true } })}
    >
      {annotationPopups ? <PopinIcon /> : <PopoutIcon />}
    </ActionButton>
  );
}
