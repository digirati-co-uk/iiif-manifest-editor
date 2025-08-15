import { type CreatorContext, type CreatorFunctionContext, defineCreator } from "@manifest-editor/creator-api";
import { IIIFBrowser, IIIFBrowserProps } from "iiif-browser";
import { ThumbnailStripIcon } from "@manifest-editor/ui/icons/ThumbnailStripIcon";
import { useManifest, useVault, VaultProvider } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { useMemo } from "react";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/internal-canvas": typeof internalCanvas;
    }
  }
}

export const internalCanvas = defineCreator({
  id: "@manifest-editor/internal-canvas",
  create: createInternalCanvas,
  label: "Internal canvas link",
  summary: "Canvas from the same manifest",
  icon: <ThumbnailStripIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["start"],
  },
  render: (ctx) => <InternalCanvas {...ctx} />,
});

function InternalCanvas(props: CreatorContext<InternalCanvasPayload>) {
  const manifest = useManifest();
  const vault = useVault();

  const navigationOptions = useMemo(() => {
    return {
      canSelectCanvas: false,
      canSelectCollection: false,
      canSelectManifest: true,
      canCropImage: false,
      alwaysShowNavigationArrow: false,
      multiSelect: false,
    } as IIIFBrowserProps["navigation"];
  }, []);

  const output = useMemo(() => {
    return [
      {
        type: "callback",
        cb: (url: string) => props.runCreate({ id: url }),
        label: "Select canvas",
        supportedTypes: ["Canvas"],
        format: { type: "url" },
      },
    ] as IIIFBrowserProps["output"];
  }, [props.runCreate]);

  const historyOptions = useMemo(() => {
    return {
      saveToLocalStorage: false,
      restoreFromLocalStorage: false,
      initialHistory: [
        {
          url: manifest?.id,
          resource: manifest?.id,
          route: `/loading?id=${manifest?.id}`,
          metadata: { type: "Manifest" },
        },
      ],
    } as IIIFBrowserProps["history"];
  }, [manifest?.id]);

  invariant(manifest, "Manifest is not loaded");

  console.log('manifest ->', vault.get(manifest))

  return (
    <VaultProvider vault={vault}>
      <IIIFBrowser
        vault={vault}
        navigation={navigationOptions}
        output={output}
        history={historyOptions}
      />
    </VaultProvider>
  );
}

export interface InternalCanvasPayload {
  id: string;
}

async function createInternalCanvas(data: InternalCanvasPayload, ctx: CreatorFunctionContext) {
  return ctx.embed({ id: data.id, type: "Canvas" });
}
