import { ExplorerFormat } from "../IIIFExplorer.types";

export const customFormat: ExplorerFormat<"custom"> = {
  label: "Custom",
  format: (resource, options, parentResource) => {
    options.format(resource, parentResource);
  },
  supportedTypes: ["Collection", "Manifest", "Canvas", "ImageService", "CanvasRegion", "ImageServiceRegion"],
};
