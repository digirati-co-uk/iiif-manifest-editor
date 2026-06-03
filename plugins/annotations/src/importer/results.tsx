import { Modal } from "@manifest-editor/components";
import { useEffect, useState } from "react";
import type { ExternalAnnotationPageInlineResult } from "./importer";

const resultsEventName = "@manifest-editor/annotations:bulk-import-results";

type BulkAnnotationImportResultsEvent = {
  actionId: string;
  result?: ExternalAnnotationPageInlineResult;
};

export function openBulkAnnotationImportResults(actionId: string, result: unknown) {
  window.dispatchEvent(
    new CustomEvent<BulkAnnotationImportResultsEvent>(resultsEventName, {
      detail: {
        actionId,
        result: result as ExternalAnnotationPageInlineResult | undefined,
      },
    }),
  );
}

export function renderBulkAnnotationImportResults(actionId: string) {
  return <BulkAnnotationImportResultsModal actionId={actionId} />;
}

function BulkAnnotationImportResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<ExternalAnnotationPageInlineResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<BulkAnnotationImportResultsEvent>).detail;
      if (detail?.actionId === actionId && detail.result) {
        setActiveResult(detail.result);
      }
    };

    window.addEventListener(resultsEventName, listener);
    return () => window.removeEventListener(resultsEventName, listener);
  }, [actionId]);

  if (!activeResult) {
    return null;
  }

  return (
    <Modal title="External annotation page import results" onClose={() => setActiveResult(null)} className="max-w-3xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <div className="grid grid-cols-4 gap-2">
          <ResultStat label="External pages" value={activeResult.totalExternalPages} />
          <ResultStat label="Inlined pages" value={activeResult.pagesInlined} />
          <ResultStat label="Canvases" value={activeResult.canvasesUpdated} />
          <ResultStat label="Annotations" value={activeResult.annotationsWritten} />
        </div>

        {activeResult.warnings.length ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-900">
            {activeResult.warnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        ) : null}

        {activeResult.skippedPages.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Skipped external pages</div>
            <div className="max-h-64 overflow-auto">
              {activeResult.skippedPages.map((item) => (
                <div key={item.key} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                  <div className="truncate font-medium text-zinc-900">{item.pageId}</div>
                  <div className="truncate text-zinc-500">{item.canvasLabel}</div>
                  <div className="text-zinc-500">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xl font-semibold text-zinc-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}
