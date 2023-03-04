import { ExplorerFormat } from "../IIIFExplorer.types";

export const jsonFormat: ExplorerFormat<"json"> = {
  label: "JSON",
  supportedTypes: ["Manifest", "Canvas"],
  format: async (ref, options: any, vault) => {
    const resource = vault.get<any>(ref, { skipSelfReturn: false });
    const parent = ref.parent;
    return JSON.stringify(resource, null, options.pretty ? 2 : 0);
  },
};
