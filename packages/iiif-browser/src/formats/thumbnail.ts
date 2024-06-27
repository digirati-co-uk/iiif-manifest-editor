import { ExplorerFormat } from "../IIIFExplorer.types";
import { createThumbnailHelper } from "@iiif/helpers";

export const thumbnailFormat: ExplorerFormat<"thumbnail"> = {
  label: "Thumbnail",
  format: async (resource, options, vault) => {
    const thumb = await createThumbnailHelper(vault).getBestThumbnailAtSize(
      resource,
      options.options || { width: 256 }
    );

    return thumb.best ? thumb.best.id : null;
  },
  supportedTypes: ["Manifest", "Canvas", "ImageService"],
};
