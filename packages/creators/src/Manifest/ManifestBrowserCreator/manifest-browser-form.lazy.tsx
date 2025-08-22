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
        supportedTypes: [
          "Manifest",
          "Collection",
          "ManifestList",
          "CollectionList",
          "CollectionItemList",
        ],
        cb: (resource) => props.runCreate({ output: resource }),
        format: {
          type: "custom",
          format: (resource, parent, vault) => {
            const resourcesAsArray = Array.isArray(resource)
              ? resource
              : [{ ...resource, parent }];
            const resources = [];
            for (const resource of resourcesAsArray) {
              resources.push({
                resource: vault.get(resource),
                parent: resource.parent,
                selector: resource.selector,
              });
            }
            return resources;
          },
        },
      },
    ] as IIIFBrowserProps["output"];
  }, [props.runCreate]);

  const navigationOptions = useMemo(() => {
    return {
      canCropImage: false,
      canSelectCanvas: false,
      canSelectManifest: true,
      canSelectCollection: true,
      multiSelect: true,
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
        ui={uiOptions}
        vault={vault}
        className="iiif-browser border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
        output={output}
        navigation={navigationOptions}
      />
    </PreviewVaultBoundary>
  );
}
