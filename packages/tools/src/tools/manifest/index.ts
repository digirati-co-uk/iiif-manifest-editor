import {
  canonicalServiceUrl,
  imageServiceRequestToString,
  parseImageServiceRequest,
} from "@iiif/parser/image-3";
import {
  applySelectorToAnnotation,
  buildReferenceResultMessage,
  createEditor,
  createMutationResultData,
  createSuccess,
  createWithCreator,
  ensureNonEmptyArray,
  findCanvasForAnnotationPage,
  mergeRanges,
  moveRangeItems,
  normaliseCreatedRefs,
  resolveResourceRef,
  splitRangeAtItem,
  toolError,
} from "../../runtime/helpers";
import type { ManifestEditorToolDefinition, ResourceRef } from "../../types";
import {
  anyObjectSchema,
  createResourceRefSchema,
  languageMapLikeSchema,
  selectorSchema,
} from "../../runtime/schema";

const resourceRefSchema = createResourceRefSchema();

const manifestCanvasCreatorIds: Record<string, string> = {
  empty: "@manifest-editor/empty-canvas",
  html: "@manifest-editor/html-annotation",
  image: "@manifest-editor/image-url-annotation",
  image_service: "@manifest-editor/image-service-annotation",
  image_list: "@manifest-editor/image-url-list-annotation",
  audio: "@manifest-editor/audio-annotation",
  video: "@manifest-editor/video-annotation",
  youtube: "@manifest-editor/youtube",
  iiif_browser: "@manifest-editor/iiif-browser-creator",
  captioned_image: "@manifest-editor/captioned-image-annotation",
};
const manifestCanvasKinds = Object.keys(manifestCanvasCreatorIds);

const manifestAnnotationCreatorIds: Record<string, string> = {
  html: "@manifest-editor/html-annotation",
  image: "@manifest-editor/image-url-annotation",
  image_service: "@manifest-editor/image-service-annotation",
  image_list: "@manifest-editor/image-url-list-annotation",
  audio: "@manifest-editor/audio-annotation",
  video: "@manifest-editor/video-annotation",
  captioned_image: "@manifest-editor/captioned-image-annotation",
  no_body: "@manifest-editor/no-body-annotation",
};
const manifestAnnotationKinds = Object.keys(manifestAnnotationCreatorIds);

const canvasPayloadSchema = {
  type: "object",
  additionalProperties: true,
  description: "Creator payload. For image_service, provide payload.url or a full payload.service object.",
  properties: {
    url: {
      type: "string",
      description: "IIIF image service URL or info.json URL used by the image_service workflow.",
    },
    service: {
      type: "object",
      description: "Resolved IIIF image service object. Use this when the service metadata is already available.",
    },
    label: {
      ...languageMapLikeSchema,
      description: "Optional IIIF language map label for the created canvas.",
    },
    body: {
      ...languageMapLikeSchema,
      description: "Optional body payload for HTML-backed canvas creators.",
    },
    width: {
      type: "number",
      description: "Optional explicit width for the created canvas or image resource.",
    },
    height: {
      type: "number",
      description: "Optional explicit height for the created canvas or image resource.",
    },
    duration: {
      type: "number",
      description: "Optional duration for time-based media canvases.",
    },
    format: {
      type: "string",
      description: "Optional media format override.",
    },
    youtubeUrl: {
      type: "string",
      description: "YouTube URL used by the youtube canvas workflow.",
    },
    imageUrl: {
      type: "string",
      description: "Image URL used by captioned_image workflows.",
    },
    images: {
      type: "array",
      description: "Array of image URL payloads used by image_list workflows.",
      items: anyObjectSchema,
    },
    output: {
      type: "array",
      description: "IIIF Browser output payload used by the iiif_browser workflow.",
      items: anyObjectSchema,
    },
    embedService: {
      type: "boolean",
      description: "When false, create the image resource without embedding the service block.",
    },
    selector: {
      ...anyObjectSchema,
      description: "Optional region selector payload for image-service-backed resources.",
    },
    size: {
      ...anyObjectSchema,
      description: "Optional IIIF image size request override.",
    },
  },
  examples: [
    {
      url: "https://example.org/iiif/image-1/info.json",
      label: { en: ["Page 1"] },
    },
  ],
};

const annotationPayloadSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    url: {
      type: "string",
      description: "Media URL or IIIF image service URL used by the annotation workflow.",
    },
    service: {
      ...anyObjectSchema,
      description: "Resolved IIIF image service object for image_service workflows.",
    },
    label: languageMapLikeSchema,
    body: languageMapLikeSchema,
    width: { type: "number" },
    height: { type: "number" },
    duration: { type: "number" },
    format: { type: "string" },
    youtubeUrl: { type: "string" },
    imageUrl: { type: "string" },
    images: {
      type: "array",
      items: anyObjectSchema,
    },
    output: {
      type: "array",
      items: anyObjectSchema,
    },
    embedService: { type: "boolean" },
    size: anyObjectSchema,
    thumbnailSize: { type: "number" },
    motivation: { type: "string" },
  },
};

function getCanonicalImageServiceInfoUrl(url: string) {
  try {
    return url.endsWith("default.jpg")
      ? imageServiceRequestToString({
          ...parseImageServiceRequest(url),
          type: "info",
        })
      : canonicalServiceUrl(url);
  } catch (error) {
    return null;
  }
}

function withDefaultCanvasPayload(kind: string, payload: Record<string, unknown> = {}) {
  if (kind === "html") {
    return {
      body: { en: ["<p>Untitled HTML canvas</p>"] },
      ...payload,
    };
  }

  return payload;
}

function withDefaultAnnotationPayload(kind: string, payload: Record<string, unknown> = {}) {
  if (kind === "html") {
    return {
      label: { en: ["Annotation"] },
      body: { en: ["<p>New annotation</p>"] },
      ...payload,
    };
  }

  return payload;
}

function inferPaintingMode(kind?: string, explicit?: boolean) {
  if (typeof explicit === "boolean") {
    return explicit;
  }

  if (!kind) {
    return false;
  }

  if (["image", "image_service", "image_list", "audio", "video"].includes(kind)) {
    return true;
  }

  return false;
}

function resolveCanvasTarget(runtime: any, input: any) {
  if (input.targetCanvas) {
    return resolveResourceRef(runtime, input.targetCanvas);
  }

  return findCanvasForAnnotationPage(runtime, resolveResourceRef(runtime, input.annotationPage));
}

