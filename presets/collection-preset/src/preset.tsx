import {
  iiifBrowserCreator,
  imageServiceCreator,
  imageUrlCreator,
  manifestBrowserCreator,
  webPageCreator,
} from "@manifest-editor/creators";
import { allEditors, combinedProperties, metadata, useInStack } from "@manifest-editor/editors";
import { descriptiveProperties, linkingProperties, technicalProperties } from "@manifest-editor/editors";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import {
  type Config,
  ExportPanel,
  type LayoutPanel,
  type MappedApp,
  PreviewVaultBoundary,
  baseCreator,
  baseEditor,
} from "@manifest-editor/shell";
import { collectionOverview } from "./center-panels/collection-overview";
import { collectionItems } from "./left-panels/collection-items";
import { collectionSummary } from "./left-panels/collection-summary";

export default {
  id: "collection-editor",
  title: "Collection Editor",
  project: true,
  projectType: "Collection",
} satisfies MappedApp["metadata"];

export const config: Partial<Config> = {
  editorConfig: {
    Manifest: {
      fields: ["label", "summary", "metadata", "thumbnail"],
      singleTab: "@manifest-editor/overview",
    },
    Collection: {
      fields: ["label", "summary", "requiredStatement"],
    },
  },
};

export const centerPanels: LayoutPanel[] = [
  collectionOverview,
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
  //
  collectionSummary,
  collectionItems,
];
export const rightPanels: LayoutPanel[] = [baseEditor];

export const modals: LayoutPanel[] = [baseCreator];

export const editors = allEditors;

export const creators = [
  //
  imageUrlCreator,
  iiifBrowserCreator,
  imageServiceCreator,
  webPageCreator,
  manifestBrowserCreator,
];

export const resources = ["Collection", "Manifest", "ContentResource"];

function ViewManifest() {
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
