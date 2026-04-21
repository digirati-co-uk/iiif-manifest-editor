import { addReference, batchActions, importEntities, removeReference } from "@iiif/helpers/vault/actions";
import type { BackgroundActionRunContext } from "@manifest-editor/shell";
import type { DoclingParsedRegion } from "./docling";

export const OCR_DOCLING_ID_SEGMENT = "/ocr-docling/";
export const OCR_DOCLING_COORDINATE_SCALE = 500;

export type WrittenOcrAnnotation = {
  id: string;
  bodyId: string;
  text: string;
  category: string;
  target: string;
};

export function writeDoclingRegionAnnotations(
  ctx: BackgroundActionRunContext,
  canvas: any,
  regions: DoclingParsedRegion[],
): WrittenOcrAnnotation[] {
  if (!canvas?.id) {
    return [];
  }

  const canvasWidth = Number(canvas.width);
  const canvasHeight = Number(canvas.height);
  if (!Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight) || canvasWidth <= 0 || canvasHeight <= 0) {
    throw new Error("Canvas dimensions unavailable");
  }

  const page = getDefaultAnnotationPage(ctx, canvas);
  const pageId = page?.id || `${trimTrailingSlash(canvas.id)}/annotations`;
  const previousItems = page?.items || [];
  const previousOcrItems = previousItems.filter((item: any) => isOcrDoclingId(item?.id));
  const annotations = createAnnotations(canvas.id, canvasWidth, canvasHeight, regions);
  const entities: any = {
    Annotation: {},
    ContentResource: {},
  };
  const actions: any[] = [];

  if (!page) {
    actions.push(
      importEntities({
        entities: {
          AnnotationPage: {
            [pageId]: {
              id: pageId,
              type: "AnnotationPage",
              label: { en: ["Inline annotations"] },
              items: [],
            },
          },
        },
      }),
    );
    actions.push(
      addReference({
        id: canvas.id,
        type: "Canvas",
        key: "annotations",
        reference: {
          id: pageId,
          type: "AnnotationPage",
        },
      }),
    );
  }

  for (const item of previousOcrItems) {
    actions.push(
      removeReference({
        id: pageId,
        type: "AnnotationPage",
        key: "items",
        reference: {
          id: item.id,
          type: "Annotation",
        },
      }),
    );
  }

  for (const annotation of annotations) {
    entities.Annotation[annotation.id] = {
      id: annotation.id,
      type: "Annotation",
      motivation: "supplementing",
      body: [
        {
          id: annotation.bodyId,
          type: "ContentResource",
        },
      ],
      target: annotation.target,
    };
    entities.ContentResource[annotation.bodyId] = {
      id: annotation.bodyId,
      type: "TextualBody",
      format: "text/plain",
      value: annotation.text,
    };
  }

  if (annotations.length) {
    actions.push(importEntities({ entities }));

    for (const annotation of annotations) {
      actions.push(
        addReference({
          id: pageId,
          type: "AnnotationPage",
          key: "items",
          reference: {
            id: annotation.id,
            type: "Annotation",
          },
        }),
      );
    }
  }

  if (actions.length) {
    ctx.vault.dispatch(batchActions({ actions }));
  }

  return annotations;
}

function getDefaultAnnotationPage(ctx: BackgroundActionRunContext, canvas: any) {
  const firstPage = canvas?.annotations?.[0];
  return firstPage ? ctx.vault.get(firstPage) : null;
}

function createAnnotations(canvasId: string, canvasWidth: number, canvasHeight: number, regions: DoclingParsedRegion[]) {
  const annotations: WrittenOcrAnnotation[] = [];

  for (const region of regions) {
    const text = region.text.trim();
    if (!text) {
      continue;
    }

    const targetBox = scaleRegionToCanvas(region, canvasWidth, canvasHeight);
    if (!targetBox) {
      continue;
    }

    const index = annotations.length + 1;
    const idBase = `${trimTrailingSlash(canvasId)}${OCR_DOCLING_ID_SEGMENT}${index}`;
    const target = `${canvasId}#xywh=${targetBox.x},${targetBox.y},${targetBox.width},${targetBox.height}`;

    annotations.push({
      id: `${idBase}/annotation`,
      bodyId: `${idBase}/body`,
      text,
      category: region.category,
      target,
    });
  }

  return annotations;
}

function scaleRegionToCanvas(region: DoclingParsedRegion, canvasWidth: number, canvasHeight: number) {
  const x1 = clamp(Math.round((region.bbox.left / OCR_DOCLING_COORDINATE_SCALE) * canvasWidth), 0, canvasWidth);
  const y1 = clamp(Math.round((region.bbox.top / OCR_DOCLING_COORDINATE_SCALE) * canvasHeight), 0, canvasHeight);
  const x2 = clamp(Math.round((region.bbox.right / OCR_DOCLING_COORDINATE_SCALE) * canvasWidth), 0, canvasWidth);
  const y2 = clamp(Math.round((region.bbox.bottom / OCR_DOCLING_COORDINATE_SCALE) * canvasHeight), 0, canvasHeight);
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isOcrDoclingId(id: string | undefined) {
  return !!id && id.includes(OCR_DOCLING_ID_SEGMENT);
}

function trimTrailingSlash(id: string) {
  return id.endsWith("/") ? id.slice(0, -1) : id;
}
