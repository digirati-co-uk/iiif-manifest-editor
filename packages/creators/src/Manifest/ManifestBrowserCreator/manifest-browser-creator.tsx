import {
  type ContentState,
  normaliseContentState,
  parseContentState,
} from "@iiif/helpers";
import type { CreatorFunctionContext } from "@manifest-editor/creator-api";
import { lazy } from "react";
import invariant from "tiny-invariant";

export interface ManifestBrowserCreatorPayload {
  // This is the output (JSON) from the IIIF Browser.
  // We could have gone with "IIIF Content State" here and may do in the future, but this
  // will simplify parsing and importing resources.
  output: string | ContentState | ContentState[];
}

export async function createFromManifestBrowserOutput(
  data: ManifestBrowserCreatorPayload,
  ctx: CreatorFunctionContext,
) {
  const targetType = ctx.options.targetType as "Manifest" | "Collection";

  // For now..
  if (Array.isArray(data.output)) {
    throw new Error("Multiple items not yet supported");
  }

  const contentState = normaliseContentState(
    typeof data.output === "string"
      ? parseContentState(data.output)
      : data.output,
  );

  const target = contentState.target[0];
  const previewVault = ctx.getPreviewVault();

  if (!target) {
    throw new Error("No target found in content state");
  }

  if (targetType === "Manifest") {
    const manifestId = target.source.id;
    invariant(manifestId, "Could not find Manifest ID");
    const manifest = await previewVault.get(manifestId);
    return ctx.embed({
      id: target.source.id,
      type: "Manifest",
      label: manifest.label,
    });
  }

  if (targetType === "Collection") {
    const collectionId = target.source.id;
    invariant(collectionId, "Could not find Manifest ID");
    const collection = await previewVault.get(collectionId);
    return ctx.embed({
      id: target.source.id,
      type: "Collection",
      label: collection.label,
    });
  }

  throw new Error("Not yet supported.");
}
export const ManifestBrowserCreatorForm = lazy(
  () => import("./manifest-browser-form.lazy"),
);
