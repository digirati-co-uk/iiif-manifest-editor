import {
  addReference,
  batchActions,
  importEntities,
  modifyEntityField,
} from "@iiif/helpers/vault/actions";
import { convertPresentation2 } from "@iiif/parser/presentation-2";

const IS_EXTERNAL = "iiif-parser:isExternal";
const HAS_PART = "iiif-parser:hasPart";
const RESOURCE_TYPES = [
  "Annotation",
  "AnnotationPage",
  "ContentResource",
  "Canvas",
  "Manifest",
  "Range",
];

export type ExternalAnnotationPageReference = {
  key: string;
  canvasId: string;
  canvasLabel: string;
  pageId: string;
  annotationPageIndex: number;
  existingPage?: any;
};

export type LoadedExternalAnnotationPage = {
  reference: ExternalAnnotationPageReference;
  json?: unknown;
  error?: string;
};

export type SkippedExternalAnnotationPage = {
  key: string;
  canvasId: string;
  canvasLabel: string;
  pageId: string;
  reason: string;
};

export type InlineAnnotationPageImport = {
  reference: ExternalAnnotationPageReference;
  page: any;
  annotations: any[];
  skippedAnnotations: number;
  skippedByMotivation: number;
};

export type ExternalAnnotationPageInlinePlan = {
  totalExternalPages: number;
  totalAnnotations: number;
  pages: InlineAnnotationPageImport[];
  skippedPages: SkippedExternalAnnotationPage[];
  warnings: string[];
  errors: string[];
};

export type ExternalAnnotationPageInlineResult = {
  totalExternalPages: number;
  pagesInlined: number;
  canvasesUpdated: number;
  annotationsWritten: number;
  skippedPages: SkippedExternalAnnotationPage[];
  warnings: string[];
};

type EntityBuckets = {
  AnnotationPage: Record<string, any>;
  Annotation: Record<string, any>;
  ContentResource: Record<string, any>;
};

export function findExternalAnnotationPageReferences(
  vault: any,
  canvases: any[],
): ExternalAnnotationPageReference[] {
  const references: ExternalAnnotationPageReference[] = [];

  for (const canvas of canvases) {
    if (!canvas?.id || !Array.isArray(canvas.annotations)) {
      continue;
    }

    canvas.annotations.forEach((annotationPageRef: any, index: number) => {
      const pageId = getResourceId(annotationPageRef);
      if (!pageId) {
        return;
      }

      const existingPage =
        vault.get({ id: pageId, type: "AnnotationPage" }) ||
        vault.get(annotationPageRef) ||
        annotationPageRef;

      if (!isExternalAnnotationPage(existingPage)) {
        return;
      }

      references.push({
        key: `${canvas.id}:annotations:${index}:${pageId}`,
        canvasId: canvas.id,
        canvasLabel: getLabelText(canvas.label) || canvas.id,
        pageId,
        annotationPageIndex: index,
        existingPage,
      });
    });
  }

  return references;
}

export function createExternalAnnotationPageInlinePlan(options: {
  loadedPages: LoadedExternalAnnotationPage[];
  motivationFilter?: string[];
}): ExternalAnnotationPageInlinePlan {
  const pages: InlineAnnotationPageImport[] = [];
  const skippedPages: SkippedExternalAnnotationPage[] = [];
  const warnings: string[] = [];
  const seenPageIds = new Set<string>();
  const motivationFilter = createMotivationFilter(options.motivationFilter);
  let totalAnnotations = 0;

  for (const loaded of options.loadedPages) {
    const { reference } = loaded;

    if (seenPageIds.has(reference.pageId)) {
      skippedPages.push(
        toSkippedPage(
          reference,
          "External annotation page is referenced more than once.",
        ),
      );
      continue;
    }
    seenPageIds.add(reference.pageId);

    if (loaded.error) {
      skippedPages.push(toSkippedPage(reference, loaded.error));
      continue;
    }

    const pageResult = normaliseFetchedAnnotationPage(loaded.json, reference);
    if (pageResult.warning) {
      warnings.push(pageResult.warning);
    }
    if (!pageResult.page) {
      skippedPages.push(toSkippedPage(reference, pageResult.error));
      continue;
    }

    const page = pageResult.page;
    if (!Array.isArray(page.items)) {
      skippedPages.push(
        toSkippedPage(
          reference,
          "Fetched annotation page does not contain an items array.",
        ),
      );
      continue;
    }

    const annotationItems = page.items.filter(
      (item: any) => item?.type === "Annotation",
    );
    const annotations = annotationItems.filter((annotation: any) =>
      annotationMatchesMotivationFilter(annotation, motivationFilter),
    );
    const skippedAnnotations = page.items.length - annotationItems.length;
    const skippedByMotivation = annotationItems.length - annotations.length;

    if (skippedAnnotations) {
      warnings.push(
        `${reference.pageId}: skipped ${skippedAnnotations} non-Annotation item${skippedAnnotations === 1 ? "" : "s"}.`,
      );
    }
    if (skippedByMotivation) {
      warnings.push(
        `${reference.pageId}: skipped ${skippedByMotivation} annotation${skippedByMotivation === 1 ? "" : "s"} outside the selected motivation filter.`,
      );
    }

    if (!annotations.length) {
      skippedPages.push(
        toSkippedPage(
          reference,
          getEmptyPageReason(
            page.items.length,
            annotationItems.length,
            motivationFilter,
          ),
        ),
      );
      continue;
    }

    totalAnnotations += annotations.length;
    pages.push({
      reference,
      page,
      annotations,
      skippedAnnotations,
      skippedByMotivation,
    });
  }

  return {
    totalExternalPages: options.loadedPages.length,
    totalAnnotations,
    pages,
    skippedPages,
    warnings,
    errors: [],
  };
}

