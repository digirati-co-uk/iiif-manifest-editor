import { CreatorSideEffect } from "@/creator-api";
import { SpecificResource } from "@iiif/presentation-3";
import { EditorInstance } from "@/editor-api/EditorInstance";

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

      const service = (body.service || [])[0];

      const width = service?.width || body.width;
      const height = service?.height || body.height;
      const duration = body.duration || service?.duration;

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
