import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import type {
  TreeItemContentRenderProps,
  TreeItemProps,
} from "react-aria-components";
import {
  Button,
  Checkbox,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { LocaleString } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { ArrowDownIcon } from "./ArrowDownIcon";
import { useRangeTreeOptions } from "./RangeTree";
import { useInStack } from "@manifest-editor/editors";

interface TreeRangeItemProps extends Partial<TreeItemProps> {
  range: RangeTableOfContentsNode;
}

export function TreeRangeItem(props: TreeRangeItemProps) {
  const range = useInStack("Range");
  const isActive = props.range.id === range?.resource.source?.id;

  console.log({ isActive, range });

  const { isEditing, showCanvases } = useRangeTreeOptions();
  return (
    <TreeItem
      className={twMerge(
        "react-aria-TreeItem hover:bg-gray-200 flex items-center gap-2 p-1.5",
        isActive ? "bg-me-primary-500 hover:bg-me-primary-600 text-white" : "",
      )}
      textValue={getValue(props.range.label)}
      id={props.range.id}
      {...props}
    >
      <TreeItemContent>
        {({
          isExpanded,
          selectionBehavior,
          isDropTarget,
          selectionMode,
        }: TreeItemContentRenderProps) => (
          <>
            {selectionBehavior === "toggle" && selectionMode !== "none" && (
              <Checkbox slot="selection" />
            )}

            <Button slot="chevron">
              <ArrowDownIcon
                className={twMerge(
                  "text-xl",
                  !showCanvases &&
                    props.range.isRangeLeaf &&
                    "opacity-20 cursor-not-allowed",
                )}
                style={{
                  transition: "transform .2s",
                  transform: `rotate(${isExpanded ? "0deg" : "-90deg"})`,
                }}
              />
            </Button>

            <div
              className={twMerge(
                "flex items-center gap-2 border-b border-gray-200 flex-1 min-w-0",
                isDropTarget && "bg-me-primary-100/50",
                !showCanvases &&
                  props.range.isRangeLeaf &&
                  "border-transparent",
                isActive && "border-transparent",
              )}
            >
              <LocaleString className="truncate whitespace-nowrap flex-1 min-w-0">
                {props.range.label || "Untitled range"}
              </LocaleString>

              {!showCanvases && props.range.isRangeLeaf ? (
                <div className="text-right bg-gray-200 py-0.5 px-2 text-xs rounded-full text-black/80">
                  {props.range.items?.length}
                </div>
              ) : null}

              {isEditing ? (
                <Button slot="drag">
                  <ResizeHandleIcon className="text-xl" />
                </Button>
              ) : null}
            </div>
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
