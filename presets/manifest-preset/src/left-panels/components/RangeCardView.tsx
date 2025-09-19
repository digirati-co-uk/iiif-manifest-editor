import { createRangeHelper } from "@iiif/helpers";
import { ActionButton, BackIcon, EmptyState } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { useEditingStack, useLayoutActions } from "@manifest-editor/shell";
import { useMemo } from "react";
import { GridList, GridListItem } from "react-aria-components";
import { LocaleString, useManifest, useVault, useVaultSelector } from "react-iiif-vault";

export function RangeCardView() {
  const vault = useVault();
  const manifest = useManifest();
  const rangeInStack = useInStack("Range");
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const { edit } = useLayoutActions();
  const { back } = useEditingStack();

  const range = useVaultSelector(
    (_, vault) => {
      if (rangeInStack) {
        return helper.rangeToTableOfContentsTree(vault.get(rangeInStack.resource))!;
      }

      const structures = vault.get(manifest!.structures || []);
      return helper.rangesToTableOfContentsTree(structures)! || {};
    },
    [vault, manifest, rangeInStack],
  );

  const filteredItems = useMemo(() => {
    return (range.items || []).filter((item) => item.type === "Range");
  }, [range]);

  const title = (
    <div className="flex items-center gap-4 mb-4">
      {rangeInStack ? (
        <>
          <ActionButton onPress={() => back()}>
            <BackIcon className="text-xl" />
          </ActionButton>
          <LocaleString as="h3">{range.label}</LocaleString>
        </>
      ) : null}
    </div>
  );

  if (range.isRangeLeaf) {
    return (
      <>
        {title}
        <EmptyState>This Range only contains canvases.</EmptyState>
      </>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <>
        {title}
        <EmptyState>No ranges found</EmptyState>
      </>
    );
  }

  return (
    <>
      {title}
      <GridList className="w-full flex flex-col gap-2" items={filteredItems}>
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
    </>
  );
}
