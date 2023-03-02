import { ExplorerFormat } from "../IIIFExplorer.types";

export const jsonFormat: ExplorerFormat<"json"> = {
  label: "JSON",
  supportedTypes: ["Manifest", "Canvas"],
  format: async (resource: any, options: any) => {
    return JSON.stringify(resource, null, options.pretty ? 2 : 0);
  },
};
