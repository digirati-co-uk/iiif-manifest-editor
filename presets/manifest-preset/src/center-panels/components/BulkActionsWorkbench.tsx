import { moveEntities } from "@iiif/helpers/vault/actions";
import { toRef } from "@iiif/parser";
import { ActionButton, CanvasThumbnailGridItem } from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInlineCreator } from "@manifest-editor/shell";
import { CanvasContext, useRange, useVault } from "react-iiif-vault";
import { RangeGridThumbnail } from "./RangeGridThumbnail";

export function BulkActionsWorkbench() {
  const range = useRange();
  const vault = useVault();
  const creator = useInlineCreator();

  if (!range) {
    return null;
  }

  return (
    <div className="p-5 ">
      <div className="flex gap-5 items-baseline">
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="text-xl font-bold ">
          Canvases at this level
        </h3>
        <span>
          ({range.items?.length || 0} {range.items?.length > 1  ? "canvases" : "canvas" })
        </span>
      </div>
      <div className="flex gap-2 mb-8">
        <ActionButton
          onPress={async () => {
            const rangeEditor = new EditorInstance({
              reference: { id: range.id, type: "Range" },
              vault,
            });
            const items = rangeEditor.structural.items.getWithoutTracking();

            // Create sub range.
            const createdRange = (await creator.create(
              "@manifest-editor/range-with-items",
              {
                type: "Range",
                label: { en: ["Untitled range"] },
                items: [],
              },
              {
                parent: {
                  property: "items",
                  resource: { id: range.id, type: "Range" },
                  atIndex: 0,
                },
              },
            )) as { id: string; type: "Range" };

            vault.dispatch(
              moveEntities({
                subjects: {
                  type: "slice",
                  startIndex: 1,
                  length: items.length,
                },
                from: {
                  id: range.id,
                  type: "Range",
                  key: "items",
                },
                to: {
                  id: createdRange.id,
                  type: "Range",
                  key: "items",
                },
              }),
            );
          }}
        >
          Move into new sub-range
        </ActionButton>
      </div>
      </div>

      <div className="grid grid-md gap-3">
        {(range.items || []).map((ref) => {
          const item = toRef(ref)!;

          if (item.type === "Range") {
            return <RangeGridThumbnail key={item.id} range={item} />;
          }

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
