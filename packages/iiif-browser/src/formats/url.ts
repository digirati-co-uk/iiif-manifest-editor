import { ExplorerFormat } from "../IIIFExplorer.types";

export const urlFormat: ExplorerFormat<"url"> = {
  label: "URL",
  supportedTypes: ["Collection", "Manifest", "Canvas", "ImageService"],
  format: async (resource: any, options) => {
    const parentResource = resource.parent;
    if (
      options.resolvable &&
      (resource.type !== "Manifest" || resource.type !== "Collection" || resource.type !== "ImageService")
    ) {
      return parentResource.id || parentResource["@id"];
    }
    return resource.id || resource["@id"];
  },
};
