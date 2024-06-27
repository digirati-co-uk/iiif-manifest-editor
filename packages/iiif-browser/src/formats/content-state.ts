import { ExplorerFormat } from "../IIIFExplorer.types";
import { ContentState, serialiseContentState } from "@iiif/helpers";
import { Reference } from "@iiif/presentation-3";
import { CanvasNormalized } from "@iiif/presentation-3-normalized";

export const contentStateFormat: ExplorerFormat<"content-state"> = {
  label: "Content state",
  supportedTypes: ["Collection", "Manifest", "Canvas", "CanvasRegion", "CanvasList"],
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
      if (ref.listing && ref.listing.length) {
        base.target = ref.listing.map((canvas: any) =>
          createCanvasTarget(canvas, vault.get(canvas), canvas.parent || resource)
        );
      } else {
        // just manifest
        base.target = {
          id: resource.id,
          type: "Manifest",
        };
      }
    }

    if (resource.type === "Canvas") {
      base.target = createCanvasTarget(ref, resource, parent);
    }

    return options.encoded ? serialiseContentState(base as ContentState) : JSON.stringify(base);
  },
};

function createCanvasTarget(ref: any, resource: CanvasNormalized, parent: Reference) {
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
    return {
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
    return {
      id: resource.id + selector,
      type: "Canvas",
    };
  }
}
