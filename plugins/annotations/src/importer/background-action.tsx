import {
  FLAG_TAG,
  type BackgroundActionDefinition,
  type BackgroundActionRunContext,
  type ManifestEditorTag,
} from "@manifest-editor/shell";
import { BULK_ANNOTATION_IMPORT_ACTION_ID } from "../constants";
import {
  getDefaultRunOptions,
  renderBulkAnnotationImportConfigModal,
  requestBulkAnnotationImportConfig,
  type BulkAnnotationImportRunOptions,
  type BulkAnnotationImportTagOption,
} from "./config-modal";
import {
  createExternalAnnotationPageInlinePlan,
  findExternalAnnotationPageReferences,
  writeExternalAnnotationPageInlinePlan,
  type ExternalAnnotationPageInlineResult,
  type ExternalAnnotationPageReference,
  type LoadedExternalAnnotationPage,
} from "./importer";
import {
  openBulkAnnotationImportResults,
  renderBulkAnnotationImportResults,
} from "./results";

const runOptions = new Map<
  string,
  {
    references: ExternalAnnotationPageReference[];
    options: BulkAnnotationImportRunOptions;
  }
>();

export type BulkAnnotationImportActionDependencies = {
  fetchPage?: (
    pageId: string,
    reference: ExternalAnnotationPageReference,
    ctx: BackgroundActionRunContext,
  ) => Promise<unknown>;
  requestConfig?: (
    ctx: BackgroundActionRunContext,
    references: ExternalAnnotationPageReference[],
    defaults: BulkAnnotationImportRunOptions,
  ) => Promise<BulkAnnotationImportRunOptions | false>;
};

export function createBulkAnnotationImportBackgroundAction(
  dependencies: BulkAnnotationImportActionDependencies = {},
): BackgroundActionDefinition {
  const fetchPage = dependencies.fetchPage || defaultFetchPage;
  const requestConfig = dependencies.requestConfig || defaultRequestConfig;

  return {
    id: BULK_ANNOTATION_IMPORT_ACTION_ID,
    label: "Bulk Annotation Page Importer",
    summary:
      "Load external Canvas annotation pages and make them editable inline",
    section: "Annotations",
    order: 10,
    resourceTypes: ["Manifest"],
    resumable: false,
    render: (ctx) => (
      <>
        {renderBulkAnnotationImportConfigModal(ctx.definition.id)}
        {renderBulkAnnotationImportResults(ctx.definition.id)}
      </>
    ),
    onResults: (ctx) =>
      openBulkAnnotationImportResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) =>
      findExternalAnnotationPageReferences(ctx.vault, getManifestCanvases(ctx))
        .length > 0,
    prepare: async (ctx) => {
      const references = findExternalAnnotationPageReferences(
        ctx.vault,
        getManifestCanvases(ctx),
      );
      if (!references.length) {
        return false;
      }

      const options = await requestConfig(
        ctx,
        references,
        getDefaultRunOptions(),
      );
      if (options === false) {
        return false;
      }

      const selectedReferences = selectReferences(ctx, references, options);
      if (!selectedReferences.length) {
        return false;
      }

      runOptions.set(ctx.instanceKey, {
        references: selectedReferences,
        options,
      });
      return true;
    },
    run: async (ctx) => {
      const prepared = runOptions.get(ctx.instanceKey);
      const options = prepared?.options || getDefaultRunOptions();
      const references =
        prepared?.references ||
        selectReferences(
          ctx,
          findExternalAnnotationPageReferences(
            ctx.vault,
            getManifestCanvases(ctx),
          ),
          options,
        );

      try {
        ctx.setActionLabel("Importing external annotation pages");
        ctx.setActionProgress({
          current: 0,
          total: Math.max(references.length, 1),
          label: "Loading external annotation pages",
        });

        if (!references.length) {
          ctx.setActionStatus("running", "No external annotation pages found");
          return createEmptyResult();
        }

        const loadedPages: LoadedExternalAnnotationPage[] = [];
        for (const [index, reference] of references.entries()) {
          throwIfAborted(ctx.signal);
          ctx.setActionStatus(
            "running",
            `Loading ${index + 1}/${references.length}`,
          );
          ctx.appendActionLog("Loading external annotation page", "info", {
            canvasId: reference.canvasId,
            pageId: reference.pageId,
          });

          try {
            const json = await fetchPage(reference.pageId, reference, ctx);
            loadedPages.push({ reference, json });
          } catch (error) {
            const message = getErrorMessage(error);
            loadedPages.push({ reference, error: message });
            ctx.appendActionLog(
              "Failed to load external annotation page",
              "warn",
              {
                canvasId: reference.canvasId,
                pageId: reference.pageId,
                reason: message,
              },
            );
          }

          ctx.setActionProgress({
            current: index + 1,
            total: references.length,
            label: "Loading external annotation pages",
          });
        }

        const plan = createExternalAnnotationPageInlinePlan({
          loadedPages,
          motivationFilter:
            options.motivationMode === "selected"
              ? options.motivations
              : undefined,
        });
        if (plan.errors.length) {
          throw new Error(
            plan.errors[0] || "External annotation page import failed.",
          );
        }

        ctx.setActionStatus("running", "Writing inline annotation pages");
        ctx.setActionProgress({
          current: 0,
          total: Math.max(plan.totalAnnotations, plan.pages.length, 1),
          label: "Writing inline annotations",
        });

        const result = writeExternalAnnotationPageInlinePlan(ctx.vault, plan);
        ctx.appendActionLog(
          "External annotation page import complete",
          "info",
          {
            pages: result.pagesInlined,
            annotations: result.annotationsWritten,
            skipped: result.skippedPages.length,
          },
        );
        ctx.setActionStatus(
          "running",
          `Imported ${result.pagesInlined}/${result.totalExternalPages} external pages`,
        );
        ctx.setActionProgress({
          current: Math.max(result.annotationsWritten, result.pagesInlined),
          total: Math.max(result.annotationsWritten, result.pagesInlined, 1),
          label: "Import complete",
        });
        return result;
      } finally {
        runOptions.delete(ctx.instanceKey);
      }
    },
  };
}

