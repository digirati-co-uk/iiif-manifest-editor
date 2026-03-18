import type { PresentOptionsPayload } from "../types";
import { safeJsonStringify } from "../utils";

function formatToolName(toolName: string) {
  const trimmed = toolName.startsWith("me_") ? toolName.slice(3) : toolName;
  return trimmed
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function isPresentOptionsPayload(value: unknown): value is PresentOptionsPayload {
  return !!value && typeof value === "object" && Array.isArray((value as PresentOptionsPayload).options);
}

function SpinnerIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0 animate-spin text-me-primary-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-me-primary-500" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.354 4.854a.5.5 0 0 0-.708-.708L6.5 9.293 4.354 7.146a.5.5 0 1 0-.708.708l2.5 2.5a.5.5 0 0 0 .708 0l5.5-5.5z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-me-gray-900" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0 text-me-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5.33 3.272a3.5 3.5 0 0 1 4.472 4.473L20.647 18.59l-2.122 2.122L7.68 9.867a3.5 3.5 0 0 1-4.472-4.474L5.444 7.63a1.5 1.5 0 0 0 2.121-2.121zm10.367 1.883l3.182-1.768l1.414 1.415l-1.768 3.182l-1.768.353l-2.12 2.121l-1.415-1.414l2.121-2.121zm-7.071 7.778l2.121 2.122l-4.95 4.95A1.5 1.5 0 0 1 3.58 17.99l.097-.107z" />
    </svg>
  );
}

