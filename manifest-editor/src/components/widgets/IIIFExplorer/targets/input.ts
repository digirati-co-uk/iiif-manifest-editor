import { ExplorerAction } from "../IIIFExplorer.types";

export const inputTarget: ExplorerAction<"input"> = {
  label: "Select",
  action: (resource, options) => {
    if (options.el) {
      options.el.value = typeof resource === "string" ? resource : JSON.stringify(resource);
    }
  },
};
