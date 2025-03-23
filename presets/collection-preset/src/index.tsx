import { getValue } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import {
  useInStack,
  createAppActions,
  combinedProperties,
  metadata,
  CollectionItemList,
} from "@manifest-editor/editors";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import {
  type LayoutPanel,
  ExportPanel,
  baseEditor,
  baseCreator,
  PreviewVaultBoundary,
  useLayoutActions,
  useCollectionEditor,
  useCreator,
  useSetCustomTitle,
} from "@manifest-editor/shell";
import {
  descriptiveProperties,
  technicalProperties,
  linkingProperties,
} from "@manifest-editor/editors";
import { manifestBrowserCreator } from "@manifest-editor/creators";
import { useCollection } from "react-iiif-vault";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { Button } from "@manifest-editor/ui/atoms/Button";

export default {
  id: "collection-editor",
  title: "Collection Editor",
  project: true,
  projectType: "Collection",
};

export const centerPanels: LayoutPanel[] = [
  {
    id: "center-panel-empty",
    label: "Center panel",
    icon: "",
    render: () => <ViewManifest />,
  },
  {
    id: "export",
    label: "Export",
    icon: "",
    render: () => <ExportPanel />,
  },
];
export const leftPanels: LayoutPanel[] = [
  {
    id: "left-panel-empty",
    label: "Left panel",
    icon: "",
    render: () => <CollectionLeftPanel />,
  },
];
export const rightPanels: LayoutPanel[] = [
  {
    id: "right-panel-empty",
    label: "Right panel",
    icon: "",
    render: () => <div />,
  },
  baseEditor,
  baseCreator,
];

export const editors = [
  // Generic
  combinedProperties,
  descriptiveProperties,
  metadata,
  technicalProperties,
  linkingProperties,
];

export const creators = [manifestBrowserCreator];

export const resources = ["Collection", "Manifest"];

function ViewManifest() {
  const manifest = useInStack("Manifest");

  if (!manifest) {
    return <div>No manifest selected</div>;
  }

  // @todo "use as thumbnail" option.
  return (
    <PreviewVaultBoundary key={manifest.resource.source.id}>
      <IIIFExplorer
        hideBack
        entry={manifest.resource.source}
        hideHeader
        window={false}
      />
    </PreviewVaultBoundary>
  );
}

function CollectionLeftPanel() {
  const { edit } = useLayoutActions();
  const manifest = useInStack("Manifest");
  const collection = useCollection({} as any);
  const { descriptive, structural } = useCollectionEditor();

  const [canCreateManifest, manifestActions] = useCreator(
    collection,
    "items",
    "Manifest",
  );
  const [canCreateCollection, collectionActions] = useCreator(
    collection,
    "items",
    "Collection",
  );

  const { items } = structural;

  const set = useSetCustomTitle();

  set(getValue(descriptive.label.get()));

  return (
    <PaddedSidebarContainer>
      <div>
        {collection ? (
          <Button onClick={() => edit(collection)}>Edit collection</Button>
        ) : null}
      </div>

      <CollectionItemList
        id={items.focusId()}
        list={items.get() || []}
        inlineHandle={false}
        activeId={manifest?.resource.source.id}
        reorder={(t) => items.reorder(t.startIndex, t.endIndex)}
        onSelect={(item, idx) =>
          toRef(item)?.type === "Manifest"
            ? manifestActions.edit(item, idx)
            : collectionActions.edit(item, idx)
        }
        createActions={createAppActions(items)}
      />

      {canCreateManifest ? (
        <Button
          {...manifestActions.buttonProps}
          onClick={() => manifestActions.create()}
        >
          Add Manifest
        </Button>
      ) : null}
    </PaddedSidebarContainer>
  );
}
