import type { CreatorContext } from "@manifest-editor/creator-api";
import { PreviewVaultBoundary, usePreviewVault } from "@manifest-editor/shell";
import { IIIFBrowser, type IIIFBrowserProps } from "iiif-browser";
import { useMemo } from "react";

export interface IIIFBrowserCreatorInitialData {
  iiifBrowserOptions?: Partial<IIIFBrowserProps>;
}

export default function IIIFBrowserCreatorForm(props: CreatorContext) {
  const initialData: IIIFBrowserCreatorInitialData = useMemo(() => {
    return props.options.initialData || {};
  }, [props.options.initialData]);

  const vault = usePreviewVault();
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        label: "Select",
        supportedTypes: ["Canvas", "CanvasList", "CanvasRegion", "ImageService", "ImageServiceRegion"],
        cb: (resource) => props.runCreate({ output: resource }),
        format: {
          type: "custom",
          format: (resource, parent, vault) => {
            const resourcesAsArray = Array.isArray(resource) ? resource : [{ ...resource, parent }];
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
      canCropImage: true,
      canSelectCanvas: true,
      canSelectManifest: false,
      canSelectCollection: false,
      // @todo fix the output so this one works.
      multiSelect: true,
      ...(initialData.iiifBrowserOptions?.navigation || {}),
    } as IIIFBrowserProps["navigation"];
  }, [initialData]);

  const uiOptions = useMemo(() => {
    return {
      buttonClassName: "bg-me-primary-500 text-white hover:bg-me-primary-600",
      homeLink: `${window.location.origin}/collection.json`,
      // /collection.json
      ...(initialData.iiifBrowserOptions?.ui || {}),
    } as IIIFBrowserProps["ui"];
  }, [initialData]);

  return (
    <PreviewVaultBoundary>
      <IIIFBrowser
        ui={uiOptions}
        vault={vault}
        className="iiif-browser border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
        output={output}
        navigation={navigationOptions}
        customPages={initialData.iiifBrowserOptions?.customPages || {}}
        history={initialData.iiifBrowserOptions?.history || {}}
      />
    </PreviewVaultBoundary>
  );
}
