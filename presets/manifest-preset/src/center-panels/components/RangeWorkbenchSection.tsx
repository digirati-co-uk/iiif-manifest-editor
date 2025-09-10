import type { RangeTableOfContentsNode } from "@iiif/helpers";
import { ActionButton, CanvasThumbnailGridItem, RangesIcon } from "@manifest-editor/components";
import { useLayoutActions } from "@manifest-editor/shell";
import { CanvasContext, LocaleString } from "react-iiif-vault";

export function RangeWorkbenchSection({
  range,
  isSplitting,
  onSplit,
}: {
  range: RangeTableOfContentsNode;
  isSplitting: boolean;
  onSplit: (range: RangeTableOfContentsNode, item: RangeTableOfContentsNode) => void;
}) {
  const { edit } = useLayoutActions();

  return (
    <div key={range.id} className="w-full border-b border-b-gray-200 mb-8">
      <div className="flex items-center gap-4 mb-2">
        <LocaleString className="text-xl">{range.label || "Untitled range"}</LocaleString>
        <ActionButton onPress={() => edit({ id: range.id, type: "Range" })}>
          {range.isRangeLeaf ? "Bulk actions" : "Edit range"}
        </ActionButton>
      </div>
      <div className="grid grid-sm gap-3">
        {(range.items || []).map((item) => {
          if (item.type !== "Canvas") {
            return (
              <div
                key={item.id}
                className="aspect-square bg-gray-100 rounded items-center justify-center flex flex-col"
              >
                <RangesIcon className="w-12 h-12" />
                <LocaleString>{item.label || "Untitled range"}</LocaleString>
                <ActionButton onPress={() => edit({ id: item.id, type: "Range" })}>
                  {item.isRangeLeaf ? "Bulk actions" : "Edit range"}
                </ActionButton>
              </div>
            );
          }

          return (
            <CanvasContext key={item.id} canvas={item.resource!.source!.id}>
              <CanvasThumbnailGridItem
                onClick={() => {
                  if (isSplitting) {
                    onSplit(range, item);
                  }
                }}
                className={isSplitting ? "split-range-highlight" : ""}
                id={item.resource!.source!.id}
              />
            </CanvasContext>
          );
        })}
      </div>
    </div>
  );
}
