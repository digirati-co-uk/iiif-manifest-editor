import { Vault } from "@iiif/helpers";
import type { CreatorContext } from "@manifest-editor/creator-api";
import { PreviewVaultBoundary } from "@manifest-editor/shell";
import { IIIFBrowser, type IIIFBrowserProps } from "iiif-browser";
import { useMemo } from "react";

export default function ManifestBrowserCreatorForm(props: CreatorContext) {
  const vault = useMemo(() => new Vault(), []);
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        label: "Select",
        supportedTypes: ["Manifest", "Collection"],
        cb: (resource) => props.runCreate({ output: resource }),
        format: { type: "content-state" },
      },
    ] as IIIFBrowserProps["output"];
  }, [props.runCreate]);

  const navigationOptions = useMemo(() => {
    return {
      canCropImage: false,
      canSelectCanvas: false,
      canSelectManifest: true,
      canSelectCollection: true,
      // @todo fix the output so this one works.
      multiSelect: false,
    };
  }, []);

  const uiOptions = useMemo(() => {
    return {
      buttonClassName: "bg-me-primary-500 text-white hover:bg-me-primary-600",
    } as IIIFBrowserProps["ui"];
  }, []);

  return (
    <PreviewVaultBoundary>
      <IIIFBrowser
        debug
        ui={uiOptions}
        vault={vault}
        className="iiif-browser border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
        output={output}
        navigation={navigationOptions}
      />
    </PreviewVaultBoundary>
  );
}
