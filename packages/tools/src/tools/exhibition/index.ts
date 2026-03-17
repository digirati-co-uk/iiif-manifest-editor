import {
  applySelectorToAnnotation,
  buildReferenceResultMessage,
  createEditor,
  createSuccess,
  createWithCreator,
  getFirstCanvasAnnotationPage,
  getResource,
  resolveResourceRef,
  toolError,
} from "../../runtime/helpers";
import type { ManifestEditorToolDefinition, ResourceRef } from "../../types";

const resourceRefSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "type"],
  properties: {
    id: { type: "string" },
    type: { type: "string" },
  },
};

const exhibitionSlideCreatorIds: Record<string, string> = {
  empty: "@exhibitions/image-slide-creator",
  empty_left: "@exhibitions/image-slide-creator-left",
  empty_right: "@exhibitions/image-slide-creator-right",
  empty_bottom: "@exhibitions/image-slide-creator-bottom",
  image: "@exhibitions/image-url-creator",
  image_service: "@exhibitions/image-service-creator",
  iiif_browser: "@exhibitions/browser-creator",
  video: "@exhibitions/video-creator",
  youtube: "@exhibitions/youtube-creator",
  info_box: "@exhibitions/info-box-creator",
};

const exhibitionLayoutTokens = ["left", "right", "bottom", "top", "image"] as const;
const exhibitionFloatingTokens = [
  "float-top-left",
  "float-top-right",
  "float-bottom-left",
  "float-bottom-right",
] as const;

function resolveExhibitionSlideCreatorId(kind: string | undefined, creatorId?: string) {
  if (creatorId) {
    return creatorId;
  }

  const resolved = exhibitionSlideCreatorIds[kind || "empty"];
  if (!resolved) {
    throw toolError("INVALID_INPUT", `Unknown exhibition slide kind ${kind}`);
  }

  return resolved;
}

function resolveNullableChoice(
  value: unknown,
  field: string,
  allowed: readonly string[],
): string | null | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !allowed.includes(value)) {
    throw toolError("INVALID_INPUT", `Invalid ${field} value`, {
      value,
      allowed,
    });
  }

  return value;
}

function resolveGridValue(field: "width" | "height", value: unknown): number | null | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 12) {
    throw toolError("INVALID_INPUT", `${field} must be an integer between 1 and 12`);
  }

  return value;
}

function isManagedExhibitionBehavior(behavior: string) {
  return (
    exhibitionLayoutTokens.includes(behavior as (typeof exhibitionLayoutTokens)[number]) ||
    exhibitionFloatingTokens.includes(behavior as (typeof exhibitionFloatingTokens)[number]) ||
    /^w-(?:[1-9]|1[0-2])$/.test(behavior) ||
    /^h-(?:[1-9]|1[0-2])$/.test(behavior)
  );
}

function normaliseExhibitionBehaviors(
  existing: string[],
  input: {
    layout?: unknown;
    floating?: unknown;
    grid?: { width?: unknown; height?: unknown } | null;
  },
) {
  const preserved = existing.filter((behavior) => !isManagedExhibitionBehavior(behavior));
  const existingLayout = existing.find((behavior) =>
    exhibitionLayoutTokens.includes(behavior as (typeof exhibitionLayoutTokens)[number]),
  );
  const existingFloating = existing.find((behavior) =>
    exhibitionFloatingTokens.includes(behavior as (typeof exhibitionFloatingTokens)[number]),
  );
  const existingWidth = existing.find((behavior) => /^w-(?:[1-9]|1[0-2])$/.test(behavior));
  const existingHeight = existing.find((behavior) => /^h-(?:[1-9]|1[0-2])$/.test(behavior));
  const hasLayout = Object.prototype.hasOwnProperty.call(input, "layout");
  const hasFloating = Object.prototype.hasOwnProperty.call(input, "floating");
  const hasGridWidth = !!input.grid && Object.prototype.hasOwnProperty.call(input.grid, "width");
  const hasGridHeight = !!input.grid && Object.prototype.hasOwnProperty.call(input.grid, "height");
  const layout = hasLayout
    ? resolveNullableChoice(input.layout, "layout", exhibitionLayoutTokens) ?? null
    : existingLayout ?? null;
  const floating = hasFloating
    ? resolveNullableChoice(input.floating, "floating", exhibitionFloatingTokens) ?? null
    : existingFloating ?? null;
  const gridWidth = hasGridWidth
    ? resolveGridValue("width", input.grid?.width)
    : existingWidth
      ? Number.parseInt(existingWidth.slice(2), 10)
      : null;
  const gridHeight = hasGridHeight
    ? resolveGridValue("height", input.grid?.height)
    : existingHeight
      ? Number.parseInt(existingHeight.slice(2), 10)
      : null;

  const nextBehaviors = [...preserved];

  if (layout) {
    nextBehaviors.push(layout);
  }

  if (floating) {
    nextBehaviors.push(floating);
  }

  if (gridWidth) {
    nextBehaviors.push(`w-${gridWidth}`);
  }

  if (gridHeight) {
    nextBehaviors.push(`h-${gridHeight}`);
  }

  return nextBehaviors;
}

