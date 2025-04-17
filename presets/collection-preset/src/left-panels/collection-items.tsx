import { getValue } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import {
  IIIFBrowserIcon,
  ListEditIcon,
  ListingIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import { CollectionItemList, createAppActions, useInStack, useToggleList } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useCollectionEditor,
  useCreator,
  useLayoutActions,
  useSetCustomTitle,
} from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { useCollection } from "react-iiif-vault";

export const collectionItems: LayoutPanel = {
  id: "collection-items",
  label: "Collection Items",
  icon: <ListingIcon />,
  render: () => <CollectionItemsPanel />,
};

function CollectionItemsPanel() {
  const { edit } = useLayoutActions();
  const activeManifest = useInStack("Manifest");
  const activeCollection = useInStack("Collection");
  const [toggled, toggle] = useToggleList();
  const collection = useCollection({} as any);
  const { descriptive, structural } = useCollectionEditor();

  const [canCreateManifest, manifestActions] = useCreator(collection, "items", "Manifest");
  const [canCreateCollection, collectionActions] = useCreator(collection, "items", "Collection");

  const { items } = structural;

  return (
    <Sidebar>
      <SidebarHeader
        title="Manifests and Collections"
        actions={[
          {
            icon: <ListEditIcon />,
            title: "Edit items",
            toggled: toggled.items,
            onClick: () => toggle("items"),
          },
          {
            icon: <IIIFBrowserIcon className="text-2xl" />,
            title: "IIIF Browser",
            onClick: () => manifestActions.creator("@manifest-editor/manifest-browser-creator"),
            disabled: !canCreateManifest,
          },
        ]}
      />
      <SidebarContent className="p-3">
        <CollectionItemList
          id={items.focusId()}
          list={items.get() || []}
          inlineHandle={false}
          activeId={activeManifest?.resource.source?.id || activeCollection?.resource.source?.id || ""}
          reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
          onSelect={(item, idx) =>
            toRef(item)?.type === "Manifest" ? manifestActions.edit(item, idx) : collectionActions.edit(item, idx)
          }
          createActions={createAppActions(items)}
        />
      </SidebarContent>
    </Sidebar>
  );
}
