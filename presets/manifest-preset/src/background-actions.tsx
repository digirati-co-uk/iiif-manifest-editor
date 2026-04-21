import { Modal } from "@manifest-editor/components";
import type { BackgroundActionDefinition, BackgroundActionRunContext } from "@manifest-editor/shell";
import { useEffect, useState } from "react";

const resultsEventName = "manifest-preset:demo-background-action-results";
const prepareEventName = "manifest-preset:demo-background-action-prepare";

type DemoResult = {
  actionId: string;
  title: string;
  result: unknown;
};

type DemoPrepare = {
  actionId: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
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
  for (const [index, step] of steps.entries()) {
    ctx.setActionStatus("running", step.label);
    ctx.setActionProgress({ current: index, total: steps.length, label: step.label });
    ctx.appendActionLog(step.label, "info", { step: index + 1, total: steps.length });
    await delay(step.delay, ctx.signal);
    ctx.setActionProgress({ current: index + 1, total: steps.length, label: step.label });
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

function requestDemoPrepare(actionId: string, options: Omit<DemoPrepare, "actionId" | "resolve">) {
  return new Promise<boolean>((resolve) => {
    window.dispatchEvent(
      new CustomEvent<DemoPrepare>(prepareEventName, {
        detail: { actionId, resolve, ...options },
      }),
    );
  });
}

function getTargetResource(
  ctx: BackgroundActionRunContext | Parameters<NonNullable<BackgroundActionDefinition["supports"]>>[0],
) {
  return ctx.vault.get(ctx.target as any) as any;
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

function DemoBackgroundActionPrepareModal({ actionId }: { actionId: string }) {
  const [activePrepare, setActivePrepare] = useState<DemoPrepare | null>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<DemoPrepare>).detail;
      if (detail?.actionId === actionId) {
        setActivePrepare(detail);
      }
    };

    window.addEventListener(prepareEventName, listener);
    return () => window.removeEventListener(prepareEventName, listener);
  }, [actionId]);

  if (!activePrepare) {
    return null;
  }

  const close = (value: boolean) => {
    activePrepare.resolve(value);
    setActivePrepare(null);
  };

  return (
    <Modal
      title={activePrepare.title}
      onClose={() => close(false)}
      className="max-w-xl"
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
            onClick={() => close(false)}
          >
            {activePrepare.cancelLabel}
          </button>
          <button
            type="button"
            className="rounded border border-me-primary-500 bg-me-primary-500 px-3 py-2 text-sm text-white"
            onClick={() => close(true)}
          >
            {activePrepare.confirmLabel}
          </button>
        </div>
      }
    >
      <div className="p-4 text-zinc-700">{activePrepare.message}</div>
    </Modal>
  );
}

