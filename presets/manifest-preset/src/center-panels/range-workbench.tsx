import { createRangeHelper } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import {
  ActionButton,
  CanvasThumbnailGridItem,
  InfoMessage,
  WarningMessage,
} from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useEditingStack,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useMemo } from "react";
import {
  CanvasContext,
  LocaleString,
  RangeContext,
  useManifest,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { flattenedRanges } from "../left-panels/components/RangeTree";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { RangeWorkbenchSection } from "./components/RangeWorkbenchSection";
import { BulkActionsWorkbench } from "./components/BulkActionsWorkbench";

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
  const { isSplitting } = useRangeSplittingStore();
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

  const { edit } = useLayoutActions();
  const { back } = useEditingStack();

  if (!topLevelRange) {
    return null;
  }

  const hasCanvases = (topLevelRange.items || []).filter(
    (item) => item.type === "Canvas",
  );

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <span className="text-gray-500">Range workbench</span>
      {selectedRange ? (
        <ActionButton onPress={() => back()}>Go Back</ActionButton>
      ) : null}
      <LocaleString as="h3" className="text-2xl">
        {topLevelRange.label}
      </LocaleString>
      <hr className="my-4 border-b border-b-gray-300" />
      {isSplitting ? (
        <InfoMessage className="my-4">Splitting range</InfoMessage>
      ) : null}
      <div className="">
        {(topLevelRange.items || []).map((item) => {
          if (item.type === "Canvas") {
            return null;
          }

          return <RangeWorkbenchSection key={item.id} range={item} />;
        })}
      </div>
      <div>
        {hasCanvases.length ? (
          <RangeContext range={topLevelRange.id}>
            <BulkActionsWorkbench />
          </RangeContext>
        ) : null}
      </div>
    </div>
  );
}
