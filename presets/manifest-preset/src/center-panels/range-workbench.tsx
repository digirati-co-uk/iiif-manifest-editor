import { createRangeHelper } from "@iiif/helpers";
import {
  ActionButton,
  CanvasThumbnailGridItem,
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
  useManifest,
  useVault,
} from "react-iiif-vault";

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
  const topLevelRange =
    selectedRange && selectedRange.resource.source
      ? helper.rangeToTableOfContentsTree(
          vault.get(selectedRange.resource.source || {}),
        )
      : manifest!.structures
        ? helper.rangesToTableOfContentsTree(vault.get(manifest!.structures))
        : null;

  const { edit } = useLayoutActions();
  const { back } = useEditingStack();

  if (!topLevelRange) {
    return null;
  }

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
      <div className="grid grid-sm gap-3">
        {(topLevelRange.items || []).map((item) => {
          if (item.type !== "Canvas") {
            return (
              <div key={item.id}>
                <LocaleString>{item.label || "Untitled range"}</LocaleString>
                <ActionButton
                  onPress={() => edit({ id: item.id, type: "Range" })}
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
