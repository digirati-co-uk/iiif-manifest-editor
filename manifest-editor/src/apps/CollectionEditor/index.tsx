import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { useCollection } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import { Button } from "@/atoms/Button";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { descriptiveProperties } from "@/_editors/DescriptiveProperties";
import { metadata } from "@/_editors/Metadata";
import { technicalProperties } from "@/_editors/TechnicalProperties";
import { linkingProperties } from "@/_editors/LinkingProperties";
import { baseEditor } from "@/_panels/right-panels/BaseEditor";
import { baseCreator } from "@/_panels/right-panels/BaseCreator";
import { useCollectionEditor, useEditingStack } from "@/shell/EditingStack/EditingStack";
import { combinedProperties } from "@/_editors/CombinedEditor";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { toRef } from "@iiif/parser";
import { CollectionItemList } from "@/_components/ui/CollectionItemList/CollectionItemList";
import { useSetCustomTitle } from "@/shell/Layout/components/ModularPanel";
import { useInStack } from "@/_components/ui/CanvasPanelEditor/CanvasPanelEditor";
import { PreviewVaultBoundary } from "@/shell/PreviewVault/PreviewVault";
import { IIIFExplorer } from "@/components/widgets/IIIFExplorer/IIIFExplorer";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { manifestBrowserCreator } from "@/_creators/Manifest/ManifestBrowserCreator";
import { ExportPanel } from "@/_panels/center-panels/ExportPanel/ExportPanel";
import React from "react";

export default { id: "collection-editor", title: "Collection Editor", project: true, projectType: "Collection" };

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
  const { back } = useEditingStack();
  const manifest = useInStack("Manifest");

  if (!manifest) {
    return <div>No manifest selected</div>;
  }

  // @todo "use as thumbnail" option.
  return (
    <PreviewVaultBoundary key={manifest.resource.source.id}>
      <IIIFExplorer hideBack entry={manifest.resource.source} hideHeader window={false} />
    </PreviewVaultBoundary>
  );
}

function CollectionLeftPanel() {
  const { edit, open } = useLayoutActions();
  const manifest = useInStack("Manifest");
  const collection = useCollection({} as any);
  const { descriptive, structural } = useCollectionEditor();

  const [canCreateManifest, manifestActions] = useCreator(collection, "items", "Manifest");
  const [canCreateCollection, collectionActions] = useCreator(collection, "items", "Collection");

  const { items } = structural;

  const set = useSetCustomTitle();

  set(getValue(descriptive.label.get()));

  return (
    <PaddedSidebarContainer>
      <div>{collection ? <Button onClick={() => edit(collection)}>Edit collection</Button> : null}</div>

      <CollectionItemList
        id={items.focusId()}
        list={items.get() || []}
        inlineHandle={false}
        activeId={manifest?.resource.source.id}
        reorder={(t) => items.reorder(t.startIndex, t.endIndex)}
        onSelect={(item, idx) =>
          toRef(item)?.type === "Manifest" ? manifestActions.edit(item, idx) : collectionActions.edit(item, idx)
        }
        createActions={createAppActions(items)}
      />

      {canCreateManifest ? (
        <Button {...manifestActions.buttonProps} onClick={() => manifestActions.create()}>
          Add Manifest
        </Button>
      ) : null}
    </PaddedSidebarContainer>
  );
}
