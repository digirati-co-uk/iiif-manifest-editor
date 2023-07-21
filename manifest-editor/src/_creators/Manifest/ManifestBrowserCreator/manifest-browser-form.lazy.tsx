import { CreatorContext } from "@/creator-api";
import {
  HOMEPAGE_COLLECTION,
  PreviewVaultBoundary,
  usePreviewHistory,
  usePreviewVault,
} from "@/shell/PreviewVault/PreviewVault";
import { IIIFExplorer } from "@/components/widgets/IIIFExplorer/IIIFExplorer";

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
