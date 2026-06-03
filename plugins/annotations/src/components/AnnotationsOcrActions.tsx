import { ActionButton } from "@manifest-editor/components";
import {
  type AvailableBackgroundAction,
  runBackgroundAction,
  useAvailableBackgroundActions,
  useBackgroundActionsStoreApi,
  useCanvasProgressStatus,
} from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";

const OCR_ACTIONS = [
  {
    id: "@manifest-editor/ocr-docling/run-ocr",
    label: "Run Local OCR",
    preparingLabel: "Preparing OCR",
    queuedLabel: "OCR queued",
    pendingLabel: "OCR in progress",
  },
  {
    id: "@manifest-editor/remote-inference/action",
    label: "Run remote OCR",
    preparingLabel: "Preparing local OCR",
    queuedLabel: "OCR queued",
    pendingLabel: "OCR in progress",
  },
  {
    id: "@manifest-editor/remote-inference/structured-output",
    label: "Run structured output",
    preparingLabel: "Preparing structured output",
    queuedLabel: "Structured output queued",
    pendingLabel: "Structured output in progress",
  },
];

export function AnnotationsOcrActions() {
  const store = useBackgroundActionsStoreApi();
  const groups = useAvailableBackgroundActions();
  const canvas = useCanvas();
  const canvasProgressStatus = useCanvasProgressStatus(canvas);
  const actions = groups.flatMap((group) => group.actions);
  const availableActions = OCR_ACTIONS.map((ocrAction) => {
    const action = actions.find((item) => item.definition.id === ocrAction.id);
    return action ? { ...ocrAction, action } : null;
  }).filter(
    (
      item,
    ): item is {
      id: string;
      label: string;
      preparingLabel: string;
      queuedLabel: string;
      pendingLabel: string;
      action: AvailableBackgroundAction;
    } => !!item,
  );

  if (!availableActions.length) {
    return null;
  }

  const activeAction = availableActions.find(({ action }) => {
    const status = action.instance?.status;
    const isBusy = status === "preparing" || status === "running";
    if (!isBusy) return false;

    if (canvasProgressStatus === "queued" || canvasProgressStatus === "pending") {
      return true;
    }

    return action.context.currentCanvas?.id === canvas?.id;
  });

  return (
    <div className="mt-5 flex w-full flex-col items-stretch gap-2 border-t border-gray-200 pt-4">
      <div className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
        OCR and structured output
      </div>
      {activeAction ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
          <div className="font-medium">
            {canvasProgressStatus === "queued"
              ? activeAction.queuedLabel
              : canvasProgressStatus === "pending"
                ? activeAction.pendingLabel
                : activeAction.preparingLabel}
          </div>
          <div className="mt-1 text-xs text-amber-700">
            {activeAction.action.instance?.statusText || activeAction.label}
          </div>
        </div>
      ) : null}
      {activeAction
        ? null
        : availableActions.map(({ id, label, action }) => {
            const busy = action.instance?.status === "preparing" || action.instance?.status === "running";
            return (
              <ActionButton
                key={id}
                large
                isDisabled={busy}
                onPress={() => {
                  if (busy) return;
                  void runBackgroundAction({
                    store,
                    context: action.context,
                    prepareData: { scope: "selected" },
                  });
                }}
              >
                {label}
              </ActionButton>
            );
          })}
    </div>
  );
}
