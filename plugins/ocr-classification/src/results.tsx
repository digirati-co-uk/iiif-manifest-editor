import { Modal } from "@manifest-editor/components";
import { useEffect, useMemo, useState } from "react";
import type { OcrClassificationActionResult } from "./background-action";
import { formatOcrScore, OCR_DIFFICULTY_CLASSES } from "./ocr-difficulty";

const resultsEventName = "@manifest-editor/ocr-classification:results";

type OcrClassificationResultsEvent = {
  actionId: string;
  result?: OcrClassificationActionResult;
};

export function openOcrClassificationResults(actionId: string, result: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<OcrClassificationResultsEvent>(resultsEventName, {
      detail: {
        actionId,
        result: isOcrClassificationActionResult(result) ? result : undefined,
      },
    }),
  );
}

export function renderOcrClassificationResults(actionId: string) {
  return <OcrClassificationResultsModal actionId={actionId} />;
}

function OcrClassificationResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<OcrClassificationResultsEvent | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<OcrClassificationResultsEvent>).detail;
      if (detail?.actionId === actionId) {
        setActiveResult(detail);
      }
    };

    window.addEventListener(resultsEventName, listener);
    return () => window.removeEventListener(resultsEventName, listener);
  }, [actionId]);

  const result = activeResult?.result;
  const classifiedRows = useMemo(() => result?.classifications.slice(0, 200) || [], [result]);

  if (!activeResult) {
    return null;
  }

  return (
    <Modal title="OCR classification results" onClose={() => setActiveResult(null)} className="max-w-4xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        {!result ? (
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3">No result data is available for this run.</div>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-3">
              <SummaryStat label="Classified" value={`${result.classified}/${result.total}`} />
              <SummaryStat label="Skipped" value={String(result.skipped)} />
              <SummaryStat label="Tags applied" value={String(result.classifications.length)} />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {OCR_DIFFICULTY_CLASSES.map((item) => (
                <div key={item.id} className="rounded border border-zinc-200 bg-white p-3">
                  <div
                    className="inline-flex rounded px-2 py-1 text-xs font-medium"
                    style={{ backgroundColor: item.backgroundColor, color: item.textColor }}
                  >
                    {item.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-zinc-950">{result.counts[item.id] || 0}</div>
                </div>
              ))}
            </div>

            {classifiedRows.length ? (
              <div className="min-h-0 overflow-hidden rounded border border-zinc-200">
                <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900">
                  Classified canvases
                </div>
                <div className="max-h-[45vh] overflow-auto">
                  <table className="w-full table-fixed border-collapse text-left">
                    <thead className="sticky top-0 bg-white text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="w-1/2 border-b border-zinc-200 px-3 py-2 font-medium">Canvas</th>
                        <th className="w-32 border-b border-zinc-200 px-3 py-2 font-medium">Tag</th>
                        <th className="border-b border-zinc-200 px-3 py-2 font-medium">Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classifiedRows.map((item) => (
                        <tr key={item.canvasId} className="border-b border-zinc-100 last:border-0">
                          <td className="truncate px-3 py-2" title={item.canvasId}>
                            {item.canvasId}
                          </td>
                          <td className="px-3 py-2 font-medium text-zinc-900">{item.label}</td>
                          <td className="px-3 py-2 text-xs text-zinc-500">
                            {item.scores.map((score, index) => (
                              <span key={index} className="mr-2 whitespace-nowrap">
                                {OCR_DIFFICULTY_CLASSES[index]?.id || `class-${index}`}: {formatOcrScore(score)}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {result.skippedCanvases.length ? (
              <details className="rounded border border-zinc-200 bg-zinc-50">
                <summary className="cursor-pointer px-3 py-2 font-medium text-zinc-900">
                  Skipped canvases ({result.skippedCanvases.length})
                </summary>
                <div className="max-h-52 overflow-auto border-t border-zinc-200 bg-white">
                  {result.skippedCanvases.map((item) => (
                    <div key={item.canvasId} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                      <div className="truncate font-medium text-zinc-900" title={item.canvasId}>
                        {item.canvasId}
                      </div>
                      <div className="text-xs text-zinc-500">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-200 bg-white p-3">
      <div className="text-xs uppercase text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-950">{value}</div>
    </div>
  );
}

function isOcrClassificationActionResult(result: unknown): result is OcrClassificationActionResult {
  if (!result || typeof result !== "object") {
    return false;
  }

  const candidate = result as Partial<OcrClassificationActionResult>;
  return (
    typeof candidate.total === "number" &&
    Array.isArray(candidate.classifications) &&
    Array.isArray(candidate.skippedCanvases)
  );
}
