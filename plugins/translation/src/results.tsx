import { Modal } from "@manifest-editor/components";
import { useEffect, useState } from "react";
import type { TranslationActionResult } from "./types";

const resultsEventName = "@manifest-editor/translation:results";

type TranslationResultsEvent = {
  actionId: string;
  result?: TranslationActionResult;
};

export function openTranslationResults(actionId: string, result: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<TranslationResultsEvent>(resultsEventName, {
      detail: {
        actionId,
        result: result as TranslationActionResult | undefined,
      },
    }),
  );
}

export function renderTranslationResults(actionId: string) {
  return <TranslationResultsModal actionId={actionId} />;
}

function TranslationResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<TranslationActionResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<TranslationResultsEvent>).detail;
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
    <Modal title="Translation results" onClose={() => setActiveResult(null)} className="max-w-4xl">
      <div className="flex min-h-0 flex-col gap-4 p-4 text-sm text-zinc-700">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <ResultStat label="Strings" value={activeResult.total} />
          <ResultStat label="Translated" value={activeResult.translated} />
          <ResultStat label="Applied" value={activeResult.applied} />
          <ResultStat label="Existing" value={activeResult.existing} />
          <ResultStat label="Stale" value={activeResult.stale} />
          <ResultStat label="Skipped" value={activeResult.skipped + activeResult.errors} />
        </div>

        {activeResult.translations.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Translated strings</div>
            <div className="max-h-64 overflow-auto">
              {activeResult.translations.map((item) => (
                <div key={item.key} className="grid gap-1.5 border-b border-zinc-100 px-3 py-2.5 last:border-0">
                  <div className="border-l-2 border-zinc-200 pl-2.5 text-[11px] italic leading-relaxed text-zinc-400 line-clamp-2">{item.sourceText}</div>
                  <div className="text-xs font-medium text-zinc-900 line-clamp-2">{item.translationText}</div>
                  <div className="text-[11px] text-zinc-400">{item.applied} occurrence{item.applied === 1 ? "" : "s"}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeResult.skippedTargets.length ? (
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium">Skipped strings</div>
            <div className="max-h-56 overflow-auto">
              {activeResult.skippedTargets.map((item) => (
                <div key={`${item.key}-${item.reason}`} className="grid gap-1 border-b border-zinc-100 px-3 py-2 last:border-0">
                  <div className="line-clamp-2 font-medium text-zinc-900">{item.sourceText}</div>
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
    <div className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-2">
      <div className="text-base font-semibold text-zinc-900">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</div>
    </div>
  );
}