async function resolveImageServicePayload(payload: Record<string, unknown> = {}) {
  if (payload.service) {
    return payload;
  }

  const url = typeof payload.url === "string" ? payload.url.trim() : "";
  if (!url) {
    throw toolError("INVALID_INPUT", "An image service canvas requires payload.url or payload.service");
  }

  const infoUrl = getCanonicalImageServiceInfoUrl(url);
  if (!infoUrl) {
    throw toolError("INVALID_INPUT", `Invalid image service URL: ${url}`);
  }

  let response: Response;
  try {
    response = await fetch(infoUrl);
  } catch (error) {
    throw toolError("INVALID_INPUT", `Unable to fetch image service ${infoUrl}`, {
      cause: error instanceof Error ? error.message : error,
    });
  }

  if (!response.ok) {
    throw toolError("INVALID_INPUT", `Unable to fetch image service ${infoUrl}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  let service: unknown;
  try {
    service = await response.json();
  } catch (error) {
    throw toolError("INVALID_INPUT", `Image service ${infoUrl} did not return valid JSON`, {
      cause: error instanceof Error ? error.message : error,
    });
  }

  return {
    ...payload,
    service,
  };
}

async function resolveCanvasPayload(kind: string, payload: Record<string, unknown> = {}) {
  const withDefaults = withDefaultCanvasPayload(kind, payload);

  if (kind === "image_service") {
    return resolveImageServicePayload(withDefaults);
  }

  return withDefaults;
}

function getCanvasInputPayload(input: any) {
  const payload = { ...(input.payload || {}) };

  if (typeof input.url === "string" && typeof payload.url !== "string") {
    payload.url = input.url;
  }

  if (input.service && !payload.service) {
    payload.service = input.service;
  }

  return payload;
}

export function buildManifestToolRegistry(): ManifestEditorToolDefinition[] {
  return [
    {
      name: "me_create_canvas",
      modelExposure: "default",
      description:
        "Create a canvas in the manifest using the active creator registry, including media-backed canvas creators.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          manifest: {
            ...resourceRefSchema,
            description: "The manifest to add the canvas to. Defaults to the current root resource.",
          },
          creatorId: {
            type: "string",
            description: "Optional explicit creator ID. Use this only when you need to override the standard kind mapping.",
          },
          kind: {
            type: "string",
            enum: manifestCanvasKinds,
            description:
              "The creator-backed canvas workflow to use. For IIIF image services, use kind image_service with payload.url rather than calling a low-level content resource creator directly.",
            examples: ["image_service", "empty", "html"],
          },
          url: {
            type: "string",
            description: "Convenience alias for payload.url when kind is image_service.",
          },
          service: {
            type: "object",
            description: "Convenience alias for payload.service when kind is image_service.",
          },
          payload: canvasPayloadSchema,
          index: {
            type: "number",
            description: "Optional insertion index within manifest.items.",
          },
        },
      },
      async execute(runtime, input: any) {
        const manifest = resolveResourceRef(runtime, input.manifest || runtime.rootResource);
        const inputPayload = getCanvasInputPayload(input);
        const kind = input.kind || (inputPayload.url || inputPayload.service ? "image_service" : "empty");
        const creatorId = input.creatorId || manifestCanvasCreatorIds[kind];
        if (!creatorId) {
          throw toolError("INVALID_INPUT", `Unknown manifest canvas kind ${kind}`);
        }
        const resolvedPayload = await resolveCanvasPayload(kind, inputPayload);
        const created = await createWithCreator(runtime, {
          parent: manifest,
          property: "items",
          targetType: "Canvas",
          creatorId,
          index: input.index,
          isPainting: true,
          payload: resolvedPayload,
        });

        const primaryRef = created.createdRefs[0] || null;
        return createSuccess("me_create_canvas", `Created ${buildReferenceResultMessage(created.createdRefs)}`, {
          changedRefs: [manifest],
          createdRefs: created.createdRefs,
          data: createMutationResultData({
            normalizedInput: {
              manifest,
              kind,
              creatorId: created.creator.id,
              index: input.index,
              payload: resolvedPayload,
            },
            primaryRef,
            extra: {
              creatorId: created.creator.id,
              canvas: primaryRef,
            },
          }),
        });
      },
    },
    {
      name: "me_create_annotation_page",
      modelExposure: "default",
      description:
        "Create an empty annotation page under a Canvas, Manifest, or Range using the existing empty annotation page creator.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["parent"],
        properties: {
          parent: resourceRefSchema,
          property: { type: "string" },
          label: languageMapLikeSchema,
          creatorId: { type: "string" },
          index: { type: "number" },
        },
      },
      async execute(runtime, input: any) {
        const parent = resolveResourceRef(runtime, input.parent);
        const property =
          input.property ||
          ({
            Canvas: "annotations",
            Manifest: "annotations",
            Range: "annotations",
          } as Record<string, string>)[parent.type];

        if (!property) {
          throw toolError("INVALID_PARENT", `Cannot create an annotation page under ${parent.type}`);
        }

        const created = await createWithCreator(runtime, {
          parent,
          property,
          targetType: "AnnotationPage",
          creatorId: input.creatorId || "@manifest-editor/empty-annotation-page",
          index: input.index,
          target: parent.type === "Canvas" ? parent : undefined,
          payload: {
            label: input.label,
          },
        });

        const primaryRef = created.createdRefs[0] || null;
        return createSuccess(
          "me_create_annotation_page",
          `Created ${buildReferenceResultMessage(created.createdRefs)}`,
          {
            changedRefs: [parent],
            createdRefs: created.createdRefs,
            data: createMutationResultData({
              normalizedInput: {
                parent,
                property,
                creatorId: input.creatorId || "@manifest-editor/empty-annotation-page",
                index: input.index,
                payload: {
                  label: input.label,
                },
              },
              primaryRef,
              extra: {
                annotationPage: primaryRef,
              },
            }),
          },
        );
      },
    },
    {
      name: "me_create_annotation",
      modelExposure: "default",
      description:
        "Create an annotation in an annotation page, optionally setting a target selector on the created annotation.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["annotationPage"],
        properties: {
          annotationPage: resourceRefSchema,
          targetCanvas: resourceRefSchema,
          creatorId: { type: "string" },
          kind: {
            type: "string",
            enum: manifestAnnotationKinds,
          },
          painting: { type: "boolean" },
          payload: annotationPayloadSchema,
          selector: selectorSchema,
        },
      },
      async execute(runtime, input: any) {
        const annotationPage = resolveResourceRef(runtime, input.annotationPage);
        const targetCanvas = resolveCanvasTarget(runtime, input);
        if (!targetCanvas) {
          throw toolError("INVALID_PARENT", "Could not determine the canvas target for this annotation page");
        }

        const kind = input.kind || "html";
        const creatorId = input.creatorId || manifestAnnotationCreatorIds[kind];
        if (!creatorId) {
          throw toolError("INVALID_INPUT", `Unknown annotation kind ${kind}`);
        }
        const created = await createWithCreator(runtime, {
          parent: annotationPage,
          property: "items",
          targetType: "Annotation",
          creatorId,
          target: targetCanvas,
          isPainting: inferPaintingMode(kind, input.painting),
          payload: withDefaultAnnotationPayload(kind, input.payload || {}),
        });

        const annotation = created.createdRefs[0];
        if (annotation && input.selector) {
          applySelectorToAnnotation(runtime, annotation, input.selector, targetCanvas);
        }

        return createSuccess("me_create_annotation", `Created ${buildReferenceResultMessage(created.createdRefs)}`, {
          changedRefs: [annotationPage, targetCanvas],
          createdRefs: created.createdRefs,
          data: createMutationResultData({
            normalizedInput: {
              annotationPage,
              targetCanvas,
              kind,
              creatorId: created.creator.id,
              painting: inferPaintingMode(kind, input.painting),
              payload: withDefaultAnnotationPayload(kind, input.payload || {}),
              ...(input.selector ? { selector: input.selector } : {}),
            },
            primaryRef: annotation || null,
            extra: {
              annotation,
              targetCanvas,
              creatorId: created.creator.id,
            },
          }),
        });
      },
    },
    {
      name: "me_set_annotation_target",
      modelExposure: "default",
      description:
        "Set or replace an annotation target using a whole-canvas, xywh, or raw SVG selector input.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["annotation", "selector"],
        properties: {
          annotation: resourceRefSchema,
          targetCanvas: resourceRefSchema,
          selector: selectorSchema,
        },
      },
      execute(runtime, input: any) {
        const annotation = resolveResourceRef(runtime, input.annotation);
        const targetCanvas = input.targetCanvas ? resolveResourceRef(runtime, input.targetCanvas) : undefined;
        applySelectorToAnnotation(runtime, annotation, input.selector, targetCanvas);
        return createSuccess("me_set_annotation_target", `Updated target for ${annotation.id}`, {
          changedRefs: targetCanvas ? [annotation, targetCanvas] : [annotation],
          data: createMutationResultData({
            normalizedInput: {
              annotation,
              ...(targetCanvas ? { targetCanvas } : {}),
              selector: input.selector,
            },
            primaryRef: annotation,
            extra: {
              annotation,
              ...(targetCanvas ? { targetCanvas } : {}),
            },
          }),
        });
      },
    },
    {
      name: "me_create_top_level_range",
      modelExposure: "default",
      description:
        "Create a top-level range structure. By default this uses the existing range workbench semantics with an outer TOC range plus an initial child range containing the manifest canvases. Set includeInitialChild to false for a custom empty top-level range. The result data identifies the top-level range separately from any initial child range.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          manifest: resourceRefSchema,
          topLevelLabel: languageMapLikeSchema,
          firstRangeLabel: languageMapLikeSchema,
          includeInitialChild: {
            type: "boolean",
            description:
              "Defaults to true. Set to false to create only the top-level range without an auto-generated child range of canvases.",
          },
          items: {
            type: "array",
            items: resourceRefSchema,
          },
        },
      },
      async execute(runtime, input: any) {
        const manifest = resolveResourceRef(runtime, input.manifest || runtime.rootResource);
        const manifestEditor = createEditor(runtime, manifest);
        const currentStructures = manifestEditor.structural.structures.getWithoutTracking() || [];

        if (currentStructures.length) {
          throw toolError("NOT_ALLOWED", "This manifest already contains a top-level range");
        }

        const includeInitialChild = input.includeInitialChild !== false;
        const requestedItems = input.items
          ? (input.items || []).map((item: any) => resolveResourceRef(runtime, item))
          : null;
        const initialItems: ResourceRef[] = includeInitialChild
          ? (requestedItems || manifestEditor.structural.items.getWithoutTracking() || []).map((item: any) =>
              resolveResourceRef(runtime, item),
            )
          : requestedItems || [];

        let initialChildRange: ResourceRef | null = null;
        let outerItems: ResourceRef[] = initialItems;

        if (includeInitialChild) {
          const innerResult = await runtime.creator.create(
            "@manifest-editor/range-top-level",
            {
              type: "Range",
              label: input.firstRangeLabel || { en: ["Range 1"] },
              items: initialItems,
            },
            {
              rootId: manifest.id,
              targetType: "Range",
            },
          );

          initialChildRange = normaliseCreatedRefs(runtime, innerResult)[0]!;
          outerItems = [initialChildRange];
        }

        const outerResult = await runtime.creator.create(
          "@manifest-editor/range-top-level",
          {
            type: "Range",
            label: input.topLevelLabel || { en: ["Table of contents"] },
            items: outerItems,
          },
          {
            targetType: "Range",
            parent: {
              property: "structures",
              resource: manifest,
            },
          },
        );

        const outerRanges = normaliseCreatedRefs(runtime, outerResult);
        const topLevelRange = outerRanges[0]!;
        const createdRefs = initialChildRange ? [topLevelRange, initialChildRange] : [topLevelRange];

        return createSuccess(
          "me_create_top_level_range",
          `Created ${buildReferenceResultMessage(createdRefs)}`,
          {
            changedRefs: [manifest],
            createdRefs,
            data: createMutationResultData({
              normalizedInput: {
                manifest,
                topLevelLabel: input.topLevelLabel || { en: ["Table of contents"] },
                firstRangeLabel: input.firstRangeLabel || { en: ["Range 1"] },
                includeInitialChild,
                items: initialItems,
              },
              primaryRef: topLevelRange,
              extra: {
                topLevelRange,
                initialChildRange,
                includeInitialChild,
              },
            }),
          },
        );
      },
    },
    {
      name: "me_create_nested_range",
      modelExposure: "default",
      description: "Create a nested range under an existing range item.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["parentRange"],
        properties: {
          parentRange: resourceRefSchema,
          label: languageMapLikeSchema,
          items: {
            type: "array",
            items: resourceRefSchema,
          },
          index: { type: "number" },
        },
      },
      async execute(runtime, input: any) {
        const parentRange = resolveResourceRef(runtime, input.parentRange);
        const items = (input.items || []).map((item: any) => resolveResourceRef(runtime, item));
        const created = await createWithCreator(runtime, {
          parent: parentRange,
          property: "items",
          targetType: "Range",
          creatorId: "@manifest-editor/range-with-items",
          index: input.index,
          payload: {
            type: "Range",
            label: input.label || { en: ["Untitled range"] },
            items,
          },
        });

        const childRange = created.createdRefs[0] || null;
        return createSuccess("me_create_nested_range", `Created ${buildReferenceResultMessage(created.createdRefs)}`, {
          changedRefs: [parentRange],
          createdRefs: created.createdRefs,
          data: createMutationResultData({
            normalizedInput: {
              parentRange,
              label: input.label || { en: ["Untitled range"] },
              items,
              index: input.index,
            },
            primaryRef: childRange,
            extra: {
              childRange,
            },
          }),
        });
      },
    },
    {
      name: "me_move_range_items",
      modelExposure: "default",
      description: "Move canvases or child ranges from one range into another range.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["sourceRange", "targetRange", "items"],
        properties: {
          sourceRange: resourceRefSchema,
          targetRange: resourceRefSchema,
          items: {
            type: "array",
            minItems: 1,
            items: resourceRefSchema,
          },
          index: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const sourceRange = resolveResourceRef(runtime, input.sourceRange);
        const targetRange = resolveResourceRef(runtime, input.targetRange);
        const items = input.items || [];
        ensureNonEmptyArray(items, "me_move_range_items requires at least one range item");
        const resolvedItems = items.map((item: any) => resolveResourceRef(runtime, item));
        moveRangeItems(runtime, {
          sourceRange,
          targetRange,
          items: resolvedItems,
          index: input.index,
        });

        return createSuccess("me_move_range_items", `Moved ${resolvedItems.length} range item(s)`, {
          changedRefs: [sourceRange, targetRange],
          data: createMutationResultData({
            normalizedInput: {
              sourceRange,
              targetRange,
              items: resolvedItems,
              index: input.index,
            },
            primaryRef: targetRange,
            extra: {
              movedItems: resolvedItems,
            },
          }),
        });
      },
    },
    {
      name: "me_split_range",
      modelExposure: "default",
      description:
        "Split a nested range at a specific item using the same semantics as the existing range workbench.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["range", "item"],
        properties: {
          range: resourceRefSchema,
          item: resourceRefSchema,
          label: languageMapLikeSchema,
        },
      },
      async execute(runtime, input: any) {
        const range = resolveResourceRef(runtime, input.range);
        const item = resolveResourceRef(runtime, input.item);
        await splitRangeAtItem(runtime, {
          range,
          item,
          label: input.label,
        });
        return createSuccess("me_split_range", `Split range ${range.id}`, {
          changedRefs: [range],
          data: createMutationResultData({
            normalizedInput: {
              range,
              item,
              ...(input.label ? { label: input.label } : {}),
            },
            primaryRef: range,
          }),
        });
      },
    },
    {
      name: "me_merge_ranges",
      modelExposure: "default",
      description:
        "Merge or empty one range into a sibling range using the same semantics as the existing range workbench.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["sourceRange", "targetRange"],
        properties: {
          sourceRange: resourceRefSchema,
          targetRange: resourceRefSchema,
          keepSource: { type: "boolean" },
        },
      },
      execute(runtime, input: any) {
        const sourceRange = resolveResourceRef(runtime, input.sourceRange);
        const targetRange = resolveResourceRef(runtime, input.targetRange);
        mergeRanges(runtime, {
          sourceRange,
          targetRange,
          keepSource: input.keepSource,
        });
        return createSuccess("me_merge_ranges", `Merged ${sourceRange.id} into ${targetRange.id}`, {
          changedRefs: [sourceRange, targetRange],
          data: createMutationResultData({
            normalizedInput: {
              sourceRange,
              targetRange,
              ...(typeof input.keepSource === "boolean" ? { keepSource: input.keepSource } : {}),
            },
            primaryRef: targetRange,
            extra: {
              sourceRange,
              targetRange,
            },
          }),
        });
      },
    },
  ];
}
