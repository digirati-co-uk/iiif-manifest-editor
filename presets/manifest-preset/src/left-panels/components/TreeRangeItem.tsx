import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ActionButton, AddImageIcon, DeleteForeverIcon, MoreMenuIcon } from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInStack } from "@manifest-editor/editors";
import { useInlineCreator, useManifestEditor } from "@manifest-editor/shell";
import { PlusIcon } from "@manifest-editor/ui/icons/PlusIcon";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { useCallback } from "react";
import type { TreeItemContentRenderProps, TreeItemProps } from "react-aria-components";
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
import { ChevronDownIcon } from "./ChevronDownIcon";
import { useRangeTreeOptions } from "./RangeTree";

interface TreeRangeItemProps extends Partial<TreeItemProps> {
  range: RangeTableOfContentsNode;
  parentId?: string;
}

export function TreeRangeItem(props: TreeRangeItemProps) {
  const manifestEditor = useManifestEditor();
  const range = useInStack("Range");
  const creator = useInlineCreator();
  const vault = useVault();
  const isActive = props.range.id === range?.resource.source?.id;
  const isNoNav = props.range.isNoNav;

  const deleteRange = useCallback(
    (range: RangeTableOfContentsNode) => {
      if (!props.parentId) {
        // This is the top level one.
        const structures = manifestEditor.structural.structures.getWithoutTracking();
        const index = structures.findIndex((structure) => structure.id === range.id);
        if (index !== -1) {
          manifestEditor.structural.structures.deleteAtIndex(index);
        }
        return;
      }
      const editor = new EditorInstance({
        reference: { id: props.parentId, type: "Range" },
        vault,
      });

      const index = editor.structural.items.getWithoutTracking().findIndex((item) => item.id === range.id);

      if (index !== -1) {
        editor.structural.items.deleteAtIndex(index);
      }
    },
    [props.parentId, manifestEditor, vault],
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

  const insertSequenceRange = useCallback(
    (range: RangeTableOfContentsNode) => {
      creator.create(
        "@manifest-editor/range-with-items",
        {
          type: "Range",
          label: { en: ["Untitled sequence"] },
          items: manifestEditor.structural.items.getWithoutTracking().map((item) => ({
            type: "Canvas",
            id: item.id,
          })),
        },
        {
          parent: {
            property: "items",
            resource: { id: range.id, type: "Range" },
          },
        },
      );
    },
    [creator, manifestEditor],
  );

  const getWorkbench = (idx: number | string) => {
    return document.getElementById(`workbench-${idx}`);
  };

  const { isEditing, showCanvases } = useRangeTreeOptions();

  return (
    <TreeItem
      className={twMerge(
        "react-aria-TreeItem hover:bg-gray-100 flex items-center gap-2 p-1.5",
        isActive ? "bg-me-primary-500 hover:bg-me-primary-600 text-white" : "",
        isNoNav ? "opacity-40" : "",
      )}
      textValue={getValue(props.range.label)}
      id={props.range.id}
      {...props}
      onPress={() =>
        getWorkbench(props.range.id)?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
      }
    >
      <TreeItemContent>
        {({ isExpanded, selectionBehavior, isDropTarget, selectionMode }: TreeItemContentRenderProps) => (
          <>
            {selectionBehavior === "toggle" && selectionMode !== "none" && <Checkbox slot="selection" />}

            <Button slot="chevron">
              <ChevronDownIcon
                className={twMerge(
                  "text-xl",
                  !showCanvases && props.range.isRangeLeaf && "opacity-20 cursor-not-allowed",
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
                !showCanvases && props.range.isRangeLeaf && "border-transparent",
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
                          onAction={() => insertSequenceRange(props.range)}
                          className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                        >
                          <AddImageIcon /> Insert full range
                        </MenuItem>
                        <MenuItem
                          onAction={() =>
                            window.confirm("Are you sure you want to delete this range?") && deleteRange(props.range)
                          }
                          className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex text-red-500 gap-2 items-center"
                        >
                          <DeleteForeverIcon /> Delete range items
                        </MenuItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                  {!!props.parentId && (
                    <Button slot="drag">
                      <ResizeHandleIcon className="text-xl" />
                    </Button>
                  )}
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
