import type { Translate } from "@manifest-editor/i18n";
import type { AppDropdownItem } from "../components/AppDropdown/AppDropdown";
import { DeleteIcon } from "@manifest-editor/ui/icons/DeleteIcon";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { ResetIcon } from "@manifest-editor/ui/icons/ResetIcon";
import type { MetadataItem, Reference, SpecificResource } from "@iiif/presentation-3";
import type { MetadataEditor, BaseReferenceListEditor } from "@manifest-editor/editor-api";

export function createAppActions(
  editor: BaseReferenceListEditor<any, any>,
  callback?: () => void | undefined,
  t?: Translate,
  common?: Translate
): (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
export function createAppActions(
  editor: MetadataEditor<any>,
  callback?: () => void,
  t?: Translate,
  common?: Translate
): (ref: MetadataItem, index: number, item: MetadataItem) => AppDropdownItem[];
export function createAppActions(
  editor: BaseReferenceListEditor<any, any> | MetadataEditor<any>,
  callback?: () => void,
  t?: Translate,
  common?: Translate
): (
  ref: MetadataItem | Reference,
  index: number,
  item: MetadataItem | Reference | SpecificResource
) => AppDropdownItem[] {
  return (ref, index, item) => {
    const hasMultiple = editor.get();

    if (hasMultiple.length === 0) {
      return [];
    }

    return [
      {
        label: t ? t("ui.moveToStart") : "Move to start",
        icon: <ResetIcon />,
        onClick: () => editor.moveToStart(index),
      },
      {
        label: t ? t("ui.moveToEnd") : "Move to end",
        icon: <DownIcon />,
        onClick: () => editor.moveToEnd(index),
      },
      {
        label: common ? common("actions.delete") : "Delete",
        icon: <DeleteIcon />,
        onClick: () => {
          editor.deleteAtIndex(index);
          callback && callback();
        },
      },
    ];
  };
}
