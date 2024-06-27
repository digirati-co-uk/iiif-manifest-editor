import { ExplorerAction } from "../IIIFExplorer.types";

export const clipboardTarget: ExplorerAction<"clipboard"> = {
  label: "Copy to clipboard",
  action: (resource) => {
    return navigator.clipboard.writeText(typeof resource === "string" ? resource : JSON.stringify(resource, null, 2));
  },
};
