import { toRef } from "@iiif/parser";
import { ActionButton, CanvasThumbnailGridItem } from "@manifest-editor/components";
import { CanvasContext, useRange } from "react-iiif-vault";

export function BulkActionsWorkbench() {
  const range = useRange();

  if (!range) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">Bulk Actions ({range.items?.length || 0} canvases)</h3>
      <div className="flex gap-2 mb-8">
        <ActionButton>Split into multiple ranges</ActionButton>
        <ActionButton>Sequential labelling</ActionButton>
      </div>

      <div className="grid grid-md gap-3">
        {(range.items || []).map((ref) => {
          const item = toRef(ref)!;

          return (
            <CanvasContext key={item.id} canvas={item.id}>
              <CanvasThumbnailGridItem id={item.id} />
            </CanvasContext>
          );
        })}
      </div>
    </div>
  );
}
