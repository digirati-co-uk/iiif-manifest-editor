import {
  getValue,
  type RangeTableOfContentsNode,
  rangeToTableOfContentsTree,
} from "@iiif/helpers";
import { useMemo, useState } from "react";
import {
  Collection,
  DropItem,
  Tree,
  useDragAndDrop,
} from "react-aria-components";
import {
  CanvasContext,
  useVault,
  useManifest,
  useVaultSelector,
} from "react-iiif-vault";
import type { Key as RACKey } from "@react-types/shared";
import { createRangeHelper } from "@iiif/helpers";
import { TreeCanvasItem } from "./TreeCanvasItem";
import { TreeRangeItem } from "./TreeRangeItem";
import { Editor, EditorInstance } from "@manifest-editor/editor-api";
import { toRef } from "@iiif/parser";
import { SmallButton } from "@manifest-editor/ui/atoms/Button";

interface RangeTreeProps {
  hideCanvases?: boolean;
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

async function deserialiseRangeItems(items: DropItem[]) {
  return Promise.all(
    items.map(async (item) => {
      if (item.kind === "text") {
        const text = JSON.parse(await item.getText("text/plain"));
        console.log("text", text);
        return text;
      }
      return null as never;
    }),
  );
}

export function RangeTree(props: RangeTreeProps) {
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);

  const { range, flatItems } = useVaultSelector((_, vault) => {
    const structures = vault.get(manifest!.structures || []);
    const range = helper.rangesToTableOfContentsTree(structures)! || {};
    const flatItems = flattenedRanges(range);

    return { structures, range, flatItems };
  });

  const defaultExpandedKeys = useMemo(() => {
    return [range.id, ...(range.items || []).map((r) => r.id)];
  }, [range]);
  const [iterate, setIterate] = useState(1);

  const expandAllKeys = useMemo<RACKey[]>(() =>
      flatItems
        .filter(({ item }) => item.type === "Range" && item.items?.length)
        .map(({ item }) => item.id as RACKey),
    [flatItems]);

  const [expandedKeys, setExpandedKeys] = useState<Iterable<RACKey>>(
    []
  );

  const { dragAndDropHooks } = useDragAndDrop({
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

      const fullItemTarget = flatItems.find(
        (item) => (e.target as any).key === item.item.id,
      );

      if (
        e.target.type === "item" &&
        e.target.dropPosition === "on" &&
        fullItemTarget?.item.type === "Canvas"
      ) {
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

      if (
        e.target.type === "root" ||
        (e.target.type === "item" && e.target.dropPosition === "on")
      ) {
        /////
        ///// PERFORM MOVE - moving from one range to another (no position).
        /////
        const toMoveReference = fullParentVault.items.find(
          (item) => toRef(item, "Canvas")?.id === toMoveItem.item.id,
        );
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
        const startIndex = fullParentVault.items.findIndex(
          (item) => toRef(item, "Canvas")?.id === toMoveItem.item.id,
        );
        const endIndex = fullParentVault.items.findIndex(
          (item) => toRef(item, "Canvas")?.id === targetId,
        );

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

      const targetFromParentIndex = targetParentFullVault.items.findIndex(
        (item) => toRef(item)?.id === targetId,
      );

      console.log({ targetId, targetParentId, targetParentFullVault });

      if (targetFromParentIndex === -1) {
        console.log("[error] Invalid target item found");
        return;
      }

      let didUpdate = false;
      if (e.target.dropPosition === "after") {
        didUpdate = targetEditor.structural.items.addAfter(
          targetFromParentIndex,
          reference,
        );
      }
      if (e.target.dropPosition === "before") {
        didUpdate = targetEditor.structural.items.addBefore(
          targetFromParentIndex,
          reference,
        );
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

  return (
    <>
    <div className='flex gap-2'>
      <SmallButton onClick={() => setExpandedKeys(expandAllKeys)}>Expand all</SmallButton>
      <SmallButton onClick={() => setExpandedKeys([])}>Collapse all</SmallButton>
    </div>
    <Tree
      aria-label={getValue(range.label)}
      items={[range]}
      expandedKeys={expandedKeys}
      defaultExpandedKeys={defaultExpandedKeys}
      dragAndDropHooks={dragAndDropHooks}
      onExpandedChange={setExpandedKeys}
    >
      {function renderItem(item, parent?: RangeTableOfContentsNode) {
        if (item.type === "Canvas") {
          if (props.hideCanvases || !item.resource) {
            return null;
          }

          return (
            <CanvasContext canvas={item.resource?.source.id}>
              <TreeCanvasItem rangeItem={item} parent={parent} />
            </CanvasContext>
          );
        }

        return (
          <TreeRangeItem range={item} hasChildItems={!!item.items}>
            <Collection items={item.items || []}>
              {(t) => renderItem(t, item)}
            </Collection>
          </TreeRangeItem>
        );
      }}
    </Tree>
    </>
  );
}
