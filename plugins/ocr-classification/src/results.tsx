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
  const classifiedRows = useMemo(() => result?.classifications || [], [result]);
  const difficultyRows = useMemo(
    () =>
      result
        ? OCR_DIFFICULTY_CLASSES.map((item) => ({
            ...item,
            count: result.counts?.[item.id] || 0,
          }))
        : [],
    [result],
  );

  if (!activeResult) {
    return null;
  }

  return (
    <Modal title="OCR classification results" onClose={() => setActiveResult(null)} className="max-w-6xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        {!result ? (
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3">No result data is available for this run.</div>
        ) : (
          <>
            <div className="rounded border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase text-zinc-500">Task complete</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-950">
                    Classified {formatNumber(result.classified)} of {formatNumber(result.total)} canvases
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {result.skipped
                      ? `${formatNumber(result.skipped)} ${result.skipped === 1 ? "canvas was" : "canvases were"} skipped. Review the skipped list below before rerunning.`
                      : "Every canvas was classified and tagged."}
                  </div>
                </div>
                <div className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-right">
                  <div className="text-2xl font-semibold text-zinc-950">
                    {formatRatio(result.classified, result.total)}
                  </div>
                  <div className="text-xs uppercase text-zinc-500">Coverage</div>
                </div>
              </div>

              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-zinc-100">
                {result.classified ? (
                  difficultyRows.map((item) =>
                    item.count ? (
                      <div
                        key={item.id}
                        className="h-full"
                        style={{
                          width: `${(item.count / result.classified) * 100}%`,
                          backgroundColor: item.backgroundColor,
                        }}
                      />
                    ) : null,
                  )
                ) : (
                  <div className="h-full w-full bg-zinc-200" />
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {difficultyRows.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-2 py-1"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.backgroundColor }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-zinc-900">{item.label}</span>
                    <span className="text-zinc-500">
                      {formatNumber(item.count)} ({formatRatio(item.count, result.classified)})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
              <SummaryStat label="Total canvases" value={formatNumber(result.total)} />
              <SummaryStat label="Classified" value={formatNumber(result.classified)} />
              <SummaryStat label="Skipped" value={formatNumber(result.skipped)} />
              <SummaryStat label="Tags applied" value={formatNumber(result.classifications.length)} />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {difficultyRows.map((item) => (
                <div key={item.id} className="rounded border border-zinc-200 bg-white p-3">
                  <div
                    className="inline-flex rounded px-2 py-1 text-xs font-medium"
                    style={{ backgroundColor: item.backgroundColor, color: item.textColor }}
                  >
                    {item.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-zinc-950">{formatNumber(item.count)}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {formatRatio(item.count, result.classified)} of classified canvases
                  </div>
                </div>
              ))}
            </div>

            {classifiedRows.length ? (
              <div className="min-h-0 overflow-hidden rounded border border-zinc-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="font-medium text-zinc-900">Classified canvases</div>
                  <div className="text-xs text-zinc-500">
                    Showing all {formatNumber(classifiedRows.length)} classified results
                  </div>
                </div>
                <div className="max-h-[55vh] overflow-auto">
                  <table className="w-full min-w-[820px] border-collapse text-left">
                    <thead className="sticky top-0 bg-white text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="w-14 border-b border-zinc-200 px-3 py-2 font-medium">#</th>
                        <th className="border-b border-zinc-200 px-3 py-2 font-medium">Canvas</th>
                        <th className="w-44 border-b border-zinc-200 px-3 py-2 font-medium">Result</th>
                        <th className="w-28 border-b border-zinc-200 px-3 py-2 font-medium">Confidence</th>
                        <th className="border-b border-zinc-200 px-3 py-2 font-medium">Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classifiedRows.map((item, index) => {
                        const canvasLabel = item.canvasLabel || item.canvasId;
                        return (
                          <tr key={item.canvasId} className="border-b border-zinc-100 last:border-0">
                            <td className="px-3 py-2 align-top text-xs text-zinc-400">{index + 1}</td>
                            <td className="px-3 py-2 align-top" title={item.canvasId}>
                              <div className="font-medium text-zinc-900">{canvasLabel}</div>
                              {canvasLabel !== item.canvasId ? (
                                <div className="mt-0.5 break-all text-xs text-zinc-500">{item.canvasId}</div>
                              ) : null}
                            </td>
                            <td className="px-3 py-2 align-top">
                              <DifficultyBadge tagId={item.tagId} label={item.label} />
                            </td>
                            <td className="px-3 py-2 align-top font-medium text-zinc-900">
                              {formatOcrScore(item.score)}
                            </td>
                            <td className="px-3 py-2 align-top text-xs text-zinc-500">
                              <ScoreList scores={item.scores} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                No canvases were classified. Check the skipped canvases and task logs for details.
              </div>
            )}

            {result.skippedCanvases.length ? (
              <details open className="rounded border border-zinc-200 bg-zinc-50">
                <summary className="cursor-pointer px-3 py-2 font-medium text-zinc-900">
                  Skipped canvases ({result.skippedCanvases.length})
                </summary>
                <div className="max-h-52 overflow-auto border-t border-zinc-200 bg-white">
                  {result.skippedCanvases.map((item) => (
                    <div key={item.canvasId} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                      <div className="font-medium text-zinc-900">{item.canvasLabel || item.canvasId}</div>
                      {item.canvasLabel && item.canvasLabel !== item.canvasId ? (
                        <div className="break-all text-xs text-zinc-500">{item.canvasId}</div>
                      ) : null}
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

function DifficultyBadge({ tagId, label }: { tagId: string; label: string }) {
  const difficultyClass = getDifficultyClass(tagId);

  return (
    <span
      className="inline-flex rounded px-2 py-1 text-xs font-medium"
      style={{
        backgroundColor: difficultyClass?.backgroundColor || "#f4f4f5",
        color: difficultyClass?.textColor || "#18181b",
      }}
    >
      {label}
    </span>
  );
}

function ScoreList({ scores }: { scores: number[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {scores.map((score, index) => (
        <span key={index} className="whitespace-nowrap rounded bg-zinc-100 px-1.5 py-0.5">
          {OCR_DIFFICULTY_CLASSES[index]?.id || `class-${index}`}: {formatOcrScore(score)}
        </span>
      ))}
    </div>
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

function getDifficultyClass(tagId: string) {
  return OCR_DIFFICULTY_CLASSES.find((item) => item.id === tagId);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatRatio(value: number, total: number) {
  return total ? formatOcrScore(value / total) : "0%";
}

function isOcrClassificationActionResult(result: unknown): result is OcrClassificationActionResult {
  if (!result || typeof result !== "object") {
    return false;
  }

  const candidate = result as Partial<OcrClassificationActionResult>;
  return (
    typeof candidate.total === "number" &&
    typeof candidate.classified === "number" &&
    typeof candidate.skipped === "number" &&
    !!candidate.counts &&
    typeof candidate.counts === "object" &&
    Array.isArray(candidate.classifications) &&
    Array.isArray(candidate.skippedCanvases)
  );
}
