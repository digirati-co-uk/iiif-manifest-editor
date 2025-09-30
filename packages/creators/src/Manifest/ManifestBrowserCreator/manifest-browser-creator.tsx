import {
  type BoxSelector,
  createThumbnailHelper,
  normaliseContentState,
  parseContentState,
} from "@iiif/helpers";
import type {
  CreatorFunctionContext,
  CreatorResource,
} from "@manifest-editor/creator-api";
import type { Resource } from "@manifest-editor/shell";
import { lazy } from "react";
import invariant from "tiny-invariant";

export interface ManifestBrowserCreatorPayload {
  // This is the output (JSON) from the IIIF Browser.
  // We could have gone with "IIIF Content State" here and may do in the future, but this
  // will simplify parsing and importing resources.
  output: Array<{
    resource: any;
    parent: { id: string; type: string } | undefined;
    selector: BoxSelector | undefined;
  }>;
}

export async function createFromManifestBrowserOutput(
  data: ManifestBrowserCreatorPayload,
  ctx: CreatorFunctionContext,
) {
  const inputItems = data.output || [];
  const itemsToAdd: CreatorResource[] = [];

  for (const item of inputItems) {
    const { resource, parent, selector } = item;

    const previewVault = ctx.getPreviewVault();
    const thumbnails = createThumbnailHelper(previewVault);

    if (resource.type === "Manifest") {
      const manifestId = resource.id;
      invariant(manifestId, "Could not find Manifest ID");

      // 1st. Check the preview vault.
      const manifest = await previewVault.loadManifest(manifestId);
      console.log({ manifestId, manifest });
      const thumbnail = await thumbnails.getBestThumbnailAtSize(
        manifest,
        { width: 256, height: 256 },
        false,
      );

      invariant(manifest, "Manifest not found");
      itemsToAdd.push(
        ctx.embed({
          id: resource.id,
          type: "Manifest",
          label: manifest.label,
          summary: manifest.summary,
          thumbnail: thumbnail?.best
            ? [
                {
                  id: thumbnail.best.id,
                  type: "Image",
                },
              ]
            : undefined,
        }),
      );
      continue;
    }

    if (resource.type === "Collection") {
      const collectionId = resource.id;
      invariant(collectionId, "Could not find Manifest ID");
      const collection = await previewVault.loadManifest(collectionId);

      invariant(collection, "Collection not found");
      itemsToAdd.push(
        ctx.embed({
          id: resource.id,
          type: "Collection",
          label: collection.label,
        }),
      );
    }
  }

  return itemsToAdd;
}
export const ManifestBrowserCreatorForm = lazy(
  () => import("./manifest-browser-form.lazy"),
);