export function writeExternalAnnotationPageInlinePlan(
  vault: any,
  plan: ExternalAnnotationPageInlinePlan,
) {
  const entities: EntityBuckets = {
    AnnotationPage: {},
    Annotation: {},
    ContentResource: {},
  };
  const relationshipActions: any[] = [];
  const idFactory = createIdFactory(vault);
  const updatedCanvasIds = new Set<string>();
  let annotationsWritten = 0;

  for (const pageImport of plan.pages) {
    const { reference } = pageImport;
    const pageId = reference.pageId;
    const inlinePage = cloneJson(pageImport.page);

    inlinePage.id = pageId;
    inlinePage.type = "AnnotationPage";
    inlinePage.items = [];
    inlinePage[IS_EXTERNAL] = false;

    if (reference.existingPage?.[HAS_PART]) {
      inlinePage[HAS_PART] = cloneJson(reference.existingPage[HAS_PART]);
    }

    entities.AnnotationPage[pageId] = inlinePage;
    updatedCanvasIds.add(reference.canvasId);
    relationshipActions.push(
      modifyEntityField({
        id: pageId,
        type: "AnnotationPage",
        key: IS_EXTERNAL,
        value: false,
      }),
    );

    for (const sourceAnnotation of pageImport.annotations) {
      const annotation = cloneJson(sourceAnnotation);
      const annotationId = idFactory.preserveOrCreate(
        getResourceId(annotation),
        "Annotation",
        reference.canvasId,
        "external-annotation",
      );
      const bodyResult = normaliseAnnotationBodies(
        annotation.body,
        idFactory,
        reference.canvasId,
        annotationId,
      );

      annotation.id = annotationId;
      annotation.type = "Annotation";
      annotation.body = bodyResult.body;
      annotation.target = rewriteAnnotationTarget(
        annotation.target,
        reference.canvasId,
      );

      Object.assign(entities.ContentResource, bodyResult.entities);
      entities.Annotation[annotationId] = annotation;
      relationshipActions.push(
        addReference({
          id: pageId,
          type: "AnnotationPage",
          key: "items",
          reference: {
            id: annotationId,
            type: "Annotation",
          },
        }),
      );
      annotationsWritten += 1;
    }
  }

  const actions = [
    importEntities({
      entities: removeEmptyEntityBuckets(entities),
    }),
    ...relationshipActions,
  ];

  if (
    relationshipActions.length ||
    Object.values(entities).some((bucket) => Object.keys(bucket).length)
  ) {
    vault.dispatch(batchActions({ actions }));
  }

  return {
    totalExternalPages: plan.totalExternalPages,
    pagesInlined: plan.pages.length,
    canvasesUpdated: updatedCanvasIds.size,
    annotationsWritten,
    skippedPages: plan.skippedPages,
    warnings: plan.warnings,
  } satisfies ExternalAnnotationPageInlineResult;
}

export function rewriteAnnotationTarget(
  target: unknown,
  canvasId: string,
): unknown {
  if (Array.isArray(target)) {
    return target.map((item) => rewriteAnnotationTarget(item, canvasId));
  }

  if (typeof target === "string") {
    return withCanvasId(target, canvasId);
  }

  if (!target || typeof target !== "object") {
    return target;
  }

  const clone = cloneJson(target as any);

  if (typeof clone.source === "string") {
    clone.source = withCanvasId(clone.source, canvasId);
    return clone;
  }

  if (clone.source && typeof clone.source === "object") {
    clone.source = {
      ...clone.source,
      id: canvasId,
      type: clone.source.type || "Canvas",
    };
    return clone;
  }

  if (typeof clone.id === "string") {
    clone.id = withCanvasId(clone.id, canvasId);
  }

  return clone;
}

