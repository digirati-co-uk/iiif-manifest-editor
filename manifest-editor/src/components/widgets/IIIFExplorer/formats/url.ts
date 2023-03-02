import { ExplorerFormat } from "../IIIFExplorer.types";

export const urlFormat: ExplorerFormat<"url"> = {
  label: "URL",
  supportedTypes: ["Collection", "Manifest", "ImageService"],
  format: async (resource: any) => {
    return resource.id || resource["@id"];
  },
};
