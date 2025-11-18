import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import {
  AddImageIcon,
  DeleteForeverIcon,
  ListResizeDragHandle,
  MoreMenuButton,
  SelectionCheckbox,
} from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useGenericEditor, useManifestEditor } from "@manifest-editor/shell";
import { PlusIcon } from "@manifest-editor/ui/icons/PlusIcon";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { useRef, useState } from "react";
import type { TreeItemContentRenderProps, TreeItemProps } from "react-aria-components";
import {
  Button,
  Checkbox,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { flushSync } from "react-dom";
import { LocaleString, useCanvas, useVault } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { useRangeTreeOptions } from "./RangeTree";

interface TreeCanvasItemProps extends Partial<TreeItemProps> {
  rangeItem: RangeTableOfContentsNode;
  parent?: RangeTableOfContentsNode;
}

export function TreeCanvasItem(props: TreeCanvasItemProps) {
  const canvas = useCanvas();
  const vault = useVault();
  const manifestEditor = useManifestEditor();
  const [isActive, setIsActive] = useState(false);
  const { isEditing, showCanvases } = useRangeTreeOptions();
  const popoverRef = useRef<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const removeCanvasFromRange = () => {
    if (!props.parent) {
      // This is the top level one.
      const structures = manifestEditor.structural.structures.getWithoutTracking();
      const index = structures.findIndex((structure) => toRef(structure)?.id === canvas?.id);
      if (index !== -1) manifestEditor.structural.structures.deleteAtIndex(index);
    } else {
      const editor = new EditorInstance({
        reference: { id: props.parent.id, type: "Range" },
        vault,
      });
      const idx = editor.structural.items.getWithoutTracking().findIndex((i) => toRef(i)?.id === canvas?.id);
      if (idx !== -1) editor.structural.items.deleteAtIndex(idx);
    }
  };

  if (!canvas) {
    return null;
  }

  const id = props?.parent?.resource ? `${props.parent.resource.id}$__$${props.rangeItem.id}` : props.rangeItem.id;

  return (
    <TreeItem
      onContextMenu={(e) => {
        if (isEditing) return;
        if (e.button === 2) {
          e.preventDefault();
          flushSync(() => {
            setIsMenuOpen(true);
          });
          if (popoverRef.current) {
            popoverRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          }
        }
      }}
      className={twMerge(
        "react-aria-TreeItem relative hover:bg-gray-100 flex items-center gap-2 overflow-x-clip px-1.5",
        "data-[dragging]:opacity-50",
        isActive && "pt-8 react-aria-TreeItem-active",
      )}
      textValue={getValue(canvas.label)}
      id={id}
      {...props}
      value={props.rangeItem}
    >
      <TreeItemContent>
        {({ allowsDragging, isDragging, selectionBehavior, selectionMode }: TreeItemContentRenderProps) => (
          <>
            <div
              className={twMerge(
                `flex flex-1 min-w-0 truncate whitespace-nowrap items-center gap-2 flex-shrink-0 pl-4`,
                isActive && "pl-4",
                isDragging ? "cursor-grabbing opacity-50" : "cursor-pointer",
              )}
            >
              {selectionMode === "multiple" && <SelectionCheckbox alwaysVisible />}
              <AddImageIcon className="text-xl flex-shrink-0 text-gray-400" />
              <LocaleString>{canvas.label}</LocaleString>
            </div>

            <MenuTrigger isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
              {isEditing ? <MoreMenuButton /> : null}
              <Popover ref={popoverRef} className="bg-white shadow-md rounded-md p-1">
                <Menu>
                  <MenuItem
                    onAction={() =>
                      window.confirm("Are you sure you want to remove this canvas?") && removeCanvasFromRange()
                    }
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex text-red-500 gap-2 items-center"
                  >
                    <DeleteForeverIcon /> Remove canvas
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>

            {isEditing ? <ListResizeDragHandle /> : null}
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
