import { isImageService } from "@iiif/parser/image-3";
import { ImageService, SpecificResource } from "@iiif/presentation-3";
import { CreatorSideEffect } from "@manifest-editor/creator-api";
import { EditorInstance } from "@manifest-editor/editor-api";
import { centerRectangles } from "@manifest-editor/editors";

export const repositionMultipleImages: CreatorSideEffect = {
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

      if (annoPage.items.length < 2) {
        return;
      }

      const bodies = vault.get(fullAnno.body);
      const body = bodies[0];
      const selector = fullAnno.body[0]?.selector;

      const serviceList = body.service || [];
      const imageService = serviceList.find((s: any) => isImageService(s)) as ImageService | undefined;
      if (imageService) {
        if (imageService.width && imageService.height) {
          if (imageService.width !== body.width) {
            vault.modifyEntityField({ id: body.id, type: "ContentResource" }, "width", imageService.width);
          }
          if (imageService.height !== body.height) {
            vault.modifyEntityField({ id: body.id, type: "ContentResource" }, "height", imageService.height);
          }
        }
      }

      let width = imageService?.width || body.width;
      let height = imageService?.height || body.height;

      if (selector) {
        if ((selector.type === "iiif:ImageApiSelector" || selector.type === "ImageApiSelector") && selector.region) {
          const [x, y, width_, height_] = selector.region.split(",");

          width = Number(width_) || width;
          height = Number(height_) || height;
        }
      }

      const editor = new EditorInstance({ vault, reference: result });

      const imagePosition = centerRectangles(
        canvas,
        {
          width: width,
          height: height,
        },
        0.6
      );

      editor.annotation.target.setPosition(imagePosition);
    }
  },
};
