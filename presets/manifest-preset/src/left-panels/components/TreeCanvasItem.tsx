import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ActionButton, AddImageIcon } from "@manifest-editor/components";
import type {
  TreeItemContentRenderProps,
  TreeItemProps,
} from "react-aria-components";
import { Checkbox, TreeItem, TreeItemContent } from "react-aria-components";
import { LocaleString, useCanvas } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { SplitIcon } from "./SplitIcon";
import { useState } from "react";

interface TreeCanvasItemProps extends Partial<TreeItemProps> {
  rangeItem: RangeTableOfContentsNode;
  parent?: RangeTableOfContentsNode;
}

export function TreeCanvasItem(props: TreeCanvasItemProps) {
  const canvas = useCanvas();
  const [isActive, setIsActive] = useState(false);

  if (!canvas) {
    return null;
  }

  const id = props?.parent?.resource
    ? `${props.parent.resource.id}$__$${props.rangeItem.id}`
    : props.rangeItem.id;

  return (
    <TreeItem
      className={twMerge(
        "react-aria-TreeItem relative hover:bg-gray-100 flex items-center gap-2 overflow-x-clip",
        isActive && "pt-8 react-aria-TreeItem-active",
      )}
      textValue={getValue(canvas.label)}
      id={id}
      {...props}
      value={props.rangeItem}
    >
      <TreeItemContent>
        {({
          hasChildItems,
          isDragging,
          selectionBehavior,
          selectionMode,
        }: TreeItemContentRenderProps) => (
          <>
            {isActive ? (
              <div className="absolute bg-gray-200 top-0 w-full">
                Empty range
              </div>
            ) : null}
            {selectionBehavior === "toggle" && selectionMode !== "none" && (
              <Checkbox slot="selection" />
            )}
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
            <div>
              <ActionButton
                onPress={() => {
                  setIsActive((a) => !a);
                }}
                className=""
              >
                <SplitIcon />
              </ActionButton>
            </div>
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
