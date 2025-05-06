import { Modal } from "@manifest-editor/components";
import {
  type LayoutPanel,
  useCollectionEditor,
  useGenericEditor,
  useInlineCreator,
  useLayoutActions,
} from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { useCallback, useState } from "react";
import { CollectionContext, LocaleString, ManifestContext, useManifest, useThumbnail } from "react-iiif-vault";
import { CollectionPreviewItem } from "../components/CollectionPreviewItem";
import { ManifestPreviewItem } from "../components/ManifestPreviewItem";
import { PreviewManifestInBrowser } from "../components/PreviewManifestInBrowser";

export const collectionOverview: LayoutPanel = {
  id: "collection-overview",
  label: "Collection Overview",
  icon: "",
  render: () => <CollectionOverviewCenterPanel />,
};

export function CollectionOverviewCenterPanel() {
  const { structural } = useCollectionEditor();
  const items = structural.items.get();

  return (
    <ul aria-label="Collection items" className="grid grid-md p-3 gap-3 overflow-y-auto">
      {items.map((item) => {
        if (item.type === "Manifest") {
          return (
            <ManifestContext manifest={item.id} key={item.id}>
              <ManifestPreviewItem />
            </ManifestContext>
          );
        }

        return (
          <CollectionContext collection={item.id} key={item.id}>
            <CollectionPreviewItem />
          </CollectionContext>
        );
      })}
    </ul>
  );
}
