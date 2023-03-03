import { ExplorerAction } from "../IIIFExplorer.types";
import { ManifestNormalized } from "@iiif/presentation-3";

export const openNewWindowTarget: ExplorerAction<"open-new-window"> = {
  label: "Open",
  action: (resource, options, parent, vault) => {
    let canvas = "";
    let canvasIndex = "";
    let manifest = "";
    if (parent?.type === "Manifest") {
      manifest = parent?.id;
      canvas = typeof resource === "string" ? resource : JSON.stringify(resource);

      const manifestVault = vault.get<ManifestNormalized>(manifest);
      if (manifestVault) {
        const found = manifestVault.items.findIndex((item) => item.id === canvas);
        if (found !== -1) {
          canvasIndex = `${found}`;
        }
      }
    } else {
      manifest = typeof resource === "string" ? resource : JSON.stringify(resource);
    }

    let targetUrl = options.urlPattern.replace(/{RESULT}/, typeof resource === "string" ? resource : JSON.stringify(resource));

    targetUrl = targetUrl.replace(/{MANIFEST}/, manifest || "");
    targetUrl = targetUrl.replace(/{CANVAS}/, canvas || "");
    targetUrl = targetUrl.replace(/{CANVAS_INDEX}/, canvasIndex || "");

    const opened = window.open(targetUrl, options.target || "_blank", options.features || "noreferrer");

    if (options.cb) {
      options.cb(resource, opened);
    }
  },
};