function DemoBackgroundActionMount({ actionId }: { actionId: string }) {
  return (
    <>
      <DemoBackgroundActionPrepareModal actionId={actionId} />
      <DemoBackgroundActionResultsModal actionId={actionId} />
    </>
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
    resumable: true,
    render: () => <DemoBackgroundActionMount actionId="demo-generate-canvas-labels" />,
    prepare: () => ({
      version: 1,
      tasks: [
        { id: "scan-canvases", label: "Scanning canvases", input: { delay: 700 }, status: "queued" },
        { id: "generate-labels", label: "Generating labels", input: { delay: 900 }, status: "queued" },
        { id: "check-suggestions", label: "Checking suggestions", input: { delay: 600 }, status: "queued" },
      ],
    }),
    run: async (ctx) => {
      ctx.setActionLabel("Generating canvas labels...");
      await ctx.tasks.runEach(async (task) => {
        const delayMs = Number((task.input as { delay?: number } | undefined)?.delay) || 500;
        await delay(delayMs, ctx.signal);
        return {
          taskStatus: "complete",
          result: { label: task.label },
        };
      });

      const result = {
        action: "Generate canvas labels",
        target: ctx.target.id,
        suggestedLabels: 12,
      };
      ctx.setResult(result);
      ctx.setResultsAvailable(true);
      return result;
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Generated canvas label suggestions", ctx.instance?.result),
  },
  {
    id: "demo-run-local-ocr",
    label: "Run local OCR",
    summary: "Demo: completes after a short delay",
    section: "Actions",
    order: 20,
    resourceTypes: ["Canvas"],
    render: () => <DemoBackgroundActionMount actionId="demo-run-local-ocr" />,
    run: async (ctx) => {
      ctx.setActionLabel("Running local OCR");
      ctx.canvasProgress.setStatus(ctx.target, "pending");
      await progress(ctx, [
        { label: "Preparing image", delay: 500 },
        { label: "Recognising text", delay: 1200 },
        { label: "Packaging annotations", delay: 500 },
      ]);
      ctx.canvasProgress.setStatus(ctx.target, "done");

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
    render: () => <DemoBackgroundActionMount actionId="demo-run-remote-ocr" />,
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
    render: () => <DemoBackgroundActionMount actionId="demo-run-segmentation" />,
    run: async (ctx) => {
      ctx.setActionLabel("Running segmentation");
      ctx.canvasProgress.setStatus(ctx.target, "pending");
      await progress(ctx, [
        { label: "Loading canvas pixels", delay: 700 },
        { label: "Finding regions", delay: 1100 },
        { label: "Merging candidates", delay: 700 },
        { label: "Finalising regions", delay: 500 },
      ]);
      ctx.canvasProgress.setStatus(ctx.target, "done");

      return {
        action: "Run segmentation",
        target: ctx.target.id,
        regions: Math.floor(Math.random() * 9) + 2,
      };
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Segmentation result", ctx.instance?.result),
  },
  {
    id: "demo-confirm-bulk-edit",
    label: "Bulk edit labels...",
    summary: "Demo: opens a confirmation modal before running",
    section: "Actions",
    order: 50,
    resourceTypes: ["Manifest"],
    render: () => <DemoBackgroundActionMount actionId="demo-confirm-bulk-edit" />,
    prepare: async (ctx) => {
      return requestDemoPrepare(ctx.definition.id, {
        title: "Bulk edit labels",
        message:
          "This prepare step is rendered by the action's mounted component. Continue to simulate a bulk label edit.",
        confirmLabel: "Run demo",
        cancelLabel: "Cancel",
      });
    },
    run: async (ctx) => {
      ctx.setActionLabel("Bulk editing labels...");
      await progress(ctx, [
        { label: "Collecting existing labels", delay: 700 },
        { label: "Applying label rules", delay: 900 },
        { label: "Preparing preview", delay: 500 },
      ]);

      return {
        action: "Bulk edit labels",
        target: ctx.target.id,
        changedLabels: Math.floor(Math.random() * 15) + 5,
      };
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Bulk label edit preview", ctx.instance?.result),
  },
  {
    id: "demo-audit-manifest-structure",
    label: "Audit manifest structure",
    summary: "Demo: only appears when the manifest has canvases",
    section: "Diagnostics",
    order: 60,
    resourceTypes: ["Manifest"],
    supports: (ctx) => {
      const manifest = getTargetResource(ctx);
      return !!manifest?.items?.length;
    },
    render: () => <DemoBackgroundActionMount actionId="demo-audit-manifest-structure" />,
    run: async (ctx) => {
      const manifest = getTargetResource(ctx);
      ctx.setActionLabel("Auditing manifest structure");
      await progress(ctx, [
        { label: "Checking canvas order", delay: 600 },
        { label: "Checking ranges", delay: 600 },
        { label: "Checking annotation pages", delay: 600 },
      ]);

      return {
        action: "Audit manifest structure",
        target: ctx.target.id,
        canvases: manifest?.items?.length || 0,
        ranges: manifest?.structures?.length || 0,
        warnings: ["Demo warning: first canvas has no OCR annotation page"],
      };
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Manifest structure audit", ctx.instance?.result),
  },
  {
    id: "demo-create-report",
    label: "Create action report",
    summary: "Demo: manually marks results available without returning a value",
    section: "Diagnostics",
    order: 70,
    resourceTypes: ["Manifest"],
    render: () => <DemoBackgroundActionMount actionId="demo-create-report" />,
    run: async (ctx) => {
      ctx.setActionLabel("Creating report");
      await progress(ctx, [
        { label: "Reading manifest state", delay: 500 },
        { label: "Formatting report", delay: 700 },
      ]);

      ctx.setResult({
        action: "Create action report",
        target: ctx.target.id,
        generatedAt: new Date().toISOString(),
        note: "This action returned undefined but explicitly exposed stored results.",
      });
      ctx.setResultsAvailable(true);
    },
    onResults: (ctx) => openDemoResults(ctx.definition.id, "Generated action report", ctx.instance?.result),
  },
  {
    id: "demo-validation-error",
    label: "Validate current canvas",
    summary: "Demo: sets an error through lifecycle helpers",
    section: "Diagnostics",
    order: 80,
    resourceTypes: ["Canvas"],
    render: () => <DemoBackgroundActionMount actionId="demo-validation-error" />,
    run: async (ctx) => {
      ctx.setActionLabel("Validating current canvas");
      ctx.canvasProgress.setStatus(ctx.target, "pending");
      await progress(ctx, [
        { label: "Checking dimensions", delay: 500 },
        { label: "Checking painting annotations", delay: 700 },
      ]);
      ctx.canvasProgress.setStatus(ctx.target, "done");

      ctx.setActionError(new Error("Demo validation failed: canvas is missing OCR annotations"), "Validation failed");
    },
  },
];