function getTourStepPayload(payload: Record<string, unknown> = {}) {
  return {
    label: { en: ["Tour step"] },
    body: { en: ["<h2>New step</h2><p>Description</p>"] },
    motivation: "tagging",
    ...payload,
  };
}

async function ensureCanvasTourPage(runtime: any, canvas: ResourceRef) {
  const existing = getFirstCanvasAnnotationPage(runtime, canvas);

  if (existing) {
    return {
      page: existing,
      createdRefs: [] as ResourceRef[],
      warnings: ["Canvas already has an existing annotation page for tour steps"],
      created: false,
    };
  }

  const created = await createWithCreator(runtime, {
    parent: canvas,
    property: "annotations",
    targetType: "AnnotationPage",
    creatorId: "@manifest-editor/empty-annotation-page",
    target: canvas,
    payload: {
      label: { en: ["Tour steps"] },
    },
  });

  const page = created.createdRefs[0];
  if (!page) {
    throw toolError("INVALID_INPUT", "The tour annotation page could not be created");
  }

  return {
    page,
    createdRefs: created.createdRefs,
    warnings: [] as string[],
    created: true,
  };
}

function assertCanvasRef(canvas: ResourceRef) {
  if (canvas.type !== "Canvas") {
    throw toolError("INVALID_PARENT", `${canvas.id} is not a Canvas`);
  }
}

function getCanvasTourPage(runtime: any, canvas: ResourceRef, annotationPage?: ResourceRef) {
  if (annotationPage) {
    const resolvedAnnotationPage = resolveResourceRef(runtime, annotationPage);
    const canvasEntity = getResource(runtime, canvas).entity as any;
    const isTourPage = (canvasEntity.annotations || []).some((item: any) => item.id === resolvedAnnotationPage.id);

    if (!isTourPage) {
      throw toolError("INVALID_PARENT", `${resolvedAnnotationPage.id} is not attached to ${canvas.id}`);
    }

    return resolvedAnnotationPage;
  }

  const existing = getFirstCanvasAnnotationPage(runtime, canvas);
  if (!existing) {
    throw toolError("NOT_FOUND", `Canvas ${canvas.id} does not have a tour annotation page`);
  }

  return existing;
}

