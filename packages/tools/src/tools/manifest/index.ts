import {
  applySelectorToAnnotation,
  buildReferenceResultMessage,
  createEditor,
  createSuccess,
  createWithCreator,
  findCanvasForAnnotationPage,
  getManifest,
  mergeRanges,
  moveRangeItems,
  normaliseCreatedRefs,
  resolveResourceRef,
  splitRangeAtItem,
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

export function buildManifestToolRegistry(): ManifestEditorToolDefinition[] {
  return [
    {
      name: "me_create_canvas",
      description:
        "Create a canvas in the manifest using the active creator registry, including media-backed canvas creators.",
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
        const kind = input.kind || "empty";
        const creatorId = input.creatorId || manifestCanvasCreatorIds[kind];
        if (!creatorId) {
          throw toolError("INVALID_INPUT", `Unknown manifest canvas kind ${kind}`);
        }
        const created = await createWithCreator(runtime, {
          parent: manifest,
          property: "items",
          targetType: "Canvas",
          creatorId,
          index: input.index,
          isPainting: true,
          payload: withDefaultCanvasPayload(kind, input.payload || {}),
        });

        return createSuccess("me_create_canvas", `Created ${buildReferenceResultMessage(created.createdRefs)}`, {
          changedRefs: [manifest],
          createdRefs: created.createdRefs,
          data: {
            creatorId: created.creator.id,
          },
        });
      },
    },
    {
      name: "me_create_annotation_page",
      description:
        "Create an empty annotation page under a Canvas, Manifest, or Range using the existing empty annotation page creator.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["parent"],
        properties: {
          parent: resourceRefSchema,
          property: { type: "string" },
          label: {},
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

        return createSuccess(
          "me_create_annotation_page",
          `Created ${buildReferenceResultMessage(created.createdRefs)}`,
          {
            changedRefs: [parent],
            createdRefs: created.createdRefs,
          },
        );
      },
    },
    {
      name: "me_create_annotation",
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
          kind: { type: "string" },
          painting: { type: "boolean" },
          payload: { type: "object" },
          selector: {
            type: "object",
          },
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
          data: {
            creatorId: created.creator.id,
          },
        });
      },
    },
    {
      name: "me_set_annotation_target",
      description:
        "Set or replace an annotation target using a whole-canvas, xywh, or raw SVG selector input.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["annotation", "selector"],
        properties: {
          annotation: resourceRefSchema,
          targetCanvas: resourceRefSchema,
          selector: {
            type: "object",
          },
        },
      },
      execute(runtime, input: any) {
        const annotation = resolveResourceRef(runtime, input.annotation);
        const targetCanvas = input.targetCanvas ? resolveResourceRef(runtime, input.targetCanvas) : undefined;
        applySelectorToAnnotation(runtime, annotation, input.selector, targetCanvas);
        return createSuccess("me_set_annotation_target", `Updated target for ${annotation.id}`, {
          changedRefs: targetCanvas ? [annotation, targetCanvas] : [annotation],
        });
      },
    },
    {
      name: "me_create_top_level_range",
      description:
        "Create the initial top-level table of contents structure used by the existing range workbench: an outer TOC range and a first child range containing the manifest canvases.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          manifest: resourceRefSchema,
          topLevelLabel: {},
          firstRangeLabel: {},
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

        const initialItems: ResourceRef[] =
          (input.items || manifestEditor.structural.items.getWithoutTracking() || []).map((item: any) =>
            resolveResourceRef(runtime, item),
          );

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

        const innerRange = normaliseCreatedRefs(runtime, innerResult)[0]!;

        const outerResult = await runtime.creator.create(
          "@manifest-editor/range-top-level",
          {
            type: "Range",
            label: input.topLevelLabel || { en: ["Table of contents"] },
            items: [innerRange],
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

        return createSuccess(
          "me_create_top_level_range",
          `Created ${buildReferenceResultMessage([innerRange, ...outerRanges])}`,
          {
            changedRefs: [manifest],
            createdRefs: [innerRange, ...outerRanges],
          },
        );
      },
    },
    {
      name: "me_create_nested_range",
      description: "Create a nested range under an existing range item.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["parentRange"],
        properties: {
          parentRange: resourceRefSchema,
          label: {},
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

        return createSuccess("me_create_nested_range", `Created ${buildReferenceResultMessage(created.createdRefs)}`, {
          changedRefs: [parentRange],
          createdRefs: created.createdRefs,
        });
      },
    },
    {
      name: "me_move_range_items",
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
            items: resourceRefSchema,
          },
          index: { type: "number" },
        },
      },
      execute(runtime, input: any) {
        const sourceRange = resolveResourceRef(runtime, input.sourceRange);
        const targetRange = resolveResourceRef(runtime, input.targetRange);
        moveRangeItems(runtime, {
          sourceRange,
          targetRange,
          items: input.items || [],
          index: input.index,
        });

        return createSuccess("me_move_range_items", `Moved ${(input.items || []).length} range item(s)`, {
          changedRefs: [sourceRange, targetRange],
        });
      },
    },
    {
      name: "me_split_range",
      description:
        "Split a nested range at a specific item using the same semantics as the existing range workbench.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["range", "item"],
        properties: {
          range: resourceRefSchema,
          item: resourceRefSchema,
          label: {},
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
        });
      },
    },
    {
      name: "me_merge_ranges",
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
        });
      },
    },
  ];
}
