import { SpecificResource } from "@iiif/presentation-3";
import { CreatorSideEffect } from "@manifest-editor/creator-api";
import { EditorInstance } from "@manifest-editor/editor-api";

export const resizeResourceToEmptyCanvas: CreatorSideEffect = {
  canvasInteraction: true,
  spatial: true,
  async run(result, { vault, options }) {
    if (result && result.type === "Annotation" && options.targetType === "Annotation") {
      const fullAnno = vault.get<any>(result);

      const target = fullAnno.target as SpecificResource;
      if (!(target && target.source?.type === "Canvas")) {
        return;
      }

      const canvasRef = target.source;
      const canvas = vault.get(canvasRef);
      if (!canvas.items) {
        return;
      }

      const annoPage = vault.get(canvas.items[0]);
      if (!annoPage) {
        return;
      }

      if (annoPage.items.length > 1) {
        return;
      }

      const bodies = vault.get(fullAnno.body);
      if (bodies.length !== 1) {
        return;
      }

      const body = bodies[0];
      const selector = fullAnno.body[0]?.selector;

      const service = (body.service || [])[0];

      let width = service?.width || body.width;
      let height = service?.height || body.height;
      const duration = body.duration || service?.duration;

      if (selector) {
        if ((selector.type === "iiif:ImageApiSelector" || selector.type === "ImageApiSelector") && selector.region) {
          const [x, y, width_, height_] = selector.region.split(",");

          width = Number(width_) || width;
          height = Number(height_) || height;
        }
      }

      const editor = new EditorInstance({ vault, reference: canvasRef });
      vault.batch(() => {
        if (typeof width !== "undefined") {
          editor.technical.width.set(width);
        }
        if (typeof height !== "undefined") {
          editor.technical.height.set(height);
        }
        if (typeof duration !== "undefined") {
          editor.technical.duration.set(duration);
        }
      });
    }
  },
};
