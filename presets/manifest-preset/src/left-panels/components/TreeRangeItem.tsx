import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { Reference } from "@iiif/presentation-3";
import {
  ActionButton,
  AddImageIcon,
  DeleteForeverIcon,
  ListResizeDragHandle,
  MoreMenuButton,
  MoreMenuIcon,
  SelectionCheckbox,
} from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInStack } from "@manifest-editor/editors";
import {
  useEditingResource,
  useEditingStack,
  useInlineCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import { MinusIcon } from "@manifest-editor/ui/icons/MinusIcon";
import { PlusIcon } from "@manifest-editor/ui/icons/PlusIcon";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { useCallback, useRef, useState } from "react";
import { usePress } from "react-aria";
import type { Key, TreeItemContentRenderProps, TreeItemProps } from "react-aria-components";
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
import { flushSync } from "react-dom";
import { LocaleString, useVault } from "react-iiif-vault";
import { twJoin, twMerge } from "tailwind-merge";
import { RangesIcon } from "../../icons";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { useRangeTreeOptions } from "./RangeTree";

interface TreeRangeItemProps extends Partial<TreeItemProps> {
  range: RangeTableOfContentsNode;
  parentId?: string;
  expandRangeItem: (range: RangeTableOfContentsNode, collapse?: boolean) => void;
}

export function TreeRangeItem(props: TreeRangeItemProps) {
  const manifestEditor = useManifestEditor();
  const range = useInStack("Range");
  const creator = useInlineCreator();
  const { back } = useEditingStack();
  const { edit } = useLayoutActions();
  const popoverRef = useRef<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const vault = useVault();
  const isActive = props.range.id === range?.resource.source?.id;
  const activeId = range?.resource.source?.id;
  const isNoNav = props.range.isNoNav;

  const onAction = useCallback(() => {
    // Need to change parent item (isRangeLeaf)
    if (props.range.isRangeLeaf && props.parentId) {
      if (activeId !== props.parentId) {
        // Ensure this update happens before scrolling.
        flushSync(() => {
          edit({ id: props.parentId!, type: "Range" });
        });
      }
      // Scroll into view.
      const el = document.getElementById(`workbench-${String(props.range.id)}`);
      el?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
        container: "nearest",
      } as any);
      return;
    }

    // Otherwise just select the range.
    edit({ id: props.range.id, type: "Range" });
  }, [activeId, props.parentId, edit, props.range.isRangeLeaf, props.range.id]);

  const items = props.range.items ?? [];
  const hasChildRanges = items.some((i) => i.type === "Range");
  const hasCanvases = items.some((i) => i.type === "Canvas");

  const deleteRange = useCallback(
    (range: RangeTableOfContentsNode) => {
      if (!props.parentId) {
        // This is the top level one.
        const structures = manifestEditor.structural.structures.getWithoutTracking();
        const index = structures.findIndex((structure) => structure.id === range.id);
        if (index !== -1) manifestEditor.structural.structures.deleteAtIndex(index);
      } else {
        const editor = new EditorInstance({
          reference: { id: props.parentId, type: "Range" },
          vault,
        });
        const idx = editor.structural.items.getWithoutTracking().findIndex((i) => i.id === range.id);
        if (idx !== -1) editor.structural.items.deleteAtIndex(idx);
      }
      requestAnimationFrame(() => {
        if (!activeId) return;
        const stillRendered = document.getElementById(`workbench-${activeId}`);
        if (!stillRendered) {
          back();
        }
      });
    },
    [props.parentId, manifestEditor, vault, activeId, back],
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
  const hasVisibleChildren = hasChildRanges || (showCanvases && hasCanvases);

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
        "react-aria-TreeItem hover:bg-gray-100 flex items-center gap-2 p-1.5",
        "data-[dragging]:opacity-50 data-[drop-target]:bg-me-primary-500 data-[drop-target]:text-white",
        isMenuOpen ? "bg-me-200" : "",
        isActive ? "bg-me-primary-500 hover:bg-me-primary-600 text-white" : "",
        isNoNav ? "opacity-40" : "",
      )}
      data-menu-open={isMenuOpen}
      data-active={isActive}
      data-parent-active={props.parentId === activeId}
      textValue={getValue(props.range.label)}
      id={props.range.id}
      onAction={onAction}
      {...props}
    >
      <TreeItemContent>
        {({ isExpanded, selectionBehavior, selectionMode }: TreeItemContentRenderProps) => (
          <>
            {hasVisibleChildren ? (
              <Button slot="chevron" className={twJoin("rounded", isActive ? "hover:bg-me-500" : "hover:bg-gray-300")}>
                <ChevronDownIcon
                  className={"text-xl"}
                  style={{
                    transition: "transform .2s",
                    transform: `rotate(${isExpanded ? "0deg" : "-90deg"})`,
                  }}
                />
              </Button>
            ) : (
              <span slot="chevron" aria-hidden tabIndex={-1} className="pointer-events-none">
                <ChevronDownIcon
                  className={twMerge("text-xl", "opacity-20 cursor-not-allowed")}
                  style={{
                    transition: "transform .2s",
                    transform: `rotate(${isExpanded ? "0deg" : "-90deg"})`,
                  }}
                />
              </span>
            )}

            {selectionMode === "multiple" && <SelectionCheckbox alwaysVisible />}

            <div
              className={twMerge(
                "flex items-center gap-2 flex-1 min-w-0",
                !showCanvases && props.range.isRangeLeaf && "border-transparent",
              )}
            >
              <LocaleString
                className={twMerge(
                  "truncate whitespace-nowrap flex-1 min-w-0 border-b border-gray-200",
                  (isMenuOpen || isActive) && "border-transparent",
                )}
              >
                {props.range.label || "Untitled range"}
              </LocaleString>

              {!isEditing && props.range.isRangeLeaf ? (
                <div className="text-right bg-gray-100 py-0.5 px-2 text-xs rounded text-black/70">
                  {props.range.items?.length}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <MenuTrigger isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  {isEditing ? <MoreMenuButton /> : null}
                  <Popover ref={popoverRef} className="bg-white shadow-md rounded-md p-1">
                    <Menu>
                      <MenuItem
                        onAction={() => insertEmptyRange(props.range)}
                        className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                      >
                        <RangesIcon /> Insert empty range
                      </MenuItem>
                      <MenuItem
                        onAction={() => props.expandRangeItem(props.range, false)}
                        className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                      >
                        <PlusIcon /> Expand all
                      </MenuItem>
                      <MenuItem
                        onAction={() => props.expandRangeItem(props.range, true)}
                        className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                      >
                        <MinusIcon /> Collapse all
                      </MenuItem>

                      {props.parentId ? (
                        <>
                          {/* */}
                          <MenuItem
                            onAction={() =>
                              window.confirm("Are you sure you want to delete this range?") && deleteRange(props.range)
                            }
                            className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex text-red-500 gap-2 items-center"
                          >
                            <DeleteForeverIcon /> Delete range item
                          </MenuItem>
                        </>
                      ) : null}
                    </Menu>
                  </Popover>
                </MenuTrigger>
                {isEditing && !!props.parentId && <ListResizeDragHandle />}
              </div>
            </div>
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
