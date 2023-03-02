import { ExplorerAction } from "../IIIFExplorer.types";

export const openNewWindowTarget: ExplorerAction<"open-new-window"> = {
  label: "Open",
  action: (resource, options) => {
    const targetUrl = options.urlPattern.replace(
      /{RESULT}/,
      typeof resource === "string" ? resource : JSON.stringify(resource)
    );

    const opened = window.open(targetUrl, options.target || "_blank", options.features || "noreferrer");

    if (options.cb) {
      options.cb(resource, opened);
    }
  },
};
