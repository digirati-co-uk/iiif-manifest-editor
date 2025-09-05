import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { AddImageIcon } from "@manifest-editor/components";
import type { TreeItemContentRenderProps, TreeItemProps } from "react-aria-components";
import { Checkbox, TreeItem, TreeItemContent } from "react-aria-components";
import { LocaleString, useCanvas } from "react-iiif-vault";

interface TreeCanvasItemProps extends Partial<TreeItemProps> {
  rangeItem: RangeTableOfContentsNode;
  parent?: RangeTableOfContentsNode;
}

export function TreeCanvasItem(props: TreeCanvasItemProps) {
  const canvas = useCanvas();

  if (!canvas) {
    return null;
  }

  const id = props?.parent?.resource ? `${props.parent.resource.id}$__$${props.rangeItem.id}` : props.rangeItem.id;

  return (
    <TreeItem textValue={getValue(canvas.label)} id={id} {...props} value={props.rangeItem}>
      <TreeItemContent>
        {({ hasChildItems, isDragging, selectionBehavior, selectionMode }: TreeItemContentRenderProps) => (
          <>
            {selectionBehavior === "toggle" && selectionMode !== "none" && <Checkbox slot="selection" />}
            <div className={`flex items-center gap-2 ${isDragging ? "opacity-50" : ""}`}>
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
