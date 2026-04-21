import { Modal } from "@manifest-editor/components";
import type { BackgroundActionDefinition, BackgroundActionRunContext } from "@manifest-editor/shell";
import { useEffect, useState } from "react";

const resultsEventName = "manifest-preset:demo-background-action-results";

type DemoResult = {
  actionId: string;
  title: string;
  result: unknown;
};

function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);

    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new Error("Action cancelled"));
      },
      { once: true },
    );
  });
}

async function progress(ctx: BackgroundActionRunContext, steps: Array<{ label: string; delay: number }>) {
  for (const step of steps) {
    ctx.setActionStatus("running", step.label);
    await delay(step.delay, ctx.signal);
  }
}

function openDemoResults(actionId: string, title: string, result: unknown) {
  console.info(title, result);

  window.dispatchEvent(
    new CustomEvent<DemoResult>(resultsEventName, {
      detail: { actionId, title, result },
    }),
  );
}

function DemoBackgroundActionResultsModal({ actionId }: { actionId: string }) {
  const [activeResult, setActiveResult] = useState<DemoResult | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<DemoResult>).detail;
      if (detail?.actionId === actionId) {
        setActiveResult(detail);
      }
    };

    window.addEventListener(resultsEventName, listener);
    return () => window.removeEventListener(resultsEventName, listener);
  }, [actionId]);

  if (!activeResult) {
    return null;
  }

  return (
    <Modal title={activeResult.title} onClose={() => setActiveResult(null)} className="max-w-2xl">
      <div className="flex min-h-0 flex-col gap-4 p-4">
        <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
          This is rendered by the action&apos;s always-mounted component, not by the menu.
        </div>
        <pre className="max-h-[55vh] overflow-auto rounded bg-zinc-950 p-4 text-sm text-zinc-50">
          {JSON.stringify(activeResult.result, null, 2)}
        </pre>
      </div>
    </Modal>
  );
}

export const demoBackgroundActions: BackgroundActionDefinition[] = [
  {
    id: "demo-generate-canvas-labels",
    label: "Generate canvas labels...",
    summary: "Demo: simulates a manifest-wide label pass",
    section: "Actions",
    order: 10,
    resourceTypes: ["Manifest"],
    render: () => <DemoBackgroundActionResultsModal actionId="demo-generate-canvas-labels" />,
    run: async (ctx) => {
      ctx.setActionLabel("Generating canvas labels...");
      await progress(ctx, [
        { label: "Scanning canvases", delay: 700 },
        { label: "Generating labels", delay: 900 },
        { label: "Checking suggestions", delay: 600 },
      ]);

      const result = {
        action: "Generate canvas labels",
        target: ctx.target.id,
        suggestedLabels: 12,
      };
      ctx.setResult(result);
      ctx.setResultsAvailable(true);
      return result;
    },
    onResults: (ctx) =>
      openDemoResults(ctx.definition.id, "Generated canvas label suggestions", ctx.instance?.result),
  },
  {
    id: "demo-run-local-ocr",
    label: "Run local OCR",
    summary: "Demo: completes after a short delay",
    section: "Actions",
    order: 20,
    resourceTypes: ["Canvas"],
    render: () => <DemoBackgroundActionResultsModal actionId="demo-run-local-ocr" />,
    run: async (ctx) => {
      ctx.setActionLabel("Running local OCR");
      await progress(ctx, [
        { label: "Preparing image", delay: 500 },
        { label: "Recognising text", delay: 1200 },
        { label: "Packaging annotations", delay: 500 },
      ]);

      return {
        action: "Run local OCR",
        target: ctx.target.id,
        lines: Math.floor(Math.random() * 18) + 3,
      };
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Local OCR result", ctx.instance?.result),
  },
  {
    id: "demo-run-remote-ocr",
    label: "Run remote OCR...",
    summary: "Demo: randomly fails to exercise error state",
    section: "Actions",
    order: 30,
    resourceTypes: ["Manifest"],
    render: () => <DemoBackgroundActionResultsModal actionId="demo-run-remote-ocr" />,
    run: async (ctx) => {
      ctx.setActionLabel("Run remote OCR...");
      await progress(ctx, [
        { label: "Uploading sample payload", delay: 800 },
        { label: "Waiting for remote worker", delay: 1100 },
      ]);

      if (Math.random() < 0.35) {
        throw new Error("Remote OCR service returned a demo failure");
      }

      await progress(ctx, [{ label: "Collecting OCR output", delay: 700 }]);

      const result = {
        action: "Run remote OCR",
        target: ctx.target.id,
        canvasesProcessed: Math.floor(Math.random() * 8) + 1,
      };
      ctx.setResult(result);
      ctx.setResultsAvailable(true);
      return result;
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Remote OCR result", ctx.instance?.result),
  },
  {
    id: "demo-run-segmentation",
    label: "Run segmentation",
    summary: "Demo: long-running canvas action",
    section: "Actions",
    order: 40,
    resourceTypes: ["Canvas"],
    render: () => <DemoBackgroundActionResultsModal actionId="demo-run-segmentation" />,
    run: async (ctx) => {
      ctx.setActionLabel("Running segmentation");
      await progress(ctx, [
        { label: "Loading canvas pixels", delay: 700 },
        { label: "Finding regions", delay: 1100 },
        { label: "Merging candidates", delay: 700 },
        { label: "Finalising regions", delay: 500 },
      ]);

      return {
        action: "Run segmentation",
        target: ctx.target.id,
        regions: Math.floor(Math.random() * 9) + 2,
      };
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Segmentation result", ctx.instance?.result),
  },
];
