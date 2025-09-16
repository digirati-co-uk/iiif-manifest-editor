import { moveEntities } from "@iiif/helpers/vault/actions";
import { toRef } from "@iiif/parser";
import {
  ActionButton,
  CanvasThumbnailGridItem,
} from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInlineCreator } from "@manifest-editor/shell";
import { CanvasContext, useRange, useVault } from "react-iiif-vault";

export function BulkActionsWorkbench() {
  const range = useRange();
  const vault = useVault();
  const creator = useInlineCreator();

  if (!range) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">
        Bulk Actions ({range.items?.length || 0} canvases)
      </h3>
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
          Split into multiple ranges
        </ActionButton>
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
