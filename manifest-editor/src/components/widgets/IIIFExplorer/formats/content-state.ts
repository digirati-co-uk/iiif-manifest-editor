import { ExplorerFormat } from "../IIIFExplorer.types";
import { ContentState, serialiseContentState } from "@iiif/vault-helpers";

export const contentStateFormat: ExplorerFormat<"content-state"> = {
  label: "Content state",
  supportedTypes: ["Collection", "Manifest", "Canvas", "CanvasRegion"],
  format: async (ref, options, vault) => {
    const resource = vault.get<any>(ref, { skipSelfReturn: false });
    const parent = ref.parent;

    const base = {
      "@context": "http://iiif.io/api/presentation/3/context.json" as any,
      id: "",
      type: "Annotation",
      motivation: ["contentState"],
      target: {},
    };

    if (resource.type === "Collection") {
      base.target = {
        id: resource.id,
        type: "Collection",
      };
    }

    if (resource.type === "Manifest") {
      // just manifest
      base.target = {
        id: resource.id,
        type: "Manifest",
      };
    }

    if (resource.type === "Canvas") {
      let selector = "";
      if (ref.selector && ref.selector.type === "BoxSelector") {
        selector = `#xywh=${[
          ref.selector.spatial.x,
          ref.selector.spatial.y,
          ref.selector.spatial.width,
          ref.selector.spatial.height,
        ].join(",")}`;
      }

      // which manifest is it in?
      if (parent && parent.type === "Manifest") {
        base.target = {
          id: resource.id + selector,
          type: "Canvas",
          partOf: [
            {
              id: parent.id,
              type: "Manifest",
            },
          ],
        };
      } else {
        base.target = {
          id: resource.id + selector,
          type: "Canvas",
        };
      }
    }

    return options.encoded ? serialiseContentState(base as ContentState) : JSON.stringify(base);
  },
};
