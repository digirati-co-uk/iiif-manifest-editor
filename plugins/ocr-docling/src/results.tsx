import { Modal } from "@manifest-editor/components";
import { useEffect, useState } from "react";
import type { OcrDoclingActionResult } from "./background-action";

const resultsEventName = "@manifest-editor/ocr-docling:results";

type OcrDoclingResultsEvent = {
  actionId: string;
  result?: OcrDoclingActionResult;
};

export function openOcrDoclingResults(actionId: string, result: unknown) {
  window.dispatchEvent(
    new CustomEvent<OcrDoclingResultsEvent>(resultsEventName, {
      detail: {
        actionId,
        result: result as OcrDoclingActionResult | undefined,
      },
    }),
  );
}

export function renderOcrDoclingResults(actionId: string) {
  return <OcrDoclingResultsModal actionId={actionId} />;
}

function OcrDoclingResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<OcrDoclingActionResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<OcrDoclingResultsEvent>).detail;
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
    <Modal title="Docling OCR results" onClose={() => setActiveResult(null)} className="max-w-3xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <div className="grid grid-cols-4 gap-2">
          <ResultStat label="Selected" value={activeResult.selected} />
          <ResultStat label="Processed" value={activeResult.processed} />
          <ResultStat label="Annotations" value={activeResult.annotations} />
          <ResultStat label="Skipped" value={activeResult.skipped} />
        </div>
        {activeResult.skippedCanvases.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Skipped canvases</div>
            <div className="max-h-64 overflow-auto">
              {activeResult.skippedCanvases.map((item) => (
                <div key={item.canvasId} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                  <div className="truncate font-medium text-zinc-900">{item.canvasId}</div>
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
