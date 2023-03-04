import { ExplorerAction } from "../IIIFExplorer.types";

export const inputTarget: ExplorerAction<"input"> = {
  label: "Select",
  action: (resource, ref, options) => {
    if (options.el && options.el.current) {
      options.el.current.value = typeof resource === "string" ? resource : JSON.stringify(resource);
    }
  },
};
