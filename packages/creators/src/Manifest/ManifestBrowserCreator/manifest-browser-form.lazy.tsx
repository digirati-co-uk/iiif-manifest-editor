import { CreatorContext } from "@manifest-editor/creator-api";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import { usePreviewVault, usePreviewHistory, PreviewVaultBoundary, HOMEPAGE_COLLECTION } from "@manifest-editor/shell";

export default function ManifestBrowserCreatorForm(props: CreatorContext) {
  const vault = usePreviewVault();
  const { addHistory, clearHistory } = usePreviewHistory();

  return (
    <>
      <PreviewVaultBoundary>
        <IIIFExplorer
          window={false}
          hideHeader={true}
          outputTypes={["Manifest", "Collection"]}
          vault={vault}
          output={{ type: "content-state" }}
          homepageCollection={HOMEPAGE_COLLECTION}
          clearHomepageCollection={clearHistory}
          onHistory={addHistory}
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
    </>
  );
}