function isExternalAnnotationPage(page: any) {
  return !!page?.[IS_EXTERNAL];
}

function toSkippedPage(
  reference: ExternalAnnotationPageReference,
  reason: string,
): SkippedExternalAnnotationPage {
  return {
    key: reference.key,
    canvasId: reference.canvasId,
    canvasLabel: reference.canvasLabel,
    pageId: reference.pageId,
    reason,
  };
}

function normaliseFetchedAnnotationPage(
  json: unknown,
  reference: ExternalAnnotationPageReference,
): { page?: any; error: string; warning?: string } {
  if (!json || typeof json !== "object") {
    return { error: "Fetched resource is not a JSON object." };
  }

  const resource = json as any;
  if (resource.type === "AnnotationPage") {
    return { page: resource, error: "" };
  }

  if (isPresentation2AnnotationList(resource)) {
    try {
      const upgraded = convertPresentation2(resource) as any;
      if (upgraded?.type === "AnnotationPage") {
        return {
          page: upgraded,
          error: "",
          warning: `${reference.pageId}: upgraded Presentation 2 sc:AnnotationList to AnnotationPage.`,
        };
      }

      return {
        error: `IIIF upgrade produced ${upgraded?.type || "missing a type"}, not AnnotationPage.`,
      };
    } catch (error) {
      return {
        error: `Unable to upgrade Presentation 2 sc:AnnotationList: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return {
    error: `Fetched resource is ${resource.type || resource["@type"] || "missing a type"}, not AnnotationPage.`,
  };
}

function getEmptyPageReason(
  itemCount: number,
  annotationCount: number,
  motivationFilter: Set<string> | null,
) {
  if (!itemCount) {
    return "Fetched annotation page is empty.";
  }

  if (!annotationCount) {
    return "Fetched annotation page does not contain Annotation items.";
  }

  if (motivationFilter?.size) {
    return `No annotations matched the selected motivation filter (${Array.from(motivationFilter).join(", ")}).`;
  }

  return "Fetched annotation page does not contain importable annotations.";
}

function createMotivationFilter(values: string[] | undefined) {
  const normalised = dedupeStrings(
    (values || []).map(normaliseMotivation).filter(Boolean),
  );
  return normalised.length ? new Set(normalised) : null;
}

function annotationMatchesMotivationFilter(
  annotation: any,
  motivationFilter: Set<string> | null,
) {
  if (!motivationFilter?.size) {
    return true;
  }

  return getAnnotationMotivations(annotation).some((motivation) =>
    motivationFilter.has(motivation),
  );
}

function getAnnotationMotivations(annotation: any) {
  return dedupeStrings(
    toArray(annotation?.motivation).map(normaliseMotivation).filter(Boolean),
  );
}

function normaliseMotivation(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim().toLowerCase();
  const compact = trimmed.includes(":")
    ? trimmed.slice(trimmed.lastIndexOf(":") + 1)
    : trimmed;
  const slashIndex = compact.lastIndexOf("/");
  const hashIndex = compact.lastIndexOf("#");
  const separator = Math.max(slashIndex, hashIndex);
  return separator >= 0 ? compact.slice(separator + 1) : compact;
}

function isPresentation2AnnotationList(resource: any) {
  const type = resource?.["@type"] || resource?.type;
  return type === "sc:AnnotationList" || type === "AnnotationList";
}

function normaliseAnnotationBodies(
  body: unknown,
  idFactory: ReturnType<typeof createIdFactory>,
  canvasId: string,
  annotationId: string,
) {
  const bodyItems =
    typeof body === "undefined" || body === null ? [] : toArray(body);
  const entities: Record<string, any> = {};
  const normalised =
    bodyItems.length > 1 && bodyItems.every(isTextualBodyLike)
      ? [
          normaliseChoiceBody(
            {
              type: "Choice",
              items: bodyItems,
            },
            idFactory,
            canvasId,
            annotationId,
            "body-choice",
            entities,
          ),
        ]
      : bodyItems.map((item, index) =>
          normaliseBodyItem(
            item,
            idFactory,
            canvasId,
            annotationId,
            `body-${index + 1}`,
            entities,
          ),
        );

  return {
    body: normalised,
    entities,
  };
}

function normaliseBodyItem(
  item: unknown,
  idFactory: ReturnType<typeof createIdFactory>,
  canvasId: string,
  annotationId: string,
  seed: string,
  entities: Record<string, any>,
) {
  if (isChoiceBody(item)) {
    return normaliseChoiceBody(
      item,
      idFactory,
      canvasId,
      annotationId,
      seed,
      entities,
    );
  }

  const bodyId = idFactory.preserveOrCreate(
    item && typeof item === "object" ? getResourceId(item) : undefined,
    "ContentResource",
    canvasId,
    `${annotationId}-${seed}`,
  );

  if (typeof item === "string") {
    entities[bodyId] = {
      id: bodyId,
      type: "TextualBody",
      format: "text/plain",
      value: item,
    };
    return { id: bodyId, type: "ContentResource" };
  }

  if (item && typeof item === "object") {
    const resource = normaliseImportedBodyResource(item);
    entities[bodyId] = {
      ...resource,
      id: bodyId,
      type: resource.type || "ContentResource",
    };
    return { id: bodyId, type: "ContentResource" };
  }

  entities[bodyId] = {
    id: bodyId,
    type: "TextualBody",
    format: "text/plain",
    value: String(item),
  };
  return { id: bodyId, type: "ContentResource" };
}

function normaliseChoiceBody(
  choice: any,
  idFactory: ReturnType<typeof createIdFactory>,
  canvasId: string,
  annotationId: string,
  seed: string,
  entities: Record<string, any>,
) {
  const choiceId = idFactory.preserveOrCreate(
    getResourceId(choice),
    "ContentResource",
    canvasId,
    `${annotationId}-${seed}`,
  );
  const items = toArray(choice.items).map((item, index) =>
    normaliseBodyItem(
      item,
      idFactory,
      canvasId,
      annotationId,
      `${seed}-item-${index + 1}`,
      entities,
    ),
  );

  entities[choiceId] = {
    ...cloneJson(choice),
    id: choiceId,
    type: "Choice",
    items,
  };

  return { id: choiceId, type: "ContentResource" };
}

function normaliseImportedBodyResource(item: unknown) {
  const resource = cloneJson(item as any);

  if (
    typeof resource.chars === "string" &&
    typeof resource.value === "undefined"
  ) {
    resource.value = resource.chars;
    delete resource.chars;

    if (resource.type === "Text") {
      resource.type = "TextualBody";
    }
  }

  return resource;
}

function isChoiceBody(item: unknown) {
  return !!item && typeof item === "object" && (item as any).type === "Choice";
}

function isTextualBodyLike(item: unknown) {
  if (typeof item === "string") {
    return true;
  }

  if (!item || typeof item !== "object") {
    return false;
  }

  const type = (item as any).type;
  return type === "TextualBody" || type === "Text";
}

function createIdFactory(vault: any) {
  const used = new Set<string>();
  let counter = 0;

  function isInUse(id: string) {
    if (used.has(id)) {
      return true;
    }

    return RESOURCE_TYPES.some((type) => !!vault.get({ id, type }));
  }

  function create(canvasId: string, type: string, seed: string) {
    let id: string;
    do {
      counter += 1;
      id = `${trimTrailingSlash(canvasId)}/external-annotation-pages/${slugify(type)}/${slugify(seed)}-${counter}`;
    } while (isInUse(id));

    used.add(id);
    return id;
  }

  function preserveOrCreate(
    id: string | undefined,
    type: string,
    canvasId: string,
    seed: string,
  ) {
    if (id && !isInUse(id)) {
      used.add(id);
      return id;
    }

    return create(canvasId, type, seed);
  }

  return { create, preserveOrCreate };
}

function splitTargetId(value: string) {
  const hashIndex = value.indexOf("#");
  return {
    sourceId: hashIndex >= 0 ? value.slice(0, hashIndex) : value,
    fragment: hashIndex >= 0 ? value.slice(hashIndex) : "",
  };
}

function withCanvasId(value: string, canvasId: string) {
  return `${canvasId}${splitTargetId(value).fragment}`;
}

function getResourceId(resource: unknown) {
  if (typeof resource === "string") return resource;
  if (!resource || typeof resource !== "object") return undefined;
  return typeof (resource as any).id === "string"
    ? (resource as any).id
    : typeof (resource as any)["@id"] === "string"
      ? (resource as any)["@id"]
      : undefined;
}

function getLabelTexts(label: unknown): string[] {
  if (!label) return [];
  if (typeof label === "string") return [label];
  if (Array.isArray(label))
    return label.filter((item): item is string => typeof item === "string");
  if (typeof label === "object") {
    return Object.values(label as Record<string, unknown>).flatMap(
      getLabelTexts,
    );
  }
  return [];
}

function getLabelText(label: unknown) {
  return getLabelTexts(label)[0] || "";
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "undefined" || value === null) return [];
  return [value];
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function removeEmptyEntityBuckets(entities: EntityBuckets) {
  return Object.fromEntries(
    Object.entries(entities).filter(([, value]) => Object.keys(value).length),
  );
}
