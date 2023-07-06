import { AppDropdownItem } from "@/_components/ui/AppDropdown/AppDropdown";
import { BaseReferenceListEditor } from "@/editor-api/BaseReferenceListEditor";
import { DeleteIcon } from "@/icons/DeleteIcon";
import { DownIcon } from "@/icons/DownIcon";
import { ResetIcon } from "@/icons/ResetIcon";
import { MetadataItem, Reference, SpecificResource } from "@iiif/presentation-3";
import { MetadataEditor } from "@/editor-api/MetadataEditor";

export function createAppActions(
  editor: BaseReferenceListEditor<any, any>
): (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
export function createAppActions(
  editor: MetadataEditor<any>
): (ref: MetadataItem, index: number, item: MetadataItem) => AppDropdownItem[];
export function createAppActions(
  editor: BaseReferenceListEditor<any, any> | MetadataEditor<any>
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
        onClick: () => editor.deleteAtIndex(index),
      },
    ];
  };
}
