import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import type {
  TreeItemContentRenderProps,
  TreeItemProps,
} from "react-aria-components";
import {
  Button,
  Checkbox,
  Dialog,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { LocaleString, useVault } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { ArrowDownIcon } from "./ArrowDownIcon";
import { useRangeTreeOptions } from "./RangeTree";
import { useInStack } from "@manifest-editor/editors";
import {
  ActionButton,
  DeleteForeverIcon,
  MoreMenuIcon,
} from "@manifest-editor/components";
import { PlusIcon } from "@manifest-editor/ui/icons/PlusIcon";
import { useInlineCreator } from "@manifest-editor/shell";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useCallback } from "react";

interface TreeRangeItemProps extends Partial<TreeItemProps> {
  range: RangeTableOfContentsNode;
  parentId?: string;
}

export function TreeRangeItem(props: TreeRangeItemProps) {
  const range = useInStack("Range");
  const creator = useInlineCreator();
  const vault = useVault();
  const isActive = props.range.id === range?.resource.source?.id;

  const deleteRange = useCallback(
    (range: RangeTableOfContentsNode) => {
      if (!props.parentId) return;
      const editor = new EditorInstance({
        reference: { id: props.parentId, type: "Range" },
        vault,
      });

      const index = editor.structural.items
        .getWithoutTracking()
        .findIndex((item) => item.id === range.id);
      if (index !== -1) {
        editor.structural.items.deleteAtIndex(index);
      }
    },
    [props.parentId, vault],
  );

  const insertEmptyRange = useCallback(
    (range: RangeTableOfContentsNode) => {
      creator.create(
        "@manifest-editor/range-with-items",
        {
          type: "Range",
          label: { en: ["Untitled range"] },
          items: [],
        },
        {
          parent: {
            property: "items",
            resource: { id: range.id, type: "Range" },
          },
        },
      );
    },
    [creator],
  );

  const { isEditing, showCanvases } = useRangeTreeOptions();
  return (
    <TreeItem
      className={twMerge(
        "react-aria-TreeItem hover:bg-gray-100 flex items-center gap-2 p-1.5",
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

              {!isEditing && !showCanvases && props.range.isRangeLeaf ? (
                <div className="text-right bg-gray-200 py-0.5 px-2 text-xs rounded-full text-black/80">
                  {props.range.items?.length}
                </div>
              ) : null}

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <MenuTrigger>
                    <ActionButton>
                      <MoreMenuIcon className="text-lg" />
                    </ActionButton>
                    <Popover className="bg-white shadow-md rounded-md p-1">
                      <Menu>
                        <MenuItem
                          onAction={() => insertEmptyRange(props.range)}
                          className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                        >
                          <PlusIcon /> Insert empty range
                        </MenuItem>
                        <MenuItem
                          onAction={() => deleteRange(props.range)}
                          className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex text-red-500 gap-2 items-center"
                        >
                          <DeleteForeverIcon /> Delete range
                        </MenuItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                  <Button slot="drag">
                    <ResizeHandleIcon className="text-xl" />
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
