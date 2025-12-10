import { createRangeHelper, getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { moveEntities } from "@iiif/helpers/vault/actions";
import { toRef } from "@iiif/parser";
import type { Reference } from "@iiif/presentation-3";
import type { CanvasNormalized } from "@iiif/presentation-3-normalized";
import { EditorInstance } from "@manifest-editor/editor-api";
import { SmallButton } from "@manifest-editor/ui/atoms/Button";
import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Collection,
  Disclosure,
  DisclosurePanel,
  type DropItem,
  Heading,
  type Key,
  Tree,
  useDragAndDrop,
} from "react-aria-components";
import { CanvasContext, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { create } from "zustand";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { OrphanedTreeCanvasItem } from "./OrphanedTreeCanvasItem";
import { TreeCanvasItem } from "./TreeCanvasItem";
import { TreeRangeItem } from "./TreeRangeItem";

interface RangeTreeProps {
  hideCanvases?: boolean;
  selectedTopLevelRange?: { id: string; type: "Range" } | null;
}

export function flattenedRanges(range: RangeTableOfContentsNode) {
  const flatList: {
    item: RangeTableOfContentsNode;
    parent: RangeTableOfContentsNode | null;
  }[] = [];
  flatList.push({ item: range, parent: null });
  for (const item of range.items || []) {
    flatList.push({ item, parent: range });
    if (item.type === "Range") {
      flatList.push(...flattenedRanges(item));
    }
  }
  return flatList;
}

function getCanvasesNotInRanges(
  flatItems: { item: RangeTableOfContentsNode; parent: RangeTableOfContentsNode | null }[],
  canvases: Reference<"Canvas">[],
) {
  const canvasesInRanges = new Set(flatItems.filter((item) => item.item.type === "Canvas").map((item) => item.item.id));
  return canvases.filter((canvas) => !canvasesInRanges.has(canvas.id));
}

export async function deserialiseRangeItems(items: DropItem[]) {
  return Promise.all(
    items.map(async (item) => {
      if (item.kind === "text") {
        const parsed = await item.getText("text/plain");
        if (!parsed) return null;
        const text = JSON.parse(parsed);
        return text;
      }
      return null as never;
    }),
  );
}

export const useRangeTreeOptions = create<{
  showCanvases: boolean;
  toggleShowCanvases: () => void;
  isEditing: boolean;
  toggleIsEditing: () => void;
}>()((set, get) => {
  return {
    showCanvases: true,
    toggleShowCanvases() {
      set((e) => ({ showCanvases: !e.showCanvases }));
    },
    isEditing: false,
    toggleIsEditing() {
      set((e) => ({ isEditing: !e.isEditing }));
    },
  };
});

export function RangeTree(props: RangeTreeProps) {
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const { isEditing, showCanvases, toggleShowCanvases } = useRangeTreeOptions();

  const { range, flatItems, canvasesNotInRanges } = useVaultSelector((_, vault) => {
    const structures = props.selectedTopLevelRange
      ? [vault.get(props.selectedTopLevelRange)]
      : vault.get(manifest!.structures || []);

    const range =
      helper.rangesToTableOfContentsTree(structures, undefined, {
        showNoNav: true,
      })! || {};
    const flatItems = flattenedRanges(range);

    const canvasesNotInRanges = getCanvasesNotInRanges(flatItems, manifest?.items || []);

    return { structures, range, flatItems, canvasesNotInRanges };
  });

  const maxNodeSize = 500; // @todo config?

  const expandAllKeys = useMemo<Key[]>(
    () =>
      flatItems
        .filter(({ item }) => item.type === "Range" && item.items?.length)
        .filter(({ item }) => (item.items?.length || 0) < maxNodeSize)
        .filter(({ item }) => !item.isRangeLeaf && !item.isCanvasLeaf)
        //
        .map(({ item }) => item.id as Key),
    [flatItems],
  );

  const rangeItems = useMemo(() => [range], [range]);

  const [expandedKeys, setExpandedKeys] = useState<Iterable<Key>>(expandAllKeys);

  const { dragAndDropHooks } = useDragAndDrop({
    isDisabled: false,
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

      if (!fullItemTarget) return;

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

      const toMoveItems = items
        .map((toMoveItem) => {
          const itemIndex = flatItems.findIndex((item) => toMoveItem.item === item.item.id);
          if (itemIndex === -1) return null;

          const item = flatItems[itemIndex];
          return { id: item?.item.id, type: item?.item.type, order: itemIndex };
        })
        .filter((item) => item !== null)
        .sort((a, b) => a.order - b.order)
        .map((item) => {
          return { id: item.id, type: item.type };
        });

      const toMove = items[0] as { item: string };
      const toMoveItem = flatItems.find((item) => toMove.item === item.item.id);
      if (!toMoveItem) {
        // This could be moving a canvas into it.
        const fullVaultItem = vault.get(toMove.item);
        if (!fullVaultItem?.id || !fullVaultItem?.type) {
          console.log("[error] No valid item found in Vault");
          return;
        }
        const targetParentFullVault = vault.get({
          id: targetParentId,
          type: "Range",
        });
        const targetFromParentIndex = targetParentFullVault.items.findIndex((item) => toRef(item)?.id === targetId);
        const reference: any = {
          type: "SpecificResource",
          source: { id: fullVaultItem.id, type: fullVaultItem.type },
        };
        const targetEditor = new EditorInstance({
          reference: { id: targetParentId, type: "Range" },
          vault,
        });

        if (e.target.type === "item") {
          if (e.target.dropPosition === "on") {
            targetEditor.structural.items.add(reference);
          }
          if (e.target.dropPosition === "after") {
            targetEditor.structural.items.addAfter(targetFromParentIndex, reference);
          }
          if (e.target.dropPosition === "before") {
            targetEditor.structural.items.addBefore(targetFromParentIndex, reference);
          }
        }
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

      if (e.target.type === "root" || (e.target.type === "item" && e.target.dropPosition === "on")) {
        /////
        ///// PERFORM MOVE - moving from one range to another (no position).
        /////
        vault.dispatch(
          moveEntities({
            subjects: { type: "list", items: toMoveItems },
            from: {
              id: toMoveItem.parent.id,
              type: "Range",
              key: "items",
            },
            to: {
              id: targetParentId,
              type: "Range",
              key: "items",
            },
          }),
        );
        return;
      }

      if (toMoveItem.parent.id === targetParentId && e.dropOperation === "move") {
        /////
        ///// PERFORM REORDER within the same parent.
        /////
        const startIndex = fullParentVault.items.findIndex((item) => toRef(item, "Canvas")?.id === toMoveItem.item.id);
        let endIndex = fullParentVault.items.findIndex((item) => toRef(item, "Canvas")?.id === targetId);

        if (startIndex === endIndex) {
          console.log("[error] No valid index found for item to move");
          return;
        }

        if (startIndex === -1 || endIndex === -1) {
          console.log("[error] Invalid index found for item to move");
          return;
        }

        if (startIndex > endIndex && e.target.dropPosition === "after") {
          endIndex += 1;
        }
        if (startIndex < endIndex && e.target.dropPosition === "after") {
          endIndex -= toMoveItems.length - 1;
        }

        vault.dispatch(
          moveEntities({
            subjects: { type: "list", items: toMoveItems },
            from: {
              id: targetParentId,
              type: "Range",
              key: "items",
            },
            to: {
              id: targetParentId,
              type: "Range",
              key: "items",
              index: endIndex,
            },
          }),
        );
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

      if (targetFromParentIndex === -1) {
        console.log("[error] Invalid target item found");
        return;
      }

      vault.dispatch(
        moveEntities({
          subjects: { type: "list", items: toMoveItems },
          from: {
            id: toMoveItem.parent.id,
            type: "Range",
            key: "items",
          },
          to: {
            id: targetParentId,
            type: "Range",
            key: "items",
            index: e.target.dropPosition === "after" ? targetFromParentIndex + 1 : targetFromParentIndex,
          },
        }),
      );
    },
  });

  const expandRangeItem = useCallback((range: RangeTableOfContentsNode, collapse?: boolean) => {
    if (range.isCanvasLeaf) return;

    const itemIds = (range.items || []).map((item) => item.id);

    if (collapse) {
      setExpandedKeys((keys) => {
        return Array.from(keys).filter((key) => !itemIds.includes(key.toString()));
      });
      return;
    }

    setExpandedKeys((keys) => {
      return Array.from(
        new Set([
          //
          ...keys,
          range.id,
          ...itemIds,
        ]),
      );
    });
  }, []);

  return (
    <>
      <Tree
        aria-label={getValue(range.label)}
        items={rangeItems}
        expandedKeys={expandedKeys}
        dragAndDropHooks={dragAndDropHooks}
        onExpandedChange={setExpandedKeys}
        selectionMode={isEditing ? "multiple" : "single"}
        selectionBehavior="toggle"
      >
        {function renderItem(item) {
          return <RenderItem item={item} expandRangeItem={expandRangeItem} />;
        }}
      </Tree>

      {canvasesNotInRanges.length === 0 ? null : (
        <Disclosure className="w-full">
          <Heading>
            <Button
              slot="trigger"
              className="group flex items-center hover:bg-gray-100 px-2 py-1.5 gap-3 w-full text-gray-500"
            >
              <ChevronDownIcon
                className={`text-xl group-[&[aria-expanded="true"]]:rotate-0 -rotate-90 transition-transform`}
              />
              <span className="flex items-center gap-1">
                <WarningIcon className="text-xl" />
                Canvases without a range
              </span>
            </Button>
          </Heading>
          <DisclosurePanel>
            {canvasesNotInRanges.map((item) => {
              return (
                <CanvasContext key={item.id} canvas={item.id}>
                  <OrphanedTreeCanvasItem />
                </CanvasContext>
              );
            })}
          </DisclosurePanel>
        </Disclosure>
      )}
    </>
  );
}

import type { SVGProps } from "react";

interface SVGRProps {
  title?: string;
  titleId?: string;
}

function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path fill="currentColor" d="M1 21h22L12 2zm3.47-2L12 5.99L19.53 19zM11 16h2v2h-2zm0-6h2v4h-2z" />
    </svg>
  );
}

function RenderItem({
  item,
  parent,
  expandRangeItem,
}: {
  item: RangeTableOfContentsNode;
  parent?: RangeTableOfContentsNode;
  expandRangeItem: (range: RangeTableOfContentsNode, collapse?: boolean) => void;
}) {
  const { showCanvases } = useRangeTreeOptions();
  if (item.type === "Canvas") {
    if (!item.resource || !showCanvases) {
      return null;
    }

    return (
      <CanvasContext canvas={item.resource?.source.id}>
        <TreeCanvasItem rangeItem={item} parent={parent} />
      </CanvasContext>
    );
  }

  return (
    <TreeRangeItem range={item} hasChildItems={!!item.items} parentId={parent?.id} expandRangeItem={expandRangeItem}>
      <Collection items={item.items || []}>
        {(t) => <RenderItem item={t} parent={item} expandRangeItem={expandRangeItem} />}
      </Collection>
    </TreeRangeItem>
  );
}