async function defaultFetchPage(
  pageId: string,
  _reference: ExternalAnnotationPageReference,
  ctx: BackgroundActionRunContext,
) {
  const response = await fetch(pageId, {
    signal: ctx.signal,
    headers: {
      Accept: "application/ld+json, application/json;q=0.9, */*;q=0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${pageId} (${response.status}).`);
  }

  return response.json();
}

async function defaultRequestConfig(
  ctx: BackgroundActionRunContext,
  references: ExternalAnnotationPageReference[],
  defaults: BulkAnnotationImportRunOptions,
) {
  return requestBulkAnnotationImportConfig({
    actionId: ctx.definition.id,
    instanceKey: ctx.instanceKey,
    totalExternalPages: references.length,
    tags: getCanvasTagOptions(ctx, references),
    defaults,
    signal: ctx.signal,
  });
}

function getManifestCanvases(
  ctx: BackgroundActionRunContext | { vault: any; target: unknown },
) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items
    ? (ctx.vault.get(manifest.items) || []).filter(Boolean)
    : [];
}

function selectReferences(
  ctx: BackgroundActionRunContext,
  references: ExternalAnnotationPageReference[],
  options: BulkAnnotationImportRunOptions,
) {
  if (options.scope !== "tag" || !options.tagKey) {
    return references;
  }

  const selectedTag = parseTagKey(options.tagKey);
  if (!selectedTag) {
    return [];
  }

  return references.filter((reference) =>
    ctx.tags.hasTag(
      { id: reference.canvasId, type: "Canvas" },
      selectedTag.type,
      selectedTag.id,
    ),
  );
}

function getCanvasTagOptions(
  ctx: BackgroundActionRunContext,
  references: ExternalAnnotationPageReference[],
): BulkAnnotationImportTagOption[] {
  const tags = new Map<
    string,
    BulkAnnotationImportTagOption & ManifestEditorTag
  >();
  const pageCountByCanvas = new Map<string, number>();

  tags.set(getTagKey(FLAG_TAG), {
    ...FLAG_TAG,
    key: getTagKey(FLAG_TAG),
    canvasCount: 0,
    externalPageCount: 0,
  });

  for (const reference of references) {
    pageCountByCanvas.set(
      reference.canvasId,
      (pageCountByCanvas.get(reference.canvasId) || 0) + 1,
    );
  }

  for (const [canvasId, externalPageCount] of pageCountByCanvas) {
    for (const tag of ctx.tags.getTags({ id: canvasId, type: "Canvas" })) {
      const key = getTagKey(tag);
      const existing = tags.get(key);

      if (existing) {
        existing.canvasCount += 1;
        existing.externalPageCount += externalPageCount;
      } else {
        tags.set(key, {
          ...tag,
          key,
          canvasCount: 1,
          externalPageCount,
        });
      }
    }
  }

  return Array.from(tags.values()).sort((a, b) => {
    if (a.type === FLAG_TAG.type && a.id === FLAG_TAG.id) return -1;
    if (b.type === FLAG_TAG.type && b.id === FLAG_TAG.id) return 1;
    return (
      a.label.localeCompare(b.label) ||
      a.type.localeCompare(b.type) ||
      a.id.localeCompare(b.id)
    );
  });
}

function getTagKey(tag: Pick<ManifestEditorTag, "type" | "id">) {
  return `${tag.type}:${tag.id}`;
}

function parseTagKey(key: string): { type: string; id: string } | null {
  const separator = key.indexOf(":");
  if (separator === -1) {
    return null;
  }

  return {
    type: key.slice(0, separator),
    id: key.slice(separator + 1),
  };
}

function createEmptyResult(): ExternalAnnotationPageInlineResult {
  return {
    totalExternalPages: 0,
    pagesInlined: 0,
    canvasesUpdated: 0,
    annotationsWritten: 0,
    skippedPages: [],
    warnings: [],
  };
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : String(error || "Unknown error");
}
