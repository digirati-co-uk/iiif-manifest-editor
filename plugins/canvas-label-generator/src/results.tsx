import { Modal } from "@manifest-editor/components";
import { useEffect, useState } from "react";
import type { CanvasLabelGeneratorActionResult } from "./background-action";

const resultsEventName = "@manifest-editor/canvas-label-generator:results";

type CanvasLabelGeneratorResultsEvent = {
  actionId: string;
  result?: CanvasLabelGeneratorActionResult;
};

export function openCanvasLabelGeneratorResults(actionId: string, result: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CanvasLabelGeneratorResultsEvent>(resultsEventName, {
      detail: {
        actionId,
        result: result as CanvasLabelGeneratorActionResult | undefined,
      },
    }),
  );
}

export function renderCanvasLabelGeneratorResults(actionId: string) {
  return <CanvasLabelGeneratorResultsModal actionId={actionId} />;
}

function CanvasLabelGeneratorResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<CanvasLabelGeneratorActionResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<CanvasLabelGeneratorResultsEvent>).detail;
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
    <Modal title="Canvas label results" onClose={() => setActiveResult(null)} className="max-w-4xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <div className="grid grid-cols-5 gap-2">
          <ResultStat label="Previewed" value={activeResult.previewedChanges} />
          <ResultStat label="Applied" value={activeResult.applied} />
          <ResultStat label="Unchanged" value={activeResult.unchanged} />
          <ResultStat label="Skipped" value={activeResult.skipped} />
          <ResultStat label="Warnings" value={activeResult.warnings} />
        </div>

        {activeResult.changes.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Updated labels</div>
            <div className="max-h-64 overflow-auto">
              {activeResult.changes.map((item) => (
                <div
                  key={item.canvasId}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-zinc-100 px-3 py-2 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs text-zinc-400">{item.canvasId}</div>
                    <div className="truncate text-zinc-500">{item.previousLabel || "Untitled canvas"}</div>
                  </div>
                  <div className="truncate font-medium text-zinc-900">{item.generatedLabel}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeResult.skippedCanvases.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Skipped canvases</div>
            <div className="max-h-56 overflow-auto">
              {activeResult.skippedCanvases.map((item) => (
                <div key={`${item.canvasId}-${item.reason}`} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                  <div className="truncate font-medium text-zinc-900">{item.canvasId}</div>
                  <div className="text-zinc-500">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeResult.warningCanvases.length ? (
          <div className="rounded border border-amber-200 bg-amber-50">
            <div className="border-b border-amber-200 px-3 py-2 font-medium text-amber-900">Warnings</div>
            <div className="max-h-48 overflow-auto">
              {activeResult.warningCanvases.map((item) => (
                <div key={item.canvasId} className="grid gap-1 border-b border-amber-100 px-3 py-2 text-amber-900 last:border-0">
                  <div className="truncate font-medium">{item.canvasId}</div>
                  <div>{item.warnings.join("; ")}</div>
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
