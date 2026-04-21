import type { BackgroundActionDefinition, BackgroundActionRunContext } from "@manifest-editor/shell";
import { BULK_ANNOTATION_IMPORT_ACTION_ID } from "../constants";
import {
  createExternalAnnotationPageInlinePlan,
  findExternalAnnotationPageReferences,
  writeExternalAnnotationPageInlinePlan,
  type ExternalAnnotationPageInlineResult,
  type ExternalAnnotationPageReference,
  type LoadedExternalAnnotationPage,
} from "./importer";
import { openBulkAnnotationImportResults, renderBulkAnnotationImportResults } from "./results";

export type BulkAnnotationImportActionDependencies = {
  fetchPage?: (
    pageId: string,
    reference: ExternalAnnotationPageReference,
    ctx: BackgroundActionRunContext,
  ) => Promise<unknown>;
};

export function createBulkAnnotationImportBackgroundAction(
  dependencies: BulkAnnotationImportActionDependencies = {},
): BackgroundActionDefinition {
  const fetchPage = dependencies.fetchPage || defaultFetchPage;

  return {
    id: BULK_ANNOTATION_IMPORT_ACTION_ID,
    label: "Bulk Annotation Page Importer",
    summary: "Load external Canvas annotation pages and make them editable inline",
    section: "Annotations",
    order: 10,
    resourceTypes: ["Manifest"],
    resumable: false,
    render: (ctx) => renderBulkAnnotationImportResults(ctx.definition.id),
    onResults: (ctx) => openBulkAnnotationImportResults(ctx.definition.id, ctx.instance?.result),
    supports: (ctx) => findExternalAnnotationPageReferences(ctx.vault, getManifestCanvases(ctx)).length > 0,
    prepare: (ctx) => {
      const references = findExternalAnnotationPageReferences(ctx.vault, getManifestCanvases(ctx));
      return references.length > 0;
    },
    run: async (ctx) => {
      const references = findExternalAnnotationPageReferences(ctx.vault, getManifestCanvases(ctx));

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
        ctx.setActionStatus("running", `Loading ${index + 1}/${references.length}`);
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
          ctx.appendActionLog("Failed to load external annotation page", "warn", {
            canvasId: reference.canvasId,
            pageId: reference.pageId,
            reason: message,
          });
        }

        ctx.setActionProgress({
          current: index + 1,
          total: references.length,
          label: "Loading external annotation pages",
        });
      }

      const plan = createExternalAnnotationPageInlinePlan({ loadedPages });
      if (plan.errors.length) {
        throw new Error(plan.errors[0] || "External annotation page import failed.");
      }

      ctx.setActionStatus("running", "Writing inline annotation pages");
      ctx.setActionProgress({
        current: 0,
        total: Math.max(plan.totalAnnotations, plan.pages.length, 1),
        label: "Writing inline annotations",
      });

      const result = writeExternalAnnotationPageInlinePlan(ctx.vault, plan);
      ctx.appendActionLog("External annotation page import complete", "info", {
        pages: result.pagesInlined,
        annotations: result.annotationsWritten,
        skipped: result.skippedPages.length,
      });
      ctx.setActionStatus("running", `Imported ${result.pagesInlined}/${result.totalExternalPages} external pages`);
      ctx.setActionProgress({
        current: Math.max(result.annotationsWritten, result.pagesInlined),
        total: Math.max(result.annotationsWritten, result.pagesInlined, 1),
        label: "Import complete",
      });
      return result;
    },
  };
}

async function defaultFetchPage(pageId: string, _reference: ExternalAnnotationPageReference, ctx: BackgroundActionRunContext) {
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

function getManifestCanvases(ctx: BackgroundActionRunContext | { vault: any; target: unknown }) {
  const manifest = ctx.vault.get(ctx.target as any) as any;
  return manifest?.items ? (ctx.vault.get(manifest.items) || []).filter(Boolean) : [];
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
  return error instanceof Error ? error.message : String(error || "Unknown error");
}
