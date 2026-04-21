import { createThumbnailHelper } from "@iiif/helpers";
import type { BackgroundActionRunContext } from "@manifest-editor/shell";

export type CanvasImageForClassification = {
  url: string;
  blob: Blob;
};

export async function getCanvasImageForClassification(
  ctx: BackgroundActionRunContext,
  canvas: any,
): Promise<CanvasImageForClassification | null> {
  const paintingBody = getFirstPaintingBody(ctx, canvas);
  if (!paintingBody) {
    return null;
  }

  const thumbnailHelper = createThumbnailHelper(ctx.vault);
  const thumbnail = await thumbnailHelper.getBestThumbnailAtSize(
    paintingBody,
    {
      width: 512,
      height: 512,
      maxWidth: 512,
      maxHeight: 512,
      unsafeImageService: true,
      allowUnsafe: true,
      preferFixedSize: true,
    },
    false,
  );
  const url = thumbnail.best?.id;

  if (!url) {
    return null;
  }

  const response = await fetch(url, { signal: ctx.signal });
  if (!response.ok) {
    throw new Error(`Unable to fetch canvas image (${response.status}).`);
  }

  return {
    url,
    blob: await response.blob(),
  };
}

function getFirstPaintingBody(ctx: BackgroundActionRunContext, canvas: any) {
  const pages = canvas?.items ? ctx.vault.get(canvas.items) || [] : [];

  for (const page of pages) {
    const annotations = page?.items ? ctx.vault.get(page.items) || [] : [];
    for (const annotation of annotations) {
      if (!isPaintingAnnotation(annotation)) {
        continue;
      }

      const body = first(annotation?.body);
      if (!body) {
        continue;
      }

      return ctx.vault.get(body) || body;
    }
  }

  return null;
}

function isPaintingAnnotation(annotation: any) {
  const motivation = Array.isArray(annotation?.motivation) ? annotation.motivation : [annotation?.motivation];
  return motivation.includes("painting");
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
