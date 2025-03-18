import type { CreatorContext } from "@manifest-editor/creator-api";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import {
  HOMEPAGE_COLLECTION,
  PreviewVaultBoundary,
  usePreviewHistory,
  usePreviewVault,
} from "@manifest-editor/shell";
import { IIIFBrowser, type IIIFBrowserProps } from "iiif-browser";
import { useMemo } from "react";

export default function IIIFBrowserCreatorForm(props: CreatorContext) {
  const vault = usePreviewVault();
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        label: "Select",
        supportedTypes: [
          "Canvas",
          "CanvasList",
          "CanvasRegion",
          "ImageService",
          "ImageServiceRegion",
        ],
        cb: (resource) => props.runCreate({ output: resource }),
        format: { type: "content-state" },
      },
    ] as IIIFBrowserProps["output"];
  }, [props.runCreate]);

  return (
    <PreviewVaultBoundary>
      <IIIFBrowser
        vault={vault}
        className="iiif-browser border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
        output={output}
        navigation={{
          canCropImage: true,
          canSelectCanvas: true,
          canSelectManifest: false,
          canSelectCollection: false,
          // @todo fix the output so this one works.
          multiSelect: false,
        }}
      />
    </PreviewVaultBoundary>
  );
}
