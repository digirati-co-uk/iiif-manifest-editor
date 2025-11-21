import {
  ActionButton,
  AnnotationPopOutIcon,
  AnnotationPopInIcon,
} from "@manifest-editor/components";
import { useConfig, useSaveConfig } from "@manifest-editor/shell";

export function AnnotationPopUpSwitcherButton() {
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const saveConfig = useSaveConfig();

  return (
    <ActionButton
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
