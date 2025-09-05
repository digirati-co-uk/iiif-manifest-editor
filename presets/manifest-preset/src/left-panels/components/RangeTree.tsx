import { getValue, type RangeTableOfContentsNode, rangeToTableOfContentsTree } from "@iiif/helpers";
import { useMemo, useState } from "react";
import { Collection, Tree, useDragAndDrop } from "react-aria-components";
import { CanvasContext, useVault, useManifest } from "react-iiif-vault";
import { createRangeHelper } from '@iiif/helpers';
import { TreeCanvasItem } from "./TreeCanvasItem";
import { TreeRangeItem } from "./TreeRangeItem";
import { EditorInstance } from "@manifest-editor/editor-api";

interface RangeTreeProps {
  hideCanvases?: boolean;
}

function flattenedRanges(range: RangeTableOfContentsNode) {
  const flatList: { item: RangeTableOfContentsNode; parent: RangeTableOfContentsNode | null }[] = [];
  flatList.push({ item: range, parent: null });
  for (const item of range.items || []) {
    flatList.push({ item, parent: range });
    if (item.type === "Range") {
      flatList.push(...flattenedRanges(item));
    }
  }
  return flatList;
}

export function RangeTree(props: RangeTreeProps) {
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const range = helper.rangesToTableOfContentsTree(vault.get(manifest!.structures || []))!;

  const defaultExpandedKeys = useMemo(() => {
    return [range.id, ...(range.items || []).map((r) => r.id)];
  }, [range]);
  const [iterate, setIterate] = useState(1)
  const flatItems = useMemo(() => flattenedRanges(range), [range, iterate]);

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys, items) => {
      return [...keys].map((item) => {
        const found = flatItems.find((i) => i.item.id === item);
        if (found) {
          return {
            "text/plain": JSON.stringify({ item: found.item.id, parent: found.parent }),
          };
        }
        return {
          "text/plain": item.toString(),
        };
      });
    },
    onItemDrop: async (e) => {
      console.log("onItemDrop", e);
    },
    onDrop: async (e) => {
      const items = await Promise.all(
        e.items.map(async (item) => {
          if (item.kind === "text") {
            const text = JSON.parse(await item.getText("text/plain"));
            console.log("text", text);
            return text;
          }
          return null as never;
        }),
      );

      console.log('on drop', e)

      const toMove = items[0]; // Only support one at the moment.
      if (e.target.type === "item") {
        const fullItemTarget = flatItems.find((item) => (e.target as any).key === item.item.id);
        console.log("Move", items, "to", fullItemTarget);
        const parent = toMove.parent;




        if (fullItemTarget?.parent?.id !== toMove.parent.id) {

          const editor = new EditorInstance({
            reference: { id: parent.id, type: "Range" },
            vault,
          });
          const currentItems = editor.structural.items.getWithoutTracking();


          // 1. Remove from existing.
          const toMoveIndex = currentItems.findIndex((item: any) => {
            if (item.type === "Range") {
              return item.id === toMove.item;
            }
            return item.source.id === toMove.item
          });
          const reference = currentItems[toMoveIndex]!;
          editor.structural.items.deleteAtIndex(toMoveIndex);


          if (e.target.dropPosition === 'on') {
            const targetEditor = new EditorInstance({
              reference: { id: fullItemTarget?.item?.id!, type: "Range" },
              vault,
            })

            targetEditor.structural.items.add(reference);
          }

          // 2. Add to new at index.
          const parentEditor = new EditorInstance({
            reference: { id: fullItemTarget?.parent?.id!, type: "Range" },
            vault,
          });

          const endIndex = currentItems.findIndex((item: any) => {
            if (item.type === "Range") {
              return item.id === fullItemTarget?.item.id;
            }
            return item.source.id === fullItemTarget?.item.id;
          });

          if (e.target.dropPosition === 'after') {
            parentEditor.structural.items.addAfter(endIndex, reference);
          }
          if (e.target.dropPosition === 'before') {
            parentEditor.structural.items.addBefore(endIndex, reference);
          }


          setIterate(i => i + 1);
          console.log("NEED TO REPARENT");
          return;
        }

        // 1.
        const editor = new EditorInstance({
          reference: { id: parent.id, type: "Range" },
          vault,
        });

        if (e.dropOperation === 'move') {
          const currentItems = editor.structural.items.getWithoutTracking();

          const startIndex = currentItems.findIndex((item: any) => {
            if (item.type === "Range") {
              return item.id === toMove.item;
            }
            return item.source.id === toMove.item
          });
          const endIndex = currentItems.findIndex((item: any) => {
            if (item.type === "Range") {
              return item.id === fullItemTarget?.item.id;
            }
            return item.source.id === fullItemTarget?.item.id;
          });

          console.log('startIndex', toMove)
          console.log('end', fullItemTarget?.item.id)
          console.log('looking', {currentItems, startIndex, endIndex}, fullItemTarget?.item.id)

          console.log('reorder', startIndex, endIndex)
          editor.structural.items.reorder(startIndex, endIndex);
          setIterate(i => i + 1);
          console.log("REORDER");
        }
      }
    },
    onMove(e) {
      console.log(e);
      if (e.target.dropPosition === "before") {
        console.log("moveBefore", e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        console.log("moveAfter", e.target.key, e.keys);
      } else if (e.target.dropPosition === "on") {
        console.log("moveOn", e.target.key, e.keys);
      }
    },
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        console.log("onReorderBefore", e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        console.log("onReorderAfter", e.target.key, e.keys);
      } else if (e.target.dropPosition === "on") {
        console.log("onReorderOn", e.target.key, e.keys);
      }
    },
  });

  return (
    <Tree
      //
      aria-label={getValue(range.label)}
      items={[range]}
      defaultExpandedKeys={defaultExpandedKeys}
      dragAndDropHooks={dragAndDropHooks}
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
            <Collection items={item.items || []}>{(t) => renderItem(t, item)}</Collection>
          </TreeRangeItem>
        );
      }}
    </Tree>
  );
}
