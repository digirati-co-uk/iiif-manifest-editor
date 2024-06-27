import { useManifest, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import { CreatorDefinition, CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { ThumbnailStripIcon } from "@manifest-editor/ui/icons/ThumbnailStripIcon";

export const internalCanvas: CreatorDefinition = {
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
};

function InternalCanvas(props: CreatorContext<InternalCanvasPayload>) {
  const manifest = useManifest();
  const vault = useVault();

  invariant(manifest, "Manifest is not loaded");

  return (
    <IIIFExplorer
      vault={vault}
      entry={manifest}
      window={false}
      hideHeader={true}
      hideBack
      output={{ type: "url" }}
      outputTargets={[
        {
          type: "callback",
          label: "Select canvas",
          cb: (url: string) => {
            props.runCreate({ id: url });
          },
        },
      ]}
      outputTypes={["Canvas"]}
    />
  );
}

interface InternalCanvasPayload {
  id: string;
}

async function createInternalCanvas(data: InternalCanvasPayload, ctx: CreatorFunctionContext) {
  return ctx.embed({ id: data.id, type: "Canvas" });
}
