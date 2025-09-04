import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { AddImageIcon, ManifestIcon } from "@manifest-editor/components";
import type { TreeItemContentRenderProps, TreeItemProps } from "react-aria-components";
import { Button, Checkbox, TreeItem, TreeItemContent } from "react-aria-components";
import { LocaleString, useCanvas } from "react-iiif-vault";

interface TreeCanvasItemProps extends Partial<TreeItemProps> {
  rangeItem: RangeTableOfContentsNode;
}

export function TreeCanvasItem(props: TreeCanvasItemProps) {
  const canvas = useCanvas();

  if (!canvas) {
    return null;
  }

  return (
    <TreeItem textValue={getValue(canvas.label)} id={props.rangeItem.id} {...props}>
      <TreeItemContent>
        {({ hasChildItems, selectionBehavior, selectionMode }: TreeItemContentRenderProps) => (
          <>
            {selectionBehavior === "toggle" && selectionMode !== "none" && <Checkbox slot="selection" />}
            <div className="flex items-center gap-2">
              <AddImageIcon />
              <LocaleString>{canvas.label}</LocaleString>
            </div>
          </>
        )}
      </TreeItemContent>
      {props.children}
    </TreeItem>
  );
}
