import { CreatorSideEffect } from "@/creator-api";
import { ImageService, SpecificResource } from "@iiif/presentation-3";
import { centerRectangles } from "@/helpers/center-rectangles";
import { isImageService } from "@atlas-viewer/iiif-image-api";
import { EditorInstance } from "@/editor-api/EditorInstance";

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

      const width = imageService?.width || body.width;
      const height = imageService?.height || body.height;

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