export function ToolResultRenderer(props: {
  part: any;
  onOpenRef: (ref: { id: string; type: string }) => void;
  onSelectOption: (toolCallId: string, label: string) => void;
  selectedOptionText?: string;
}) {
  const toolName = props.part.type === "dynamic-tool" ? props.part.toolName : props.part.type.replace(/^tool-/, "");

  // ── Present Options (always expanded — these need user interaction) ──
  if (toolName === "present_options") {
    const payload = props.part.output;
    if (!isPresentOptionsPayload(payload)) {
      return null;
    }

    return (
      <div className="max-w-full overflow-hidden py-0.5">
        {payload.prompt ? <p className="mb-1 text-[12px] leading-snug text-me-gray-600">{payload.prompt}</p> : null}
        <div className="flex flex-wrap gap-1">
          {payload.options.map((option) => {
            const selected = props.selectedOptionText === option.label;
            const hasSelection = !!props.selectedOptionText;
            return (
              <button
                key={option.id || option.label}
                type="button"
                disabled={hasSelection}
                onClick={() => props.onSelectOption(props.part.toolCallId, option.label)}
                title={option.description || undefined}
                className={[
                  "max-w-full truncate rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
                  selected
                    ? "bg-me-primary-500 text-white"
                    : hasSelection
                      ? "bg-me-gray-100 text-me-gray-500"
                      : "bg-me-gray-100 text-me-gray-700 hover:bg-me-primary-100 hover:text-me-primary-600",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Tool Result (collapsed by default) ───────────────────────────
  const output = props.part.output;
  const isPending = props.part.state === "input-streaming" || props.part.state === "input-available";
  const isError = props.part.state === "output-error";
  const isToolResult = output && typeof output === "object" && "summary" in output && "ok" in output;

  const hasChangedRefs = isToolResult && Array.isArray(output.changedRefs) && output.changedRefs.length > 0;
  const hasCreatedRefs = isToolResult && Array.isArray(output.createdRefs) && output.createdRefs.length > 0;
  const hasWarnings = isToolResult && Array.isArray(output.warnings) && output.warnings.length > 0;
  const hasData = isToolResult && typeof output.data !== "undefined";
  const hasInput = !!props.part.input;

  const statusIcon = isPending ? <SpinnerIcon /> : isError ? <ErrorIcon /> : <CheckIcon />;
  const statusLabel = isPending ? "Running…" : isError ? "Failed" : "Done";

  // The whole tool call is a single <details> — collapsed by default.
  // When pending, we force it open so the user can see progress.
  return (
    <details open={isPending || undefined} className="max-w-full overflow-hidden rounded bg-me-gray-100">
      {/* Summary row — always visible */}
      <summary className="flex cursor-pointer select-none list-none items-center gap-1.5 px-2 py-1.5 text-[12px] text-me-gray-700 hover:bg-me-gray-300/40 [&::-webkit-details-marker]:hidden">
        <ToolIcon />
        <span className="min-w-0 flex-1 truncate font-medium">{formatToolName(toolName)}</span>
        <span className="shrink-0 text-[12px] text-me-gray-500">{statusLabel}</span>
        {statusIcon}
      </summary>

      {/* Expanded content */}
      <div className="max-w-full overflow-hidden border-t border-me-gray-300/50 px-2 py-1.5">
        {/* Summary text */}
        {isToolResult && output.summary ? (
          <p className="text-[12px] leading-relaxed text-me-gray-900">{output.summary}</p>
        ) : null}

        {/* Error text */}
        {isError && props.part.errorText ? (
          <p className="text-[12px] leading-relaxed text-me-gray-900">{props.part.errorText}</p>
        ) : null}

        {/* Warnings */}
        {hasWarnings ? (
          <div className="mt-1">
            {output.warnings.map((warning: string) => (
              <p key={warning} className="text-[12px] leading-relaxed text-me-gray-700">
                ⚠ {warning}
              </p>
            ))}
          </div>
        ) : null}

        {/* Ref tags */}
        {hasChangedRefs || hasCreatedRefs ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {hasChangedRefs
              ? output.changedRefs.map((ref: { id: string; type: string }) => (
                  <button
                    key={`c:${ref.type}:${ref.id}`}
                    type="button"
                    onClick={() => props.onOpenRef(ref)}
                    className="max-w-full truncate rounded-full bg-white px-1.5 py-px text-[12px] text-me-gray-700 hover:text-me-primary-600"
                  >
                    {ref.type}
                  </button>
                ))
              : null}
            {hasCreatedRefs
              ? output.createdRefs.map((ref: { id: string; type: string }) => (
                  <button
                    key={`n:${ref.type}:${ref.id}`}
                    type="button"
                    onClick={() => props.onOpenRef(ref)}
                    className="max-w-full truncate rounded-full bg-white px-1.5 py-px text-[12px] text-me-primary-600 hover:text-me-primary-500"
                  >
                    + {ref.type}
                  </button>
                ))
              : null}
          </div>
        ) : null}

        {/* Expandable input */}
        {hasInput ? (
          <details className="mt-1 text-[12px] text-me-gray-500">
            <summary className="cursor-pointer select-none hover:text-me-gray-700">Input</summary>
            <pre className="mt-0.5 max-h-24 max-w-full overflow-auto whitespace-pre-wrap break-all rounded bg-white p-1 text-[12px] text-me-gray-700">
              {safeJsonStringify(props.part.input)}
            </pre>
          </details>
        ) : null}

        {/* Expandable data */}
        {hasData ? (
          <details className="mt-0.5 text-[12px] text-me-gray-500">
            <summary className="cursor-pointer select-none hover:text-me-gray-700">Data</summary>
            <pre className="mt-0.5 max-h-24 max-w-full overflow-auto whitespace-pre-wrap break-all rounded bg-white p-1 text-[12px] text-me-gray-700">
              {safeJsonStringify(output.data)}
            </pre>
          </details>
        ) : null}

        {/* Fallback raw output */}
        {!isToolResult && !isPending && !isError && typeof output !== "undefined" ? (
          <details className="mt-0.5 text-[12px] text-me-gray-500">
            <summary className="cursor-pointer select-none hover:text-me-gray-700">Output</summary>
            <pre className="mt-0.5 max-h-24 max-w-full overflow-auto whitespace-pre-wrap break-all rounded bg-white p-1 text-[12px] text-me-gray-700">
              {safeJsonStringify(output)}
            </pre>
          </details>
        ) : null}
      </div>
    </details>
  );
}
