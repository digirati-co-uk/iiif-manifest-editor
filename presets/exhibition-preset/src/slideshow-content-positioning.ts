import { create } from "zustand";

export interface SlideContentBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideContentLayer {
  annotation: any;
  box: SlideContentBox;
  html: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  youtubeId: string | null;
}

interface SlideshowContentPositioningState {
  selectedAnnotationId: string | null;
  repositioningAnnotationId: string | null;
  selectAnnotation: (id: string | null) => void;
  startRepositioning: (id: string) => void;
  stopRepositioning: () => void;
  clear: () => void;
}

export const useSlideshowContentPositioning =
  create<SlideshowContentPositioningState>((set) => ({
    selectedAnnotationId: null,
    repositioningAnnotationId: null,
    selectAnnotation: (id) =>
      set({ selectedAnnotationId: id, repositioningAnnotationId: null }),
    startRepositioning: (id) =>
      set({ selectedAnnotationId: id, repositioningAnnotationId: id }),
    stopRepositioning: () => set({ repositioningAnnotationId: null }),
    clear: () =>
      set({ selectedAnnotationId: null, repositioningAnnotationId: null }),
  }));

interface SlideshowWorkbenchState {
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
}

export const useSlideshowWorkbenchState = create<SlideshowWorkbenchState>(
  (set) => ({
    activeTab: null,
    setActiveTab: (tab) => set({ activeTab: tab }),
  }),
);

export function createDefaultSlideContentBox(canvas: any): SlideContentBox {
  const width = Number(canvas?.width) || 1920;
  const height = Number(canvas?.height) || 1080;
  const layout = getSlideLayoutRegions(canvas);

  if (layout.content) {
    return layout.content;
  }

  return {
    x: Math.round(width * 0.1),
    y: Math.round(height * 0.1),
    width: Math.round(width * 0.8),
    height: Math.round(height * 0.8),
  };
}

export function createSlideContentTarget(canvas: any, box: SlideContentBox) {
  return {
    type: "SpecificResource",
    source: { id: canvas.id, type: "Canvas" },
    selector: {
      type: "FragmentSelector",
      value: `xywh=${Math.round(box.x)},${Math.round(box.y)},${Math.round(
        box.width,
      )},${Math.round(box.height)}`,
    },
  };
}

export function createDefaultSlideContentTarget(canvas: any) {
  return createSlideContentTarget(canvas, createDefaultSlideContentBox(canvas));
}

export function getPaintingAnnotations(vault: any, canvas: any) {
  return getPageAnnotations(vault, canvas?.items || []).filter(
    (annotation: any) =>
      (Array.isArray(annotation?.motivation)
        ? annotation.motivation
        : [annotation?.motivation]
      ).includes("painting"),
  );
}

export function getTourStepAnnotations(vault: any, canvas: any) {
  return getPageAnnotations(vault, canvas?.annotations || []);
}

function getPageAnnotations(vault: any, pageRefs: any[]) {
  const annotations = [];

  for (const pageRef of pageRefs) {
    const page = vault.get(
      pageRef as any,
      {
        skipSelfReturn: false,
      } as any,
    ) as any;

    for (const annotationRef of page?.items || []) {
      const annotation = vault.get(
        annotationRef as any,
        {
          skipSelfReturn: false,
        } as any,
      ) as any;

      if (annotation) {
        annotations.push(annotation);
      }
    }
  }

  return annotations;
}

export function getSlideContentLayers(
  vault: any,
  canvas: any,
): SlideContentLayer[] {
  return getPaintingAnnotations(vault, canvas).map((annotation: any) => {
    const body = getResolvedAnnotationBody(vault, annotation);

    return {
      annotation,
      box: getAnnotationTargetBox(annotation, canvas),
      html: getHtmlValue(body),
      imageUrl: getImageUrl(body),
      videoUrl: getVideoUrl(body),
      youtubeId: getYouTubeId(body),
    };
  });
}

export function getAnnotationTargetBox(
  annotation: any,
  canvas: any,
): SlideContentBox {
  const width = Number(canvas?.width) || 1920;
  const height = Number(canvas?.height) || 1080;
  const target = annotation?.target;

  if (typeof target === "string" && target.includes("#xywh=")) {
    const parsed = parseXywh(target.split("#xywh=")[1]);
    if (parsed) return parsed;
  }

  const selector = target?.selector;
  const value = Array.isArray(selector)
    ? selector.find((item: any) => item?.value?.startsWith?.("xywh="))?.value
    : selector?.value;

  if (typeof value === "string" && value.includes("xywh=")) {
    const parsed = parseXywh(value.split("xywh=")[1]);
    if (parsed) return parsed;
  }

  return { x: 0, y: 0, width, height };
}

