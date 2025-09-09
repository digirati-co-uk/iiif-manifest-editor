import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
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
import { ArrowDownIcon } from "./ArrowDownIcon";
import { ActionButton } from "@manifest-editor/components";
import { SplitIcon } from "./SplitIcon";

interface TreeRangeItemProps extends Partial<TreeItemProps> {
  range: RangeTableOfContentsNode;
}

export function TreeRangeItem(props: TreeRangeItemProps) {
  return (
    <TreeItem
      className="react-aria-TreeItem hover:bg-gray-100 flex items-center gap-2"
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
                className="text-xl"
                style={{
                  transition: "transform .2s",
                  transform: `rotate(${isExpanded ? "0deg" : "-90deg"})`,
                }}
              />
            </Button>

            <LocaleString className="truncate whitespace-nowrap flex-1 min-w-0">
              {props.range.label || "Untitled range"}
            </LocaleString>
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
