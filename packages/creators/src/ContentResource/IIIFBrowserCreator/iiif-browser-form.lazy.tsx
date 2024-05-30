import { CreatorContext } from "@manifest-editor/creator-api";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import { HOMEPAGE_COLLECTION, PreviewVaultBoundary, usePreviewHistory, usePreviewVault } from "@manifest-editor/shell";

export default function IIIFBrowserCreatorForm(props: CreatorContext) {
  const vault = usePreviewVault();
  const { addHistory, clearHistory } = usePreviewHistory();

  return (
    <PreviewVaultBoundary>
      <IIIFExplorer
        window={false}
        hideHeader={true}
        outputTypes={["Canvas", "CanvasList", "CanvasRegion", "ImageService", "ImageServiceRegion"]}
        vault={vault}
        output={{ type: "content-state" }}
        homepageCollection={HOMEPAGE_COLLECTION}
        clearHomepageCollection={clearHistory}
        onHistory={addHistory}
        height={500}
        outputTargets={[
          {
            type: "callback",
            label: "Select",
            cb: (resource) => props.runCreate({ output: resource }),
          },
        ]}
        allowRemoveEntry
      />
    </PreviewVaultBoundary>
  );
}
