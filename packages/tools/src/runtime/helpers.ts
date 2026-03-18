import { createRangeHelper, getValue } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import { EditorInstance, documentation, extensionProperties, resources } from "@manifest-editor/editor-api";
import { matchBasedOnResource, resolveType, type CreatorDefinition } from "@manifest-editor/creator-api";
import type {
  CreateResourceInput,
  ManifestEditorToolError,
  ManifestEditorToolErrorCode,
  ManifestEditorToolFailureResult,
  ManifestEditorToolRuntime,
  ManifestEditorToolSuccessResult,
  MetadataPatch,
  PropertyPatch,
  ResourceRef,
  SelectorInput,
} from "../types";

interface ResourceLike {
  id: string;
  type?: string;
}

interface TrackState {
  key: string;
  observed: string[];
  start: () => () => void;
  subscribe: () => () => void;
  track: (key: string) => void;
  reset: () => void;
}

export class ToolExecutionError extends Error {
  code: ManifestEditorToolErrorCode;
  details?: unknown;

  constructor(code: ManifestEditorToolErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ToolExecutionError";
    this.code = code;
    this.details = details;
  }
}

export function toolError(
  code: ManifestEditorToolErrorCode,
  message: string,
  details?: unknown,
): ToolExecutionError {
  return new ToolExecutionError(code, message, details);
}

export function createFailure(
  toolName: string,
  error: unknown,
): ManifestEditorToolFailureResult {
  const normalised =
    error instanceof ToolExecutionError
      ? {
          code: error.code,
          message: error.message,
          details: error.details,
        }
      : {
          code: "INVALID_INPUT" as const,
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        };

  return {
    ok: false,
    toolName,
    changedRefs: [],
    createdRefs: [],
    summary: normalised.message,
    warnings: [],
    error: normalised,
  };
}

export function createSuccess<T = unknown>(
  toolName: string,
  summary: string,
  options: {
    changedRefs?: ResourceRef[];
    createdRefs?: ResourceRef[];
    warnings?: string[];
    data?: T;
  } = {},
): ManifestEditorToolSuccessResult<T> {
  return {
    ok: true,
    toolName,
    changedRefs: dedupeRefs(options.changedRefs || []),
    createdRefs: dedupeRefs(options.createdRefs || []),
    summary,
    warnings: options.warnings || [],
    data: options.data,
  };
}

