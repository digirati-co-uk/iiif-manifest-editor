import { ExplorerAction } from "../IIIFExplorer.types";
import { ManifestNormalized } from "@iiif/presentation-3";

export const openNewWindowTarget: ExplorerAction<"open-new-window"> = {
  label: "Open",
  action: (data, ref, options, vault) => {
    const urlPattern = options.urlPattern || "{RESULT}";
    const resource = vault.get(ref, { skipSelfReturn: false });
    const parent = ref.parent;

    let canvas = "";
    let canvasIndex = "";
    let manifest = "";
    let xywh = "";

    if (ref.type === "Canvas" && ref.selector && ref.selector.spatial) {
      xywh = [
        ~~ref.selector.spatial.x,
        ~~ref.selector.spatial.y,
        ~~(ref.selector.spatial.width || 1),
        ~~(ref.selector.spatial.height || 1),
      ].join(",");
    }

    if (parent?.type === "Manifest") {
      manifest = parent?.id;
      canvas = data;

      const manifestVault = vault.get<ManifestNormalized>(manifest);
      if (manifestVault) {
        const found = manifestVault.items.findIndex((item) => item.id === canvas);
        if (found !== -1) {
          canvasIndex = `${found}`;
        }
      }
    } else {
      manifest = data;
    }

    let targetUrl = urlPattern.replace(/{RESULT}/, data);

    targetUrl = targetUrl.replace(/{MANIFEST}/, manifest || "");
    targetUrl = targetUrl.replace(/{CANVAS}/, canvas || "");
    targetUrl = targetUrl.replace(/{CANVAS_INDEX}/, canvasIndex || "");
    targetUrl = targetUrl.replace(/{XYWH}/, xywh || "");

    const opened = window.open(targetUrl, options.target || "_blank", options.features || "noreferrer");

    if (options.cb) {
      options.cb(resource, opened);
    }
  },
};
