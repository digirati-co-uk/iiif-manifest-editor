import type { AppDropdownItem } from "../components/AppDropdown/AppDropdown";
import { DeleteIcon } from "@manifest-editor/ui/icons/DeleteIcon";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { ResetIcon } from "@manifest-editor/ui/icons/ResetIcon";
import type { MetadataItem, Reference, SpecificResource } from "@iiif/presentation-3";
import type { MetadataEditor, BaseReferenceListEditor } from "@manifest-editor/editor-api";

export function createAppActions(
  editor: BaseReferenceListEditor<any, any>,
  callback: () => void
): (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
export function createAppActions(
  editor: MetadataEditor<any>,
  callback: () => void
): (ref: MetadataItem, index: number, item: MetadataItem) => AppDropdownItem[];
export function createAppActions(
  editor: BaseReferenceListEditor<any, any> | MetadataEditor<any>,
  callback: () => void
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
        label: "Move to start",
        icon: <ResetIcon />,
        onClick: () => editor.moveToStart(index),
      },
      {
        label: "Move to end",
        icon: <DownIcon />,
        onClick: () => editor.moveToEnd(index),
      },
      {
        label: "Delete",
        icon: <DeleteIcon />,
        onClick: () => {
          editor.deleteAtIndex(index);
          callback();
        },
      },
    ];
  };
}

export function emptyCallback() {
  //do nothing
}