export function dedupeRefs(refs: ResourceRef[]) {
  const seen = new Set<string>();
  const output: ResourceRef[] = [];

  for (const ref of refs) {
    const key = `${ref.type}:${ref.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(ref);
  }

  return output;
}

export function createMutationResultData<T extends Record<string, unknown>>(options: {
  normalizedInput: Record<string, unknown>;
  primaryRef?: ResourceRef | null;
  extra?: T;
}) {
  return {
    normalizedInput: options.normalizedInput,
    ...(options.primaryRef ? { primaryRef: options.primaryRef } : {}),
    ...(options.extra || {}),
  };
}

export function ensureNonEmptyArray(value: unknown, message: string) {
  if (!Array.isArray(value) || value.length === 0) {
    throw toolError("INVALID_INPUT", message);
  }
}

export function ensureDistinctRefs(
  left: ResourceRef,
  right: ResourceRef,
  message: string,
) {
  if (left.id === right.id && left.type === right.type) {
    throw toolError("INVALID_INPUT", message);
  }
}

function createTracker(): TrackState {
  return {
    key: "tools",
    observed: [],
    start: () => () => void 0,
    subscribe: () => () => void 0,
    track: () => void 0,
    reset: () => void 0,
  };
}

export function resolveResourceRef(runtime: ManifestEditorToolRuntime, resource: ResourceLike): ResourceRef {
  if (!resource || !resource.id) {
    throw toolError("INVALID_INPUT", "A resource reference with an id is required");
  }

  const mapping = runtime.vault.getState().iiif.mapping || {};
  const hintedType = resource.type || mapping[resource.id];

  if (!hintedType) {
    throw toolError("NOT_FOUND", `Resource ${resource.id} was not found`);
  }

  const entity = runtime.vault.get(
    {
      id: resource.id,
      type: hintedType,
    } as any,
    { skipSelfReturn: false } as any,
  ) as any;

  if (!entity) {
    throw toolError("NOT_FOUND", `Resource ${resource.id} was not found`);
  }

  return {
    id: entity.id,
    type: entity.type || hintedType,
  };
}

export function getResource(runtime: ManifestEditorToolRuntime, resource: ResourceLike) {
  const ref = resolveResourceRef(runtime, resource);
  const entity = runtime.vault.get(ref as any, { skipSelfReturn: false } as any);

  if (!entity) {
    throw toolError("NOT_FOUND", `Resource ${ref.id} was not found`);
  }

  return {
    ref,
    entity: entity as any,
  };
}

export function createEditor(
  runtime: ManifestEditorToolRuntime,
  resource: ResourceLike,
  context: { parent?: ResourceRef; parentProperty?: string; index?: number } = {},
) {
  const ref = resolveResourceRef(runtime, resource);
  return new EditorInstance({
    reference: ref as any,
    vault: runtime.vault,
    tracker: createTracker() as any,
    validators: [],
    context: {
      resource: {
        type: "SpecificResource",
        source: ref,
      } as any,
      parent: context.parent as any,
      parentProperty: context.parentProperty,
      index: context.index,
    },
  });
}

export function listVaultResources(
  runtime: ManifestEditorToolRuntime,
  options: {
    types?: string[];
    ids?: string[];
    limit?: number;
  } = {},
) {
  const entities = runtime.vault.getState().iiif.entities || {};
  const wantedTypes = new Set(options.types || []);
  const wantedIds = new Set(options.ids || []);
  const output: Array<Record<string, unknown>> = [];

  for (const bucket of Object.values<any>(entities)) {
    if (!bucket || typeof bucket !== "object") {
      continue;
    }

    for (const resource of Object.values<any>(bucket)) {
      if (!resource || !resource.id || !resource.type) {
        continue;
      }

      if (wantedTypes.size && !wantedTypes.has(resource.type)) {
        continue;
      }

      if (wantedIds.size && !wantedIds.has(resource.id)) {
        continue;
      }

      output.push({
        id: resource.id,
        type: resource.type,
        label: getValue(resource.label) || null,
      });
    }
  }

  output.sort((a, b) => {
    return String(a.id).localeCompare(String(b.id));
  });

  return typeof options.limit === "number" ? output.slice(0, options.limit) : output;
}

export function searchVaultResources(
  runtime: ManifestEditorToolRuntime,
  query: string,
  options: {
    types?: string[];
    limit?: number;
  } = {},
) {
  const q = query.trim().toLowerCase();

  if (!q) {
    return [];
  }

  const all = listVaultResources(runtime, options);
  const matches = all.filter((resource) => {
    return (
      String(resource.id).toLowerCase().includes(q) ||
      String(resource.type).toLowerCase().includes(q) ||
      String(resource.label || "").toLowerCase().includes(q)
    );
  });

  return typeof options.limit === "number" ? matches.slice(0, options.limit) : matches;
}

function getSupportedMeta(resourceType: string) {
  const resolvedType = resolveType(resourceType);
  if ((resources.supported as Record<string, unknown>)[resolvedType]) {
    return resources.getSupported(resolvedType as any);
  }
  if ((resources.supported as Record<string, unknown>)[resourceType]) {
    return resources.getSupported(resourceType as any);
  }
  return {
    all: [],
    allowed: [],
    required: [],
    recommended: [],
    notAllowed: [],
    optional: [],
  };
}

function getListPropertyNames(resourceType: string) {
  const resolvedType = resolveType(resourceType);
  const listProperties = new Set<string>([
    "metadata",
    "thumbnail",
    "provider",
    "seeAlso",
    "service",
    "services",
    "rendering",
    "partOf",
    "supplementary",
    "homepage",
    "logo",
    "items",
    "annotations",
    "structures",
    "body",
  ]);

  if (resolvedType === "Manifest") {
    listProperties.add("structures");
  }

  return Array.from(listProperties).filter((property) => {
    if (property === "body") {
      return resourceType === "Annotation";
    }
    const meta = getSupportedMeta(resourceType);
    return meta.allowed.includes(property as never) || property === "provider";
  });
}

function getCapabilityCategories(meta: ReturnType<typeof getSupportedMeta>) {
  return {
    technical: meta.allowed.filter((property) => property && property !== "id" && property !== "type"),
    descriptive: meta.allowed.filter((property) =>
      [
        "label",
        "summary",
        "metadata",
        "requiredStatement",
        "rights",
        "navDate",
        "language",
        "thumbnail",
        "provider",
        "placeholderCanvas",
        "accompanyingCanvas",
        "value",
      ].includes(property as string),
    ),
    linking: meta.allowed.filter((property) =>
      [
        "seeAlso",
        "service",
        "services",
        "rendering",
        "partOf",
        "start",
        "supplementary",
        "homepage",
        "logo",
      ].includes(property as string),
    ),
    structural: meta.allowed.filter((property) =>
      ["items", "annotations", "structures", "body", "target"].includes(property as string),
    ),
    extensions: meta.allowed.filter((property) =>
      (extensionProperties.all as readonly string[]).includes(property as string),
    ),
  };
}

function getPropertyCategory(property: string) {
  if ((documentation.descriptive as Record<string, unknown>)[property]) {
    return "descriptive" as const;
  }

  if ((documentation.structural as Record<string, unknown>)[property]) {
    return "structural" as const;
  }

  if ((documentation.technical as Record<string, unknown>)[property]) {
    return "technical" as const;
  }

  if ((documentation.linking as Record<string, unknown>)[property]) {
    return "linking" as const;
  }

  if ((extensionProperties.all as readonly string[]).includes(property)) {
    return "extensions" as const;
  }

  return null;
}

function getPropertyStatus(meta: ReturnType<typeof getSupportedMeta>, property: string) {
  if (meta.required.includes(property as never)) {
    return "required" as const;
  }

  if (meta.recommended.includes(property as never)) {
    return "recommended" as const;
  }

  if (meta.optional.includes(property as never)) {
    return "optional" as const;
  }

  if (meta.notAllowed.includes(property as never)) {
    return "notAllowed" as const;
  }

  return null;
}

function getPropertyDocEntry(property: string) {
  if ((documentation.descriptive as Record<string, any>)[property]) {
    return (documentation.descriptive as Record<string, any>)[property];
  }

  if ((documentation.structural as Record<string, any>)[property]) {
    return (documentation.structural as Record<string, any>)[property];
  }

  if ((documentation.technical as Record<string, any>)[property]) {
    return (documentation.technical as Record<string, any>)[property];
  }

  if ((documentation.linking as Record<string, any>)[property]) {
    return (documentation.linking as Record<string, any>)[property];
  }

  return null;
}

function getPropertyDocumentation(meta: ReturnType<typeof getSupportedMeta>) {
  return Object.fromEntries(
    meta.all.map((property) => {
      const propertyName = String(property);
      const docEntry = getPropertyDocEntry(propertyName);
      return [
        propertyName,
        {
          category: getPropertyCategory(propertyName),
          status: getPropertyStatus(meta, propertyName),
          link: docEntry?.link || null,
          summary: docEntry?.summary || null,
        },
      ];
    }),
  );
}

function getPropertyEditors(
  resource: ResourceRef,
  meta: ReturnType<typeof getSupportedMeta>,
  listProperties: string[],
) {
  return Object.fromEntries(
    meta.all.map((property) => {
      const propertyName = String(property);

      if (propertyName === "id" || propertyName === "type") {
        return [
          propertyName,
          {
            editorType: "readOnly",
            preferredTools: [] as string[],
            notes: "Read-only property.",
          },
        ];
      }

      if (propertyName === "metadata") {
        return [
          propertyName,
          {
            editorType: "metadataList",
            preferredTools: ["me_update_metadata"],
            notes: "Metadata is a list of label/value pairs and must be edited with metadata patches.",
          },
        ];
      }

      if (listProperties.includes(propertyName)) {
        return [
          propertyName,
          {
            editorType: "referenceList",
            preferredTools: [] as string[],
            fallbackTools: ["me_add_reference", "me_remove_reference", "me_reorder_references"],
            notes:
              resource.type === "Manifest" && ["items", "structures"].includes(propertyName)
                ? "Prefer curated manifest workflow tools before using raw list mutations."
                : "This is a list property. Use curated workflows first, then fallback list tools only if no curated workflow fits.",
          },
        ];
      }

      return [
        propertyName,
        {
          editorType: "singleValue",
          preferredTools: ["me_update_resource_properties"],
          notes: "Single-value property edited with me_update_resource_properties.",
        },
      ];
    }),
  );
}

function getCreatorFieldGuidance(runtime: ManifestEditorToolRuntime, resource: ResourceRef) {
  const creatorFields: Record<
    string,
    Array<{
      id: string;
      label: string;
      summary: string | null;
      tags: string[];
      targetTypes: string[];
      supports: {
        parentTypes: string[];
        parentFields: string[];
        parentFieldMap: Record<string, string[]>;
        onlyPainting: boolean;
        disallowPainting: boolean;
      };
    }>
  > = {};

  for (const property of getListPropertyNames(resource.type)) {
    const matches = runtime.creators
      .filter((creator) => creatorSupportsProperty(runtime, creator, resource, property))
      .map((creator) => ({
        id: creator.id,
        label: creator.label,
        summary: creator.summary || null,
        tags: creator.tags || [],
        targetTypes: [creator.resourceType, ...(creator.additionalTypes || [])],
        supports: {
          parentTypes: creator.supports.parentTypes || [],
          parentFields: creator.supports.parentFields || [],
          parentFieldMap: creator.supports.parentFieldMap || {},
          onlyPainting: !!creator.supports.onlyPainting,
          disallowPainting: !!creator.supports.disallowPainting,
        },
      }));

    if (matches.length) {
      creatorFields[property] = matches;
    }
  }

  return creatorFields;
}

function getWorkflowHints(resource: ResourceRef) {
  switch (resource.type) {
    case "Manifest":
      return [
        {
          title: "Create a new canvas",
          description: "Use me_create_canvas for creator-backed canvas creation instead of assembling canvases by hand.",
          toolName: "me_create_canvas",
          examples: [
            {
              summary: "Create an empty canvas",
              input: {
                manifest: resource,
                kind: "empty",
                payload: {
                  label: { en: ["Page 1"] },
                  width: 1200,
                  height: 1800,
                },
              },
            },
          ],
        },
        {
          title: "Create a canvas from a IIIF image service",
          description:
            "Use kind image_service and pass a service URL. The tool can resolve the info.json internally, and for multiple services you should repeat the call once per URL.",
          toolName: "me_create_canvas",
          examples: [
            {
              summary: "Single image service canvas",
              input: {
                manifest: resource,
                kind: "image_service",
                payload: {
                  url: "https://example.org/iiif/image-1/info.json",
                  label: { en: ["Page 1"] },
                },
              },
            },
          ],
        },
        {
          title: "Create a top-level range structure",
          description: "Use the existing range workbench semantics to create the initial table of contents structure.",
          toolName: "me_create_top_level_range",
          examples: [
            {
              summary: "Create a default top-level range",
              input: {
                manifest: resource,
              },
            },
          ],
        },
        {
          title: "Add or update manifest metadata",
          description:
            "Use me_update_metadata for metadata arrays. If the user is testing the editor, clearly marked sample metadata is acceptable and should be labelled as test or sample data.",
          toolName: "me_update_metadata",
          examples: [
            {
              summary: "Add synthetic test metadata entries",
              input: {
                resource: resource,
                patches: [
                  {
                    type: "add",
                    label: { en: ["Test field 1"] },
                    value: { en: ["Sample value 1"] },
                  },
                  {
                    type: "add",
                    label: { en: ["Test field 2"] },
                    value: { en: ["Sample value 2"] },
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Create a custom top-level range hierarchy",
          description:
            "When you plan to add named child ranges under a top-level range, set includeInitialChild to false so the top-level range starts empty instead of containing a pre-populated child range of canvases.",
          toolName: "me_create_top_level_range",
          examples: [
            {
              summary: "Create an empty top-level range ready for custom child ranges",
              input: {
                manifest: resource,
                topLevelLabel: { en: ["Contents"] },
                includeInitialChild: false,
              },
            },
          ],
        },
      ];
    case "Canvas":
      return [
        {
          title: "Create an annotation page",
          description: "Add a commentary annotation page before creating non-painting annotations on this canvas.",
          toolName: "me_create_annotation_page",
          examples: [
            {
              summary: "Create an annotation page on the canvas",
              input: {
                parent: resource,
                label: { en: ["Notes"] },
              },
            },
          ],
        },
        {
          title: "Create annotations for this canvas",
          description: "Use me_create_annotation on an annotation page and pass a targetCanvas when needed.",
          toolName: "me_create_annotation",
          examples: [
            {
              summary: "Create an HTML annotation",
              input: {
                annotationPage: { id: "annotation-page-id", type: "AnnotationPage" },
                targetCanvas: resource,
                kind: "html",
                payload: {
                  body: { en: ["<p>Annotation text</p>"] },
                },
              },
            },
          ],
        },
      ];
    case "AnnotationPage":
      return [
        {
          title: "Create annotations inside this page",
          description: "Use me_create_annotation and choose the annotation kind instead of inserting annotation JSON manually.",
          toolName: "me_create_annotation",
          examples: [
            {
              summary: "Create an image service annotation",
              input: {
                annotationPage: resource,
                targetCanvas: { id: "canvas-id", type: "Canvas" },
                kind: "image_service",
                payload: {
                  url: "https://example.org/iiif/image-1/info.json",
                },
              },
            },
          ],
        },
      ];
    case "Range":
      return [
        {
          title: "Create child ranges under this range",
          description:
            "Use me_create_nested_range to add child ranges. If the parent range already contains canvases that should live only inside the new child ranges, move them with me_move_range_items rather than leaving duplicates in both parent and child.",
          toolName: "me_create_nested_range",
          examples: [
            {
              summary: "Create a child range",
              input: {
                parentRange: resource,
                label: { en: ["Cover pages"] },
              },
            },
            {
              summary: "Move canvases from the parent range into the child range",
              input: {
                sourceRange: resource,
                targetRange: { id: "child-range-id", type: "Range" },
                items: [
                  { id: "canvas-1", type: "Canvas" },
                  { id: "canvas-2", type: "Canvas" },
                ],
              },
            },
          ],
        },
      ];
    default:
      return [];
  }
}

const CURATED_TOOLS_BY_TYPE: Record<string, string[]> = {
  Manifest: ["me_create_canvas", "me_create_top_level_range"],
  Canvas: ["me_create_annotation_page", "me_create_annotation"],
  Range: ["me_create_nested_range", "me_move_range_items", "me_split_range", "me_merge_ranges"],
  Annotation: ["me_set_annotation_target"],
  AnnotationPage: ["me_create_annotation"],
};

const EXHIBITION_CURATED_TOOLS_BY_TYPE: Record<string, string[]> = {
  Manifest: ["me_create_exhibition_slide"],
  Canvas: [
    "me_update_exhibition_layout",
    "me_create_exhibition_tour",
    "me_create_exhibition_tour_step",
    "me_reorder_exhibition_tour_steps",
  ],
};

const FALLBACK_TOOLS = [
  "me_create_resource",
  "me_add_reference",
  "me_remove_reference",
  "me_reorder_references",
];

function creatorSupportsProperty(
  runtime: ManifestEditorToolRuntime,
  creator: CreatorDefinition,
  parent: ResourceRef,
  property: string,
) {
  const possibleTypes = [creator.resourceType, ...(creator.additionalTypes || [])];

  for (const targetType of possibleTypes) {
    const matches = matchBasedOnResource(
      {
        type: targetType,
        parent,
        property,
      },
      [creator],
      { vault: runtime.vault },
    );

    if (matches.length) {
      return true;
    }
  }

  return false;
}

export function getCuratedToolNames(runtime: ManifestEditorToolRuntime, resource: ResourceRef) {
  const tools = [...(CURATED_TOOLS_BY_TYPE[resource.type] || [])];

  if (runtime.mode === "exhibition") {
    tools.push(...(EXHIBITION_CURATED_TOOLS_BY_TYPE[resource.type] || []));
  }

  return Array.from(new Set(tools));
}

function getDefaultToolNames(runtime: ManifestEditorToolRuntime, resource: ResourceRef, listProperties: string[]) {
  const tools = ["me_update_resource_properties", ...getCuratedToolNames(runtime, resource)];

  if (listProperties.includes("metadata")) {
    tools.push("me_update_metadata");
  }

  return Array.from(
    new Set(
      tools.filter((toolName) =>
        runtime.registry.some(
          (tool) => tool.name === toolName && (tool.modelExposure || "default") === "default",
        ),
      ),
    ),
  );
}

function getFallbackToolNames(runtime: ManifestEditorToolRuntime, resource: ResourceRef, listProperties: string[]) {
  const tools: string[] = [];

  if (listProperties.some((property) => property !== "metadata")) {
    tools.push("me_add_reference", "me_remove_reference", "me_reorder_references");
  }

  if (resource.type !== "Annotation") {
    tools.push("me_create_resource");
  }

  return Array.from(
    new Set(
      tools.filter((toolName) =>
        runtime.registry.some(
          (tool) =>
            tool.name === toolName &&
            (tool.modelExposure || "default") === "fallback" &&
            FALLBACK_TOOLS.includes(toolName),
        ),
      ),
    ),
  );
}

function getAntiPatterns(resource: ResourceRef) {
  switch (resource.type) {
    case "Manifest":
      return [
        "Do not use generic creator or raw reference-list tools when a curated manifest workflow exists.",
        "Do not build nested range hierarchies by duplicating canvases into both a parent range and its children.",
      ];
    case "Canvas":
      return [
        "Do not insert annotation JSON manually when a curated annotation workflow exists.",
      ];
    case "Range":
      return [
        "Do not leave canvases duplicated in both a parent range and its child ranges unless duplication is explicitly requested.",
      ];
    default:
      return [
        "Prefer curated workflow tools over generic fallback tools whenever both are available.",
      ];
  }
}

export function getResourceCapabilities(runtime: ManifestEditorToolRuntime, resource: ResourceRef) {
  const meta = getSupportedMeta(resource.type);
  const categories = getCapabilityCategories(meta);
  const listProperties = getListPropertyNames(resource.type);
  const creatorFields = getCreatorFieldGuidance(runtime, resource);
  const defaultTools = getDefaultToolNames(runtime, resource, listProperties);
  const fallbackTools = getFallbackToolNames(runtime, resource, listProperties);

  return {
    resource,
    mode: runtime.mode,
    categories,
    readOnlyProperties: ["id", "type"],
    listProperties,
    propertyEditors: getPropertyEditors(resource, meta, listProperties),
    typeDocumentation: (documentation.definedTypes as Record<string, { link: string; summary: string } | undefined>)[
      resource.type
    ] || null,
    propertyDocumentation: getPropertyDocumentation(meta),
    creatorFields,
    creatorIds: Array.from(
      new Set(
        Object.values(creatorFields)
          .flat()
          .map((creator) => creator.id),
      ),
    ),
    defaultTools,
    fallbackTools,
    fallbackPolicy: "Use fallback tools only when no curated or default workflow fits the task.",
    workflowTools: getCuratedToolNames(runtime, resource),
    workflowHints: getWorkflowHints(resource),
    antiPatterns: getAntiPatterns(resource),
  };
}

export function coerceLanguageMap(value: unknown) {
  if (typeof value === "string") {
    return {
      en: [value],
    };
  }

  if (value && typeof value === "object") {
    return value;
  }

  throw toolError("INVALID_INPUT", "A language map or string value is required");
}

export function getSinglePropertyEditor(editor: EditorInstance<any>, property: string) {
  const singleEditors: Record<string, any> = {
    label: editor.descriptive.label,
    summary: editor.descriptive.summary,
    requiredStatement: editor.descriptive.requiredStatement,
    rights: editor.descriptive.rights,
    navDate: editor.descriptive.navDate,
    language: editor.descriptive.language,
    placeholderCanvas: editor.descriptive.placeholderCanvas,
    accompanyingCanvas: editor.descriptive.accompanyingCanvas,
    value: editor.descriptive.value,
    format: editor.technical.format,
    profile: editor.technical.profile,
    height: editor.technical.height,
    width: editor.technical.width,
    duration: editor.technical.duration,
    viewingDirection: editor.technical.viewingDirection,
    behavior: editor.technical.behavior,
    timeMode: editor.technical.timeMode,
    motivation: editor.technical.motivation,
    start: editor.linking.start,
    navPlace: editor.extensions.navPlace,
    textGranularity: editor.extensions.textGranularity,
  };

  return singleEditors[property];
}

export function getListPropertyEditor(editor: EditorInstance<any>, property: string) {
  const listEditors: Record<string, any> = {
    thumbnail: editor.descriptive.thumbnail,
    provider: editor.descriptive.provider,
    metadata: editor.metadata,
    seeAlso: editor.linking.seeAlso,
    service: editor.linking.service,
    services: editor.linking.services,
    rendering: editor.linking.rendering,
    partOf: editor.linking.partOf,
    supplementary: editor.linking.supplementary,
    homepage: editor.linking.homepage,
    logo: editor.linking.logo,
    items: editor.structural.items,
    annotations: editor.structural.annotations,
    structures: editor.structural.structures,
    body: editor.annotation?.body,
  };

  return listEditors[property];
}

export function updateSingleProperties(
  runtime: ManifestEditorToolRuntime,
  resource: ResourceRef,
  patches: PropertyPatch[],
) {
  const editor = createEditor(runtime, resource);
  const meta = getSupportedMeta(resource.type);

  for (const patch of patches) {
    if (patch.property === "id" || patch.property === "type") {
      throw toolError("NOT_ALLOWED", `Property ${patch.property} is read only`);
    }

    if (!meta.allowed.includes(patch.property as never) && patch.property !== "textGranularity") {
      throw toolError("NOT_ALLOWED", `Property ${patch.property} is not allowed on ${resource.type}`);
    }

    const propertyEditor = getSinglePropertyEditor(editor, patch.property);
    const listEditor = getListPropertyEditor(editor, patch.property);

    if (listEditor) {
      throw toolError(
        "NOT_ALLOWED",
        `Property ${patch.property} is list-based and must be edited with a list tool`,
      );
    }

    if (!propertyEditor) {
      throw toolError("NOT_ALLOWED", `Property ${patch.property} is not supported by the headless tools`);
    }

    const value =
      patch.property === "label" || patch.property === "summary" || patch.property === "value"
        ? coerceLanguageMap(patch.value)
        : patch.value;

    propertyEditor.set(value as never);
  }
}

export function updateMetadata(
  runtime: ManifestEditorToolRuntime,
  resource: ResourceRef,
  patches: MetadataPatch[],
) {
  const editor = createEditor(runtime, resource);
  const metadataEditor = editor.metadata;

  for (const patch of patches) {
    switch (patch.type) {
      case "add":
        metadataEditor.add(coerceLanguageMap(patch.label), coerceLanguageMap(patch.value), patch.beforeIndex);
        break;
      case "update":
        metadataEditor.update(patch.index, coerceLanguageMap(patch.label), coerceLanguageMap(patch.value));
        break;
      case "delete":
        metadataEditor.deleteAtIndex(patch.index);
        break;
      case "reorder":
        if (patch.startIndex === patch.endIndex) {
          throw toolError("INVALID_INPUT", "Metadata reorder must move an entry to a different index");
        }
        metadataEditor.reorder(patch.startIndex, patch.endIndex);
        break;
      default:
        throw toolError("INVALID_INPUT", "Unsupported metadata patch");
    }
  }
}

function resolveReferenceIndex(editor: any, reference: ResourceRef) {
  return (editor.getWithoutTracking() || []).findIndex((item: any) => {
    const ref = toRef(item);
    return ref?.id === reference.id;
  });
}

export function addReferenceToList(
  runtime: ManifestEditorToolRuntime,
  resource: ResourceRef,
  property: string,
  reference: ResourceRef,
  index?: number,
) {
  const editor = createEditor(runtime, resource);
  const listEditor = getListPropertyEditor(editor, property);

  if (!listEditor || property === "metadata") {
    throw toolError("NOT_ALLOWED", `Property ${property} is not a reference list`);
  }

  const resolvedReference = resolveResourceRef(runtime, reference);
  const currentLength = (listEditor.getWithoutTracking() || []).length;

  if (typeof index === "number" && index >= 0 && index < currentLength) {
    listEditor.addBefore(index, resolvedReference);
  } else {
    listEditor.add(resolvedReference);
  }
}

export function removeReferenceFromList(
  runtime: ManifestEditorToolRuntime,
  resource: ResourceRef,
  property: string,
  input: {
    index?: number;
    reference?: ResourceRef;
  },
) {
  const editor = createEditor(runtime, resource);
  const listEditor = getListPropertyEditor(editor, property);

  if (!listEditor || property === "metadata") {
    throw toolError("NOT_ALLOWED", `Property ${property} is not a reference list`);
  }

  let index = input.index;
  if (typeof index !== "number" && input.reference) {
    index = resolveReferenceIndex(listEditor, resolveResourceRef(runtime, input.reference));
  }

  if (typeof index !== "number" || index < 0) {
    throw toolError("NOT_FOUND", `Reference was not found in ${property}`);
  }

  listEditor.deleteAtIndex(index);
}

export function reorderReferenceList(
  runtime: ManifestEditorToolRuntime,
  resource: ResourceRef,
  property: string,
  startIndex: number,
  endIndex: number,
) {
  if (startIndex === endIndex) {
    throw toolError("INVALID_INPUT", "Reference reorder must move an item to a different index");
  }

  const editor = createEditor(runtime, resource);
  const listEditor = getListPropertyEditor(editor, property);

  if (!listEditor || property === "metadata") {
    throw toolError("NOT_ALLOWED", `Property ${property} is not a reference list`);
  }

  listEditor.reorder(startIndex, endIndex);
}

export function normaliseCreatedRefs(runtime: ManifestEditorToolRuntime, result: unknown): ResourceRef[] {
  const refs = Array.isArray(result) ? result : [result];
  return refs
    .map((item) => {
      const ref = toRef(item as any);
      if (!ref) {
        return null;
      }
      return resolveResourceRef(runtime, ref);
    })
    .filter(Boolean) as ResourceRef[];
}

export function selectCreator(
  runtime: ManifestEditorToolRuntime,
  input: CreateResourceInput,
) {
  const matches = runtime.creator.matchBasedOnResource({
    type: input.targetType,
    parent: input.parent as any,
    property: input.property,
    filter: input.filter,
    initialData: input.initialData,
    isPainting: input.isPainting,
    onlyReference: input.onlyReference,
  });

  if (input.creatorId) {
    const explicit = matches.find((creator) => creator.id === input.creatorId);
    if (!explicit) {
      throw toolError(
        "UNSUPPORTED_CREATOR",
        `Creator ${input.creatorId} is not supported for ${input.parent.type}.${input.property}`,
        { matches: matches.map((creator) => creator.id) },
      );
    }
    return explicit;
  }

  if (matches.length === 0) {
    throw toolError(
      "UNSUPPORTED_CREATOR",
      `No creators are supported for ${input.parent.type}.${input.property}`,
    );
  }

  if (matches.length > 1) {
    throw toolError(
      "AMBIGUOUS_MATCH",
      `Multiple creators match ${input.parent.type}.${input.property}; choose a creatorId`,
      { matches: matches.map((creator) => creator.id) },
    );
  }

  return matches[0]!;
}

export async function createWithCreator(
  runtime: ManifestEditorToolRuntime,
  input: CreateResourceInput,
) {
  const parent = resolveResourceRef(runtime, input.parent);
  const target = input.target ? resolveResourceRef(runtime, input.target) : undefined;
  const creator = selectCreator(runtime, {
    ...input,
    parent,
    target,
  });

  const result = await runtime.creator.create(creator.id, input.payload || {}, {
    targetType: input.targetType,
    target,
    initialData: input.initialData,
    parent: {
      property: input.property,
      resource: parent,
      atIndex: input.index,
    },
  });

  return {
    creator,
    parent,
    target,
    createdRefs: normaliseCreatedRefs(runtime, result),
  };
}

function getTargetSource(target: any): ResourceRef | null {
  if (!target) {
    return null;
  }

  if (target.source?.id && target.source?.type) {
    return {
      id: target.source.id,
      type: target.source.type,
    };
  }

  if (target.id && target.type) {
    return {
      id: target.id,
      type: target.type,
    };
  }

  return null;
}

export function applySelectorToAnnotation(
  runtime: ManifestEditorToolRuntime,
  annotation: ResourceRef,
  selector: SelectorInput,
  canvas?: ResourceRef,
) {
  const editor = createEditor(runtime, annotation);
  if (!editor.annotation) {
    throw toolError("INVALID_PARENT", `${annotation.id} is not an Annotation`);
  }

  const currentTarget = editor.annotation.target.getWithoutTracking();
  const source = canvas || getTargetSource(currentTarget);

  if (!source) {
    throw toolError("INVALID_PARENT", "A canvas target is required to set an annotation selector");
  }

  if (selector.type === "whole_canvas") {
    editor.annotation.target.set({
      type: "SpecificResource",
      source,
    } as any);
    return;
  }

  if (selector.type === "xywh") {
    if (selector.width <= 0 || selector.height <= 0) {
      throw toolError("INVALID_SELECTOR", "Selector width and height must be greater than zero");
    }
    editor.annotation.target.set({
      type: "SpecificResource",
      source,
      selector: {
        type: "FragmentSelector",
        value: `xywh=${[selector.x, selector.y, selector.width, selector.height].join(",")}`,
      },
    } as any);
    return;
  }

  if (selector.type === "svg") {
    if (!selector.value.trim()) {
      throw toolError("INVALID_SELECTOR", "SVG selector value is required");
    }
    editor.annotation.target.set({
      type: "SpecificResource",
      source,
      selector: {
        type: "SvgSelector",
        value: selector.value,
      },
    } as any);
    return;
  }

  throw toolError("INVALID_SELECTOR", "Unsupported selector input");
}

export function findCanvasForAnnotationPage(runtime: ManifestEditorToolRuntime, annotationPage: ResourceRef) {
  const canvases = listVaultResources(runtime, {
    types: ["Canvas"],
  })
    .map((resource) =>
      resolveResourceRef(runtime, {
        id: String(resource.id),
        type: String(resource.type),
      }),
    )
    .filter((canvas) => {
      const fullCanvas = runtime.vault.get(canvas as any) as any;
      const matchesItems = (fullCanvas?.items || []).some((item: any) => item.id === annotationPage.id);
      const matchesAnnotations = (fullCanvas?.annotations || []).some((item: any) => item.id === annotationPage.id);
      return matchesItems || matchesAnnotations;
    });

  if (canvases.length === 1) {
    return canvases[0]!;
  }

  if (canvases.length > 1) {
    throw toolError(
      "AMBIGUOUS_MATCH",
      `AnnotationPage ${annotationPage.id} belongs to multiple canvases`,
      { canvases },
    );
  }

  return null;
}

export function getManifest(runtime: ManifestEditorToolRuntime) {
  return getResource(runtime, runtime.rootResource).entity;
}

export function getFirstCanvasAnnotationPage(runtime: ManifestEditorToolRuntime, canvas: ResourceRef) {
  const fullCanvas = getResource(runtime, canvas).entity as any;
  const page = fullCanvas.annotations?.[0];
  return page ? resolveResourceRef(runtime, page) : null;
}

export function getRangeTree(runtime: ManifestEditorToolRuntime) {
  const manifest = getManifest(runtime) as any;
  if (!manifest?.structures?.length) {
    return null;
  }

  const helper = createRangeHelper(runtime.vault);
  return helper.rangesToTableOfContentsTree(manifest.structures, undefined, {
    showNoNav: true,
  });
}

export function findRangeNode(
  node: any,
  id: string,
  parent: any = null,
): { node: any; parent: any | null } | null {
  if (!node) {
    return null;
  }

  if (node.id === id) {
    return {
      node,
      parent,
    };
  }

  for (const item of node.items || []) {
    const found = findRangeNode(item, id, node);
    if (found) {
      return found;
    }
  }

  return null;
}

export function findRangeItem(node: any, id: string): any | null {
  if (!node) {
    return null;
  }

  if (node.id === id) {
    return node;
  }

  for (const item of node.items || []) {
    const found = findRangeItem(item, id);
    if (found) {
      return found;
    }
  }

  return null;
}

export function getRangeParentContext(runtime: ManifestEditorToolRuntime, range: ResourceRef) {
  const tree = getRangeTree(runtime);
  if (!tree) {
    throw toolError("INVALID_PARENT", "The manifest does not contain a range tree");
  }

  const found = findRangeNode(tree, range.id);
  if (!found) {
    throw toolError("NOT_FOUND", `Range ${range.id} was not found in the range tree`);
  }

  return {
    tree,
    rangeNode: found.node,
    parentNode: found.parent,
  };
}

export function moveRangeItems(
  runtime: ManifestEditorToolRuntime,
  input: {
    sourceRange: ResourceRef;
    targetRange: ResourceRef;
    items: ResourceRef[];
    index?: number;
  },
) {
  const sourceRange = resolveResourceRef(runtime, input.sourceRange);
  const targetRange = resolveResourceRef(runtime, input.targetRange);
  const sourceEditor = createEditor(runtime, sourceRange).structural.items;
  const targetEditor = createEditor(runtime, targetRange).structural.items;
  const sourceItems = sourceEditor.getWithoutTracking() || [];
  const resolvedItems = input.items.map((item) => resolveResourceRef(runtime, item));

  const sourceIndices = resolvedItems.map((item) => {
    const index = sourceItems.findIndex((candidate: any) => toRef(candidate)?.id === item.id);
    if (index === -1) {
      throw toolError("NOT_FOUND", `Range item ${item.id} was not found in ${sourceRange.id}`);
    }
    return index;
  });

  const selectedItems = sourceIndices.map((index) => sourceItems[index]!);
  const startingIndex =
    typeof input.index === "number"
      ? input.index
      : (targetEditor.getWithoutTracking() || []).length;

  runtime.vault.batch(() => {
    const descendingIndices = [...sourceIndices].sort((a, b) => b - a);
    for (const index of descendingIndices) {
      sourceEditor.deleteAtIndex(index);
    }

    let targetIndex = startingIndex;
    if (sourceRange.id === targetRange.id) {
      const removedBeforeTarget = sourceIndices.filter((index) => index < startingIndex).length;
      targetIndex -= removedBeforeTarget;
    }

    selectedItems.forEach((item, offset) => {
      if (targetIndex + offset >= (targetEditor.getWithoutTracking() || []).length) {
        targetEditor.add(item as any);
      } else {
        targetEditor.addBefore(targetIndex + offset, item as any);
      }
    });
  });
}

export function splitRangeAtItem(
  runtime: ManifestEditorToolRuntime,
  input: {
    range: ResourceRef;
    item: ResourceRef;
    label?: unknown;
  },
) {
  const range = resolveResourceRef(runtime, input.range);
  const { rangeNode, parentNode } = getRangeParentContext(runtime, range);

  if (!parentNode || parentNode.type !== "Range") {
    throw toolError("INVALID_PARENT", "Only nested range items can be split");
  }

  const itemNode = findRangeItem(rangeNode, input.item.id);
  if (!itemNode) {
    throw toolError("NOT_FOUND", `Item ${input.item.id} was not found in range ${range.id}`);
  }

  const rangeEditor = createEditor(runtime, parentNode as ResourceRef).structural.ranges;
  return rangeEditor.splitRange(
    parentNode,
    rangeNode,
    itemNode,
    async (atIndex: number) => {
      const result = await runtime.creator.create(
        "@manifest-editor/range-with-items",
        {
          type: "Range",
          label: input.label ? coerceLanguageMap(input.label) : { en: ["Untitled range"] },
          items: [],
        },
        {
          targetType: "Range",
          parent: {
            property: "items",
            resource: {
              id: parentNode.id,
              type: "Range",
            },
            atIndex,
          },
        },
      );

      const refs = normaliseCreatedRefs(runtime, result);
      const ref = refs[0];
      if (!ref || ref.type !== "Range") {
        throw toolError("INVALID_PARENT", "Range split did not create a nested Range");
      }
      return {
        id: ref.id,
        type: "Range" as const,
      };
    },
  );
}

export function mergeRanges(
  runtime: ManifestEditorToolRuntime,
  input: {
    sourceRange: ResourceRef;
    targetRange: ResourceRef;
    keepSource?: boolean;
  },
) {
  const sourceRange = resolveResourceRef(runtime, input.sourceRange);
  const targetRange = resolveResourceRef(runtime, input.targetRange);
  ensureDistinctRefs(sourceRange, targetRange, "Range merge requires distinct source and target ranges");
  const sourceContext = getRangeParentContext(runtime, sourceRange);
  const targetContext = getRangeParentContext(runtime, targetRange);

  if (!sourceContext.parentNode || sourceContext.parentNode.id !== targetContext.parentNode?.id) {
    throw toolError("INVALID_PARENT", "Ranges must share the same parent to merge");
  }

  const rangeEditor = createEditor(runtime, sourceContext.parentNode as ResourceRef).structural.ranges;
  rangeEditor.mergeRanges(sourceContext.rangeNode, targetContext.rangeNode, input.keepSource);
}

export function buildReferenceResultMessage(refs: ResourceRef[]) {
  if (refs.length === 0) {
    return "No resources were created";
  }
  if (refs.length === 1) {
    return `${refs[0]!.type} ${refs[0]!.id}`;
  }
  return `${refs.length} resources`;
}
