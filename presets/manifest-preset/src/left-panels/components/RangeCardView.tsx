import { createRangeHelper, type RangeTableOfContentsNode } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import { ActionButton, BackIcon, DeleteForeverIcon, EmptyState, MoreMenuIcon } from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInStack } from "@manifest-editor/editors";
import { useEditingStack, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { useCallback, useMemo } from "react";
import {
  Button,
  type DropItem,
  GridList,
  GridListItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  useDragAndDrop,
} from "react-aria-components";
import { LocaleString, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { flattenedRanges, useRangeTreeOptions } from "./RangeTree";

export function RangeCardView() {
  const vault = useVault();
  const manifest = useManifest();
  const manifestEditor = useManifestEditor();
  const rangeInStack = useInStack("Range");
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const { edit } = useLayoutActions();
  const { back } = useEditingStack();
  const { isEditing, showCanvases, toggleShowCanvases } = useRangeTreeOptions();

  const range = useVaultSelector(
    (_, vault) => {
      if (rangeInStack) {
        return helper.rangeToTableOfContentsTree(vault.get(rangeInStack.resource), { showNoNav: true })!;
      }

      const structures = vault.get(manifest!.structures || []);
      return helper.rangesToTableOfContentsTree(structures, undefined, { showNoNav: true })! || {};
    },
    [vault, manifest, rangeInStack],
  );

  const filteredItems = useMemo(() => {
    return (range.items || []).filter((item) => item.type === "Range");
  }, [range]);

  const flatItems = flattenedRanges(range);

  async function deserialiseRangeItems(items: DropItem[]) {
    return Promise.all(
      items.map(async (item) => {
        if (item.kind === "text") {
          const text = JSON.parse(await item.getText("text/plain"));
          return text;
        }
        return null as never;
      }),
    );
  }

  const { dragAndDropHooks } = useDragAndDrop({
    isDisabled: !isEditing,
    getItems: (keys, items) => {
      return [...keys].map((item) => {
        const found = flatItems.find((i) => i.item.id === item);
        if (found) {
          return {
            "text/plain": JSON.stringify({
              item: found.item.id,
              parent: found.parent,
            }),
          };
        }
        return {
          "text/plain": item.toString(),
        };
      });
    },
    renderDragPreview(items) {
      return (
        <div className="opacity-50 bg-gray-200 rounded p-1">
          <span className="">{items.length} items</span>
        </div>
      );
    },
    onDrop: async (e) => {
      const items = await deserialiseRangeItems(e.items);
      let targetId = null;
      if (e.target.type === "root") {
        // Set this to the top level range that is being rendered.
        targetId = range.id;
      } else {
        // Otherwise its the range from the key.
        targetId = e.target.key;
      }
      if (!targetId) {
        console.log("[error] No valid target found");
        return;
      }

      const fullItemTarget = flatItems.find((item) => (e.target as any).key === item.item.id);

      if (e.target.type === "item" && e.target.dropPosition === "on" && fullItemTarget?.item.type === "Canvas") {
        return;
      }

      let targetParentId: string = targetId.toString();
      if (e.dropOperation === "move" && e.target.type === "item") {
        if (e.target.dropPosition === "before") {
          // The parent range.
          targetParentId = fullItemTarget?.parent?.id!;
        } else if (e.target.dropPosition === "after") {
          // The parent range.
          targetParentId = fullItemTarget?.parent?.id!;
        } else if (e.target.dropPosition === "on") {
          targetParentId = targetId.toString();
        }
      }

      if (!targetParentId) {
        console.log("[error] No valid target parent found");
        return;
      }

      // We are operating on this range.
      const fullTargetRange = vault.get({ id: targetParentId, type: "Range" });
      if (!fullTargetRange) {
        console.log("[error] No valid target range found in Vault");
        return;
      }

      const targetEditor = new EditorInstance({
        reference: { id: targetParentId, type: "Range" },
        vault,
      });

      const toMove = items[0] as { item: string };
      const toMoveItem = flatItems.find((item) => toMove.item === item.item.id);
      if (!toMoveItem) {
        console.log("[error] No valid item found for item to move");
        return;
      }
      if (!toMoveItem.parent) {
        console.log("[error] No valid parent found for item to move");
        return;
      }

      const fullParentVault = vault.get({
        id: toMoveItem.parent.id,
        type: "Range",
      });
      const parentEditor = new EditorInstance({
        reference: { id: toMoveItem.parent.id, type: "Range" },
        vault,
      });

      if (e.target.type === "root" || (e.target.type === "item" && e.target.dropPosition === "on")) {
        /////
        ///// PERFORM MOVE - moving from one range to another (no position).
        /////
        const toMoveReference = fullParentVault.items.find((item) => toRef(item, "Canvas")?.id === toMoveItem.item.id);
        if (!toMoveReference) {
          console.log("[error] No valid reference found for item to move");
          return;
        }
        const toRemoveIndex = fullParentVault.items.indexOf(toMoveReference);
        if (toRemoveIndex === -1) {
          console.log("[error] No valid index found for item to move");
          return;
        }

        targetEditor.structural.items.add(toMoveReference);
        parentEditor.structural.items.deleteAtIndex(toRemoveIndex);

        return;
      }

      if (toMoveItem.parent.id === targetParentId) {
        /////
        ///// PERFORM REORDER within the same parent.
        /////
        const startIndex = fullParentVault.items.findIndex((item) => toRef(item, "Canvas")?.id === toMoveItem.item.id);
        const endIndex = fullParentVault.items.findIndex((item) => toRef(item, "Canvas")?.id === targetId);

        if (startIndex === endIndex) {
          console.log("[error] No valid index found for item to move");
          return;
        }

        if (startIndex === -1 || endIndex === -1) {
          console.log("[error] Invalid index found for item to move");
          return;
        }

        parentEditor.structural.items.reorder(startIndex, endIndex);
        return;
      }

      /////
      ///// PERFORM REORDER from different parent.
      /////
      const referenceIndex = fullParentVault.items.findIndex(
        (item) => toRef(item, "Canvas")?.id === toMoveItem.item.id,
      );
      if (referenceIndex === -1) {
        console.log("[error] Invalid index found for item to move");
        return;
      }

      const reference = fullParentVault.items[referenceIndex];
      if (!reference) {
        console.log("[error] Invalid reference found for item to move");
        return;
      }

      const targetParentFullVault = vault.get({
        id: targetParentId,
        type: "Range",
      });
      if (!targetParentFullVault) {
        console.log("[error] Invalid target parent found");
        return;
      }

      const targetFromParentIndex = targetParentFullVault.items.findIndex((item) => toRef(item)?.id === targetId);

      console.log({ targetId, targetParentId, targetParentFullVault });

      if (targetFromParentIndex === -1) {
        console.log("[error] Invalid target item found");
        return;
      }

      let didUpdate = false;
      if (e.target.dropPosition === "after") {
        didUpdate = targetEditor.structural.items.addAfter(targetFromParentIndex, reference);
      }
      if (e.target.dropPosition === "before") {
        didUpdate = targetEditor.structural.items.addBefore(targetFromParentIndex, reference);
      }

      if (didUpdate) {
        // Remove from parent
        const toRemoveIndex = fullParentVault.items.indexOf(reference);
        if (toRemoveIndex !== -1) {
          parentEditor.structural.items.deleteAtIndex(toRemoveIndex);
        }
      }
    },
  });

  const deleteRange = useCallback(
    (child: RangeTableOfContentsNode) => {
      if (range.isVirtual) {
        const structures = manifestEditor.structural.structures.getWithoutTracking();
        const index = structures.findIndex((structure) => structure.id === child.id);
        if (index !== -1) {
          manifestEditor.structural.structures.deleteAtIndex(index);
        }
        return;
      }
      const parentEditor = new EditorInstance({
        reference: { id: range.id, type: "Range" },
        vault,
      });

      const items = parentEditor.structural.items.getWithoutTracking();
      const idx = items.findIndex((ref) => ref.id === child.id);
      if (idx !== -1) {
        parentEditor.structural.items.deleteAtIndex(idx);
      }
    },
    [range.id, range.isVirtual, manifestEditor, vault],
  );

  const title = (
    <div className="flex items-center gap-4 mb-4">
      {rangeInStack ? (
        <>
          <ActionButton onPress={() => back()}>
            <BackIcon className="text-xl" />
          </ActionButton>
          <LocaleString as="h3">{range.label}</LocaleString>
        </>
      ) : null}
    </div>
  );

  if (range.isRangeLeaf) {
    return (
      <>
        {title}
        <EmptyState>This Range only contains canvases.</EmptyState>
      </>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <>
        {title}
        <EmptyState>No ranges found</EmptyState>
      </>
    );
  }

  return (
    <>
      {title}
      <GridList
        className="w-full flex flex-col gap-2"
        items={filteredItems}
        dragAndDropHooks={dragAndDropHooks}
        dependencies={[isEditing]}
      >
        {(item) => (
          <GridListItem
            id={item.id}
            onAction={() => {
              if (!isEditing) edit(item);
            }}
            className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <LocaleString className="text-lg mb-4">{item.label}</LocaleString>
                <div className="text-sm text-me-primary-600">
                  {item.items?.length} {item.isRangeLeaf ? "Canvases" : "Ranges"}
                </div>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <MenuTrigger>
                    <ActionButton>
                      <MoreMenuIcon className="text-lg" />
                    </ActionButton>
                    <Popover className="bg-white shadow-md rounded-md p-1">
                      <Menu>
                        <MenuItem
                          onAction={() =>
                            window.confirm("Are you sure you want to delete this range?") && deleteRange(item)
                          }
                          className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex text-red-500 gap-2 items-center"
                        >
                          <DeleteForeverIcon /> Delete range items
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
          </GridListItem>
        )}
      </GridList>
    </>
  );
}
