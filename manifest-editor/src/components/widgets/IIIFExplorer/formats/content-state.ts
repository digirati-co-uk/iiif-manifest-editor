import { ExplorerFormat } from "../IIIFExplorer.types";

export const contentStateFormat: ExplorerFormat<"content-state"> = {
  label: "Content state",
  supportedTypes: ["Collection", "Manifest", "Canvas", "CanvasRegion"],
  format: async (resource: any, options: any, parent: any) => {
    if (resource.type === "Collection") {
      //
    }

    if (resource.type === "Manifest") {
      // just manifest
    }

    if (resource.type === "Canvas" || resource.type === "CanvasRegion") {
      // which manifest is it in?
    }
  },
};
