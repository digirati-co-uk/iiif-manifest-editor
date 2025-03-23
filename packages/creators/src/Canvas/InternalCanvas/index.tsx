import type {
  CreatorContext,
  CreatorDefinition,
  CreatorFunctionContext,
} from "@manifest-editor/creator-api";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import { ThumbnailStripIcon } from "@manifest-editor/ui/icons/ThumbnailStripIcon";
import { useManifest, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";

export const internalCanvas: CreatorDefinition<InternalCanvasPayload> = {
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

export interface InternalCanvasPayload {
  id: string;
}

async function createInternalCanvas(
  data: InternalCanvasPayload,
  ctx: CreatorFunctionContext,
) {
  return ctx.embed({ id: data.id, type: "Canvas" });
}
