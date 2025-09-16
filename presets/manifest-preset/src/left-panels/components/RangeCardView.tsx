import { createRangeHelper } from "@iiif/helpers";
import { useMemo } from "react";
import {
  useVault,
  useManifest,
  useVaultSelector,
  LocaleString,
} from "react-iiif-vault";
import { useRangeTreeOptions, flattenedRanges } from "./RangeTree";
import { GridList, GridListItem } from "react-aria-components";
import { useLayoutActions } from "@manifest-editor/shell";
import { useInStack } from "@manifest-editor/editors";
import { EmptyState } from "@manifest-editor/components";

export function RangeCardView() {
  const vault = useVault();
  const manifest = useManifest();
  const rangeInStack = useInStack("Range");
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const { edit } = useLayoutActions();
  const { isEditing, showCanvases, toggleShowCanvases } = useRangeTreeOptions();

  const range = useVaultSelector(
    (_, vault) => {
      if (rangeInStack) {
        return helper.rangeToTableOfContentsTree(
          vault.get(rangeInStack.resource),
        )!;
      }

      const structures = vault.get(manifest!.structures || []);
      return helper.rangesToTableOfContentsTree(structures)! || {};
    },
    [vault, manifest, rangeInStack],
  );

  const filteredItems = useMemo(() => {
    return (range.items || []).filter((item) => item.type === "Range");
  }, [range]);

  if (filteredItems.length === 0) {
    return <EmptyState>No ranges found</EmptyState>;
  }

  return (
    <GridList className="w-full p-2 flex flex-col gap-2" items={filteredItems}>
      {(item) => (
        <GridListItem
          onAction={() => edit(item)}
          className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative p-4"
        >
          <LocaleString className="text-lg mb-4">{item.label}</LocaleString>
          <div className="text-sm text-me-primary-600">
            {item.items?.length} {item.isRangeLeaf ? "Canvases" : "Ranges"}
          </div>
        </GridListItem>
      )}
    </GridList>
  );
}