export function buildExhibitionToolRegistry(): ManifestEditorToolDefinition[] {
  return [
    {
      name: "me_create_exhibition_slide",
      description: "Create an exhibition slide canvas using the active exhibition creator registry.",
      modes: ["exhibition"],
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          manifest: resourceRefSchema,
          creatorId: { type: "string" },
          kind: { type: "string" },
          payload: { type: "object" },
          index: { type: "number" },
        },
      },
      async execute(runtime, input: any) {
        const manifest = resolveResourceRef(runtime, input.manifest || runtime.rootResource);
        if (manifest.type !== "Manifest") {
          throw toolError("INVALID_PARENT", `${manifest.id} is not a Manifest`);
        }
        const creatorId = resolveExhibitionSlideCreatorId(input.kind, input.creatorId);
        const created = await createWithCreator(runtime, {
          parent: manifest,
          property: "items",
          targetType: "Canvas",
          creatorId,
          index: input.index,
          payload: input.payload || {},
        });

        return createSuccess(
          "me_create_exhibition_slide",
          `Created ${buildReferenceResultMessage(created.createdRefs)}`,
          {
            changedRefs: [manifest],
            createdRefs: created.createdRefs,
            data: {
              creatorId: created.creator.id,
            },
          },
        );
      },
    },
    {
      name: "me_update_exhibition_layout",
      description:
        "Update an exhibition canvas layout while preserving non-layout behavior tokens such as info and multi-image.",
      modes: ["exhibition"],
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["canvas"],
        properties: {
          canvas: resourceRefSchema,
          layout: {
            type: ["string", "null"],
          },
          floating: {
            type: ["string", "null"],
          },
          grid: {
            type: ["object", "null"],
            additionalProperties: false,
            properties: {
              width: { type: ["number", "null"] },
              height: { type: ["number", "null"] },
            },
          },
        },
      },
      execute(runtime, input: any) {
        const canvas = resolveResourceRef(runtime, input.canvas);
        assertCanvasRef(canvas);

        const editor = createEditor(runtime, canvas);
        const existingBehaviors = editor.technical.behavior.getWithoutTracking() || [];
        const nextBehaviors = normaliseExhibitionBehaviors(existingBehaviors, input);

        editor.technical.behavior.set(nextBehaviors as never);

        return createSuccess("me_update_exhibition_layout", `Updated exhibition layout for ${canvas.id}`, {
          changedRefs: [canvas],
          data: {
            behaviors: nextBehaviors,
          },
        });
      },
    },
    {
      name: "me_create_exhibition_tour",
      description: "Ensure a canvas has the first annotation page used for exhibition tour steps.",
      modes: ["exhibition"],
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["canvas"],
        properties: {
          canvas: resourceRefSchema,
        },
      },
      async execute(runtime, input: any) {
        const canvas = resolveResourceRef(runtime, input.canvas);
        assertCanvasRef(canvas);
        const page = await ensureCanvasTourPage(runtime, canvas);

        return createSuccess(
          "me_create_exhibition_tour",
          page.created ? `Created ${buildReferenceResultMessage(page.createdRefs)}` : `Loaded tour page ${page.page.id}`,
          {
            changedRefs: page.created ? [canvas] : [],
            createdRefs: page.createdRefs,
            warnings: page.warnings,
            data: {
              annotationPage: page.page,
            },
          },
        );
      },
    },
    {
      name: "me_create_exhibition_tour_step",
      description: "Create an HTML tagging annotation in the canvas tour annotation page.",
      modes: ["exhibition"],
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["canvas"],
        properties: {
          canvas: resourceRefSchema,
          annotationPage: resourceRefSchema,
          payload: { type: "object" },
          selector: { type: "object" },
        },
      },
      async execute(runtime, input: any) {
        const canvas = resolveResourceRef(runtime, input.canvas);
        assertCanvasRef(canvas);
        const existingTourPage = input.annotationPage
          ? getCanvasTourPage(runtime, canvas, input.annotationPage)
          : getFirstCanvasAnnotationPage(runtime, canvas);
        const ensuredPage = existingTourPage
          ? {
              page: existingTourPage,
              createdRefs: [] as ResourceRef[],
              warnings: [] as string[],
            }
          : await ensureCanvasTourPage(runtime, canvas);

        const created = await createWithCreator(runtime, {
          parent: ensuredPage.page,
          property: "items",
          targetType: "Annotation",
          creatorId: "@manifest-editor/html-annotation",
          target: canvas,
          payload: getTourStepPayload(input.payload || {}),
        });

        const annotation = created.createdRefs[0];
        if (annotation) {
          applySelectorToAnnotation(
            runtime,
            annotation,
            input.selector || { type: "whole_canvas" },
            canvas,
          );
        }

        return createSuccess(
          "me_create_exhibition_tour_step",
          `Created ${buildReferenceResultMessage(created.createdRefs)}`,
          {
            changedRefs: [canvas, ensuredPage.page],
            createdRefs: [...ensuredPage.createdRefs, ...created.createdRefs],
            warnings: ensuredPage.warnings,
            data: {
              annotationPage: ensuredPage.page,
              creatorId: created.creator.id,
            },
          },
        );
      },
    },
    {
      name: "me_reorder_exhibition_tour_steps",
      description: "Reorder exhibition tour step annotations inside a canvas tour annotation page.",
      modes: ["exhibition"],
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["canvas", "startIndex", "endIndex"],
        properties: {
          canvas: resourceRefSchema,
          annotationPage: resourceRefSchema,
          startIndex: { type: "number" },
          endIndex: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const canvas = resolveResourceRef(runtime, input.canvas);
        assertCanvasRef(canvas);
        const annotationPage = getCanvasTourPage(
          runtime,
          canvas,
          input.annotationPage ? resolveResourceRef(runtime, input.annotationPage) : undefined,
        );
        const editor = createEditor(runtime, annotationPage);

        editor.structural.items.reorder(input.startIndex, input.endIndex);

        return createSuccess(
          "me_reorder_exhibition_tour_steps",
          `Reordered tour steps on ${annotationPage.id}`,
          {
            changedRefs: [annotationPage],
          },
        );
      },
    },
  ];
}
