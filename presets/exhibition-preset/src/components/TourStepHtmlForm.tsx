import { HTMLEditor } from "@manifest-editor/components";
import { useRef, useState } from "react";
import { sanitizeSummaryHtml } from "../right-panels/summary-html";
import { joinTourStepHtml, splitTourStepHtml } from "./tour-step-html";

export function TourStepHtmlForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [initial] = useState(() => splitTourStepHtml(value));
  const valueRef = useRef(value);

  return (
    <TourStepLabelSummaryForm
      label={initial.label ?? ""}
      summary={initial.summary}
      onChange={({ label, summary }) => {
        valueRef.current = joinTourStepHtml(label, summary);
        onChange(valueRef.current);
      }}
    />
  );
}

export function TourStepLabelSummaryForm({
  label: initialLabel,
  summary: initialSummary,
  onChange,
}: {
  label: string;
  summary: string;
  onChange: (value: { label: string; summary: string }) => void;
}) {
  const [label, setLabel] = useState(initialLabel);
  const labelRef = useRef(initialLabel);
  const summaryRef = useRef(initialSummary);

  const update = (nextLabel: string, nextSummary: string) => {
    onChange({ label: nextLabel, summary: nextSummary });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-sm font-medium text-slate-700">
        Label
        <input
          className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-me-primary-400 focus:ring-1 focus:ring-me-primary-100"
          value={label}
          onChange={(event) => {
            const nextLabel = event.currentTarget.value;
            labelRef.current = nextLabel;
            setLabel(nextLabel);
            update(nextLabel, summaryRef.current);
          }}
        />
      </label>
      <div className="block text-sm font-medium text-slate-700">
        Summary
        <div className="mt-1">
          <HTMLEditor
            value={summaryRef.current}
            onChange={(nextSummary) => {
              summaryRef.current = nextSummary;
              update(labelRef.current, nextSummary);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function TourStepHtmlPreview({ value }: { value: string }) {
  const { label, summary } = splitTourStepHtml(value);

  return <TourStepLabelSummaryPreview label={label ?? ""} summary={summary} />;
}

export function TourStepLabelSummaryPreview({
  label,
  summary,
}: {
  label: string;
  summary: string;
}) {
  return (
    <>
      <div className="whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden">
        {label || <span className="opacity-50">Untitled</span>}
      </div>
      <div
        className="exhibition-tour-step-body text-gray-500 text-sm bg-white line-clamp-2 prose-headings:mt-1 prose-headings:mb-1 prose-sm"
        dangerouslySetInnerHTML={{ __html: sanitizeSummaryHtml(summary) }}
      />
    </>
  );
}
