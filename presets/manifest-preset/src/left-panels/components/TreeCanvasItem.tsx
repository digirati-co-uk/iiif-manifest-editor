import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ActionButton, AddImageIcon } from "@manifest-editor/components";
import { ReorderList } from "@manifest-editor/editors";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { useState } from "react";
import type { TreeItemContentRenderProps, TreeItemProps } from "react-aria-components";
import { Button, Checkbox, TreeItem, TreeItemContent } from "react-aria-components";
import { LocaleString, useCanvas } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { useRangeTreeOptions } from "./RangeTree";
import { SplitIcon } from "./SplitIcon";

interface TreeCanvasItemProps extends Partial<TreeItemProps> {
  rangeItem: RangeTableOfContentsNode;
  parent?: RangeTableOfContentsNode;
}

export function TreeCanvasItem(props: TreeCanvasItemProps) {
  const canvas = useCanvas();
  const [isActive, setIsActive] = useState(false);
  const { isEditing, showCanvases } = useRangeTreeOptions();

  if (!canvas) {
    return null;
  }

  const id = props?.parent?.resource ? `${props.parent.resource.id}$__$${props.rangeItem.id}` : props.rangeItem.id;

  return (
    <TreeItem
      className={twMerge(
        "react-aria-TreeItem relative hover:bg-gray-100 flex items-center gap-2 overflow-x-clip px-1.5",
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
            {selectionBehavior === "toggle" && selectionMode !== "none" && <Checkbox slot="selection" />}
            <div
              className={twMerge(
                `flex flex-1 min-w-0 truncate whitespace-nowrap items-center gap-2 flex-shrink-0`,
                isActive && "pl-4",
                isDragging ? "cursor-grabbing opacity-50" : "cursor-pointer",
              )}
            >
              <AddImageIcon className="text-xl flex-shrink-0" />
              <LocaleString>{canvas.label}</LocaleString>
            </div>
            {isEditing ? (
              <Button slot="drag">
                <ResizeHandleIcon className="text-xl" />
              </Button>
            ) : null}
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
