import { ExplorerFormat } from "../IIIFExplorer.types";
import { createThumbnailHelper } from "@iiif/vault-helpers";

export const thumbnailFormat: ExplorerFormat<"thumbnail"> = {
  label: "Thumbnail",
  format: async (resource, options, parentResource, vault) => {
    const thumb = await createThumbnailHelper(vault).getBestThumbnailAtSize(
      resource,
      options.options || { width: 256 }
    );

    return thumb.best ? thumb.best.id : null;
  },
  supportedTypes: ["Manifest", "Canvas", "ImageService"],
};