export function setAnnotationTargetBox(
  vault: any,
  canvas: any,
  annotationId: string,
  box: SlideContentBox,
) {
  vault.modifyEntityField(
    { id: annotationId, type: "Annotation" },
    "target",
    createSlideContentTarget(canvas, constrainSlideContentBox(canvas, box)),
  );
}

export function repairSlideContentTargets(vault: any, canvas: any) {
  if (!canvas) return;

  for (const annotation of getPaintingAnnotations(vault, canvas)) {
    const target = annotation?.target;
    if (
      (target?.type === "SpecificResource" &&
        target?.source?.type === "Canvas" &&
        !target.selector) ||
      target?.type === "Canvas" ||
      target === canvas.id
    ) {
      setAnnotationTargetBox(
        vault,
        canvas,
        annotation.id,
        getSlideLayoutRegions(canvas).content ||
          createDefaultSlideContentBox(canvas),
      );
    }
  }
}

export function getSlideLayoutRegions(canvas: any): {
  content: SlideContentBox | null;
  text: SlideContentBox | null;
} {
  const width = Number(canvas?.width) || 1920;
  const height = Number(canvas?.height) || 1080;
  const behavior = canvas?.behavior || [];

  if (behavior.includes("right")) {
    return {
      content: { x: 0, y: 0, width: Math.round((width * 2) / 3), height },
      text: {
        x: Math.round((width * 2) / 3),
        y: 0,
        width: Math.round(width / 3),
        height,
      },
    };
  }

  if (behavior.includes("left")) {
    return {
      content: {
        x: Math.round(width / 3),
        y: 0,
        width: Math.round((width * 2) / 3),
        height,
      },
      text: { x: 0, y: 0, width: Math.round(width / 3), height },
    };
  }

  if (behavior.includes("bottom")) {
    return {
      content: { x: 0, y: 0, width, height: Math.round((height * 2) / 3) },
      text: {
        x: 0,
        y: Math.round((height * 2) / 3),
        width,
        height: Math.round(height / 3),
      },
    };
  }

  return { content: null, text: null };
}

export function constrainSlideContentBox(
  canvas: any,
  input: SlideContentBox,
): SlideContentBox {
  const canvasWidth = Number(canvas?.width) || 1920;
  const canvasHeight = Number(canvas?.height) || 1080;
  const width = Math.max(1, Math.min(input.width, canvasWidth));
  const height = Math.max(1, Math.min(input.height, canvasHeight));
  const x = Math.max(0, Math.min(input.x, canvasWidth - width));
  const y = Math.max(0, Math.min(input.y, canvasHeight - height));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function getResolvedAnnotationBody(vault: any, annotation: any) {
  const body = Array.isArray(annotation?.body)
    ? annotation.body[0]
    : annotation?.body;
  const resolved = body
    ? vault.get(body as any, { skipSelfReturn: false } as any)
    : null;

  return resolved?.type === "SpecificResource"
    ? resolved.source
    : resolved || body || null;
}

function parseXywh(value?: string): SlideContentBox | null {
  const values = value ? value.split(/[,&]/).slice(0, 4).map(Number) : [];

  if (values.length === 4 && values.every((item) => Number.isFinite(item))) {
    const [x, y, width, height] = values as [number, number, number, number];
    return { x, y, width, height };
  }

  return null;
}

function getImageUrl(body: any) {
  const source = body?.type === "SpecificResource" ? body.source : body;
  const service = Array.isArray(source?.service)
    ? source.service[0]
    : source?.service;
  const serviceId = service?.id || service?.["@id"];

  if (serviceId) {
    return `${serviceId.replace(/\/$/, "")}/full/1000,/0/default.jpg`;
  }

  if (source?.type === "Image" && source.id) {
    return source.id;
  }

  return null;
}

function getHtmlValue(body: any) {
  const source = body?.type === "SpecificResource" ? body.source : body;

  if (
    source?.type === "TextualBody" ||
    source?.format === "text/html" ||
    source?.format === "text/plain"
  ) {
    return source.value || "";
  }

  return null;
}

function getVideoUrl(body: any) {
  const source = body?.type === "SpecificResource" ? body.source : body;
  return source?.type === "Video" && !getYouTubeId(source) ? source.id : null;
}

function getYouTubeId(body: any) {
  const source = body?.type === "SpecificResource" ? body.source : body;
  const youtubeService = (source?.service || []).find(
    (service: any) => service?.profile === "https://www.youtube.com",
  );
  const id = youtubeService?.id || source?.id || "";
  const match = id.match(
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?vi?=|&vi?=))([^#&?]*).*/,
  );

  return match ? match[1] : null;
}
