import { RangeTableOfContentsNode } from "@iiif/helpers";
import {
  ActionButton,
  CanvasThumbnailGridItem,
} from "@manifest-editor/components";
import { useLayoutActions } from "@manifest-editor/shell";
import { CanvasContext, LocaleString } from "react-iiif-vault";

export function RangeWorkbenchSection({
  range,
}: {
  range: RangeTableOfContentsNode;
}) {
  const { edit } = useLayoutActions();

  return (
    <div key={range.id} className="w-full border-b border-b-gray-200 mb-8">
      <div className="flex items-center gap-4 mb-2">
        <LocaleString className="text-xl">
          {range.label || "Untitled range"}
        </LocaleString>
        <ActionButton onPress={() => edit({ id: range.id, type: "Range" })}>
          Edit
        </ActionButton>
      </div>
      <div className="grid grid-sm gap-3">
        {(range.items || []).map((item) => {
          if (item.type !== "Canvas") {
            return (
              <div key={item.id}>
                <LocaleString>{item.label || "Untitled range"}</LocaleString>
                <ActionButton
                  onPress={() => edit({ id: range.id, type: "Range" })}
                >
                  Edit
                </ActionButton>
              </div>
            );
          }

          return (
            <CanvasContext key={item.id} canvas={item.resource!.source!.id}>
              <CanvasThumbnailGridItem id={item.resource!.source!.id} />
            </CanvasContext>
          );
        })}
      </div>
    </div>
  );
}
