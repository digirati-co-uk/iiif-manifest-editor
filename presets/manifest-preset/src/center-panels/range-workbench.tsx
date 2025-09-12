import { createRangeHelper, type RangeTableOfContentsNode } from "@iiif/helpers";
import { moveEntities } from "@iiif/helpers/vault/actions";
import { toRef } from "@iiif/parser";
import { ActionButton, CanvasThumbnailGridItem, InfoMessage, WarningMessage } from "@manifest-editor/components";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInStack } from "@manifest-editor/editors";
import { type LayoutPanel, useEditingStack, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo } from "react";
import { CanvasContext, LocaleString, RangeContext, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { flattenedRanges } from "../left-panels/components/RangeTree";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { BulkActionsWorkbench } from "./components/BulkActionsWorkbench";
import { RangeWorkbenchSection } from "./components/RangeWorkbenchSection";
export const rangeWorkbench: LayoutPanel = {
  id: "range-workbench",
  label: "Range Workbench",
  icon: "",
  render: () => <RangeWorkbench />,
};

function RangeWorkbench() {
  const selectedRange = useInStack("Range");
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const creator = useInlineCreator();

  const { isSplitting, setIsSplitting, splitEffect } = useRangeSplittingStore();

  useEffect(splitEffect, [selectedRange]);

  const topLevelRange = useVaultSelector(
    (_, vault) => {
      const selected = toRef<any>(selectedRange?.resource);
      if (selected) {
        return helper.rangeToTableOfContentsTree(vault.get(selected)!);
      }

      if (!manifest!.structures) {
        return null;
      }

      const structures = vault.get(manifest!.structures || []);
      return helper.rangesToTableOfContentsTree(structures)! || {};
    },
    [manifest, selectedRange],
  );

  const onSplit = useCallback(
    async (range: RangeTableOfContentsNode, item: RangeTableOfContentsNode) => {
      if (!topLevelRange) {
        return;
      }

      // @todo Batch all of these actions as one.

      const index = (range.items || []).indexOf(item);
      const fullRange = vault.get({ id: range.id, type: "Range" });
      if (!fullRange) {
        console.error("Range not found", range.id);
        return;
      }

      const length = fullRange.items.length - index;

      // // 1. Remove the items
      // const slicedItems = fullRange.items!.slice(index);
      // const rangeEditor = new EditorInstance({
      //   reference: { id: range.id, type: "Range" },
      //   vault,
      // });

      // if (slicedItems.length === 0 || slicedItems.length === fullRange.items!.length) {
      //   console.error("No items to split");
      //   return;
      // }

      // for (let i = index; i < fullRange.items.length; i++) {
      //   rangeEditor.structural.items.deleteAtIndex(index);
      // }
      // // 2. Create new range, with new items.

      const atIndex = (topLevelRange.items || []).indexOf(range) + 1;
      if (atIndex === -1) {
        console.error("Range not found", range.id);
        return;
      }

      // slicedItems
      const newRange = (await creator.create(
        "@manifest-editor/range-with-items",
        {
          type: "Range",
          label: { en: ["Untitled range"] },
          items: [],
        },
        {
          parent: {
            property: "items",
            resource: { id: topLevelRange.id, type: "Range" },
            atIndex,
          },
        },
      )) as { id: string; type: "Range" };

      vault.dispatch(
        moveEntities({
          subjects: {
            type: "slice",
            startIndex: index,
            length: length,
          },
          from: {
            id: range.id,
            type: "Range",
            key: "items",
          },
          to: {
            id: newRange.id,
            type: "Range",
            key: "items",
            // index not specified - should append to end
          },
        }),
      );
    },
    [topLevelRange, vault, creator],
  );

  const { edit } = useLayoutActions();
  const { back } = useEditingStack();

  if (!topLevelRange) {
    return null;
  }

  const hasCanvases = (topLevelRange.items || []).filter((item) => item.type === "Canvas");

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <span className="text-gray-500">Range workbench</span>
      {selectedRange ? <ActionButton onPress={() => back()}>Go Back</ActionButton> : null}
      <LocaleString as="h3" className="text-2xl">
        {topLevelRange.label}
      </LocaleString>
      <hr className="my-4 border-b border-b-gray-300" />
      {isSplitting ? (
        <InfoMessage className="my-4 flex gap-4 sticky top-2 z-20">
          Splitting range, click to confirm the two new ranges
          <ActionButton onPress={() => setIsSplitting(false)}>Exit splitting mode</ActionButton>
        </InfoMessage>
      ) : null}

      {(topLevelRange.items || []).map((item) => {
        if (item.type === "Canvas") {
          return null;
        }

        return <RangeWorkbenchSection isSplitting={isSplitting} onSplit={onSplit} key={item.id} range={item} />;
      })}

      {hasCanvases.length ? (
        <RangeContext range={topLevelRange.id}>
          <BulkActionsWorkbench />
        </RangeContext>
      ) : null}
    </div>
  );
}
