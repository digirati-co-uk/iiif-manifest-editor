import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { useMemo } from "react";
import { Collection, Tree } from "react-aria-components";
import { CanvasContext } from "react-iiif-vault";
import { TreeCanvasItem } from "./TreeCanvasItem";
import { TreeRangeItem } from "./TreeRangeItem";

interface RangeTreeProps {
  range: RangeTableOfContentsNode;
  hideCanvases?: boolean;
}

export function RangeTree(props: RangeTreeProps) {
  const defaultExpandedKeys = useMemo(() => {
    return [props.range.id, ...(props.range.items || []).map((r) => r.id)];
  }, [props.range]);

  return (
    <Tree
      //
      aria-label={getValue(props.range.label)}
      items={[props.range]}
      defaultExpandedKeys={defaultExpandedKeys}
    >
      {function renderItem(item) {
        if (item.type === "Canvas") {
          if (props.hideCanvases || !item.resource) {
            return null;
          }

          return (
            <CanvasContext canvas={item.resource?.source.id}>
              <TreeCanvasItem rangeItem={item} />
            </CanvasContext>
          );
        }

        return (
          <TreeRangeItem range={item} hasChildItems={!!item.items}>
            <Collection items={item.items || []}>{renderItem}</Collection>
          </TreeRangeItem>
        );
      }}
    </Tree>
  );
}
